import { describe, expect, it } from 'vitest';
import {
	buildClientDepositDraft,
	buildProtectedBookingPaymentBoundary,
	buildProtectedBookingRevenuePlan,
	getProtectedBookingReplacementResolution,
	getProtectedBookingRevenueReadiness,
	getProtectedCheckoutReadiness
} from './protectedBookingRevenue';

describe('protectedBookingRevenue', () => {
	const confirmedProtectedRequest = {
		bookingRequestId: 77,
		path: 'protected' as const,
		protectedSupportEnabled: true,
		checkoutReady: true,
		finalLessonPriceCents: 36000,
		localSnowServiceFeeCents: 4000,
		currency: 'EUR' as const,
		payoutRecipientType: 'instructor' as const
	};

	const serviceableProtectedCheckout = {
		protectedSupportEnabled: true,
		protectedTotalCents: 40000,
		request: {
			resortSelected: true,
			dateSelected: true,
			timeWindowSelected: true,
			sportSelected: true,
			levelSelected: true,
			participantCount: 2,
			durationMinutes: 180
		},
		serviceability: {
			leadTime: 'safe' as const,
			supplyConfidence: 'fallback_available' as const,
			clientAcceptsSuitableReplacement: true
		}
	};

	it('allows paid protected checkout when LocalSnow can guarantee the lesson outcome without exact instructor confirmation', () => {
		const readiness = getProtectedCheckoutReadiness(serviceableProtectedCheckout);

		expect(readiness).toMatchObject({
			status: 'checkout_ready',
			canCollectPayment: true,
			exactInstructorConfirmationRequiredBeforePayment: false,
			nextAction: 'collect-protected-payment'
		});
		expect(readiness.clientCopy).toContain(
			'Pay the protected booking total now. LocalSnow confirms the requested instructor first; if they cannot serve, LocalSnow finds a suitable replacement or refunds you.'
		);
	});

	it('asks for more details instead of payment when the request is too vague to guarantee', () => {
		const readiness = getProtectedCheckoutReadiness({
			...serviceableProtectedCheckout,
			request: {
				...serviceableProtectedCheckout.request,
				dateSelected: false,
				timeWindowSelected: false
			}
		});

		expect(readiness).toMatchObject({
			status: 'needs_more_details',
			canCollectPayment: false,
			nextAction: 'collect-request-details',
			missingDetails: ['date', 'time window']
		});
	});

	it('blocks payment when LocalSnow cannot responsibly service or replace the request', () => {
		const readiness = getProtectedCheckoutReadiness({
			...serviceableProtectedCheckout,
			serviceability: {
				leadTime: 'too_soon' as const,
				supplyConfidence: 'none' as const,
				clientAcceptsSuitableReplacement: true
			}
		});

		expect(readiness).toMatchObject({
			status: 'not_serviceable',
			canCollectPayment: false,
			nextAction: 'do-not-take-payment'
		});
		expect(readiness.reasons).toEqual([
			'Request is too soon for LocalSnow to guarantee fulfillment.',
			'LocalSnow has no suitable instructor or fallback confidence for this request.'
		]);
	});

	it('blocks payment for free/direct requests', () => {
		const readiness = getProtectedBookingRevenueReadiness({
			...confirmedProtectedRequest,
			path: 'direct'
		});

		expect(readiness.canCreateClientCharge).toBe(false);
		expect(readiness.reason).toContain('free direct');
		expect(readiness.nextAction).toBe('use-direct-payment-between-client-and-instructor');
	});

	it('blocks protected charges until the protected checkout total is ready', () => {
		const readiness = getProtectedBookingRevenueReadiness({
			...confirmedProtectedRequest,
			checkoutReady: false
		});

		expect(readiness.canCreateClientCharge).toBe(false);
		expect(readiness.reason).toContain('checkout total is ready');
		expect(readiness.nextAction).toBe('prepare-checkout-total');
	});

	it('creates a LocalSnow client charge plan without automated instructor payout', () => {
		const plan = buildProtectedBookingRevenuePlan(confirmedProtectedRequest);

		expect(plan.status).toBe('ready');
		expect(plan.chargePlan).toMatchObject({
			bookingRequestId: 77,
			collectionOwner: 'localsnow',
			paymentProvider: 'stripe_checkout',
			currency: 'EUR',
			totalClientChargeCents: 40000,
			payout: {
				mode: 'manual',
				recipientType: 'instructor',
				automation: 'not_started'
			}
		});
		expect(plan.chargePlan?.lineItems).toEqual([
			{ kind: 'lesson_amount', label: 'Confirmed lesson amount', amountCents: 36000 },
			{
				kind: 'localsnow_protection_fee',
				label: 'LocalSnow protected booking support',
				amountCents: 4000
			}
		]);
		expect(plan.chargePlan?.forbiddenAutomation).toEqual([
			'stripe_connect',
			'shared_ledger',
			'automatic_payout'
		]);
	});

	it('keeps school payouts manual too', () => {
		const plan = buildProtectedBookingRevenuePlan({
			...confirmedProtectedRequest,
			payoutRecipientType: 'school'
		});

		expect(plan.chargePlan?.payout).toEqual({
			mode: 'manual',
			recipientType: 'school',
			automation: 'not_started'
		});
		expect(plan.chargePlan?.forbiddenAutomation).toContain('automatic_payout');
		expect(JSON.stringify(plan.chargePlan?.forbiddenAutomation)).not.toContain('instructor');
	});

	it('maps the protected charge plan to the existing client_deposits shape', () => {
		const plan = buildProtectedBookingRevenuePlan(confirmedProtectedRequest);
		const deposit = buildClientDepositDraft({
			plan: plan.chargePlan!,
			clientEmail: 'client@example.com',
			now: new Date('2026-01-10T10:00:00.000Z')
		});

		expect(deposit).toEqual({
			bookingRequestId: 77,
			clientEmail: 'client@example.com',
			amount: '400.00',
			currency: 'EUR',
			status: 'pending',
			expiresAt: new Date('2026-01-12T10:00:00.000Z')
		});
	});

	it('shows a bundled estimate-only protected total before checkout is ready', () => {
		const boundary = buildProtectedBookingPaymentBoundary({
			currency: 'EUR',
			lessonEstimateCents: 36000,
			checkoutReady: false
		});

		expect(boundary).toMatchObject({
			status: 'estimate_only',
			canCollectPayment: false,
			totalClientChargeCents: null,
			clientChargeTiming: 'after_checkout_total_is_ready',
			reviewRequirement: 'client_reviews_protected_booking_total_before_payment',
			clientDisplay: {
				feeDisplayMode: 'bundled_total',
				label: 'Protected booking total',
				displayAmount: 'Calculated before payment'
			}
		});
		const copy = boundary.clientCopy.join(' ');
		expect(copy).toContain('automatically calculated');
		expect(copy).toContain('one protected booking total');
		expect(copy).not.toContain('separate LocalSnow fee');
	});

	it('bundles the client-facing protected total while keeping internal margin accounting', () => {
		const boundary = buildProtectedBookingPaymentBoundary({
			currency: 'EUR',
			lessonEstimateCents: 36000,
			finalLessonPriceCents: 37500,
			localSnowServiceFeeCents: 4500,
			checkoutReady: true
		});

		expect(boundary).toMatchObject({
			status: 'ready_for_payment_review',
			canCollectPayment: true,
			totalClientChargeCents: 42000,
			displayTotalClientCharge: '€420.00',
			clientChargeTiming: 'after_client_reviews_protected_total',
			reviewRequirement: 'client_reviews_protected_booking_total_before_payment',
			clientDisplay: {
				feeDisplayMode: 'bundled_total',
				label: 'Protected booking total',
				displayAmount: '€420.00'
			},
			internalAccounting: {
				instructorNetCents: 37500,
				localSnowMarginCents: 4500
			}
		});
		expect(boundary.lineItems).toEqual([
			{
				kind: 'confirmed_lesson_amount',
				label: 'Instructor net',
				amountCents: 37500,
				displayAmount: '€375.00',
				visibility: 'internal'
			},
			{
				kind: 'localsnow_margin',
				label: 'LocalSnow margin',
				amountCents: 4500,
				displayAmount: '€45.00',
				visibility: 'internal'
			}
		]);
	});

	it('rejects zero or negative final lesson amounts as not chargeable', () => {
		const plan = buildProtectedBookingRevenuePlan({
			...confirmedProtectedRequest,
			finalLessonPriceCents: 0
		});

		expect(plan.status).toBe('blocked');
		expect(plan.reason).toContain('positive final price');
		expect(plan.chargePlan).toBeNull();
	});

	it('rejects negative LocalSnow service fees instead of silently normalizing them', () => {
		const readiness = getProtectedBookingRevenueReadiness({
			...confirmedProtectedRequest,
			localSnowServiceFeeCents: -100
		});
		expect(readiness.canCreateClientCharge).toBe(false);
		expect(readiness.reason).toContain('non-negative LocalSnow service fee');
		expect(readiness.nextAction).toBe('set-nonnegative-service-fee');

		const plan = buildProtectedBookingRevenuePlan({
			...confirmedProtectedRequest,
			localSnowServiceFeeCents: -100
		});
		expect(plan.status).toBe('blocked');
		expect(plan.chargePlan).toBeNull();
	});

	it('locks the paid guarantee to desired lesson fulfillment, not exact instructor certainty', () => {
		const plan = buildProtectedBookingRevenuePlan(confirmedProtectedRequest);

		expect(plan.chargePlan?.customerPromise).toEqual({
			kind: 'reschedule-replace-or-refund',
			copy: 'LocalSnow confirms the requested instructor first; if they cannot serve, LocalSnow finds a suitable replacement or refunds the client.',
			replacementPricePolicy: 'client_approval_required_for_price_increase'
		});
	});

	it('requires client approval before moving to a more expensive replacement instructor', () => {
		const resolution = getProtectedBookingReplacementResolution({
			paidClientChargeCents: 40000,
			sameInstructorCanReschedule: false,
			replacementInstructorAvailable: true,
			replacementClientChargeCents: 45000,
			clientApprovedPriceIncrease: false
		});

		expect(resolution.action).toBe('ask-client-to-approve-price-increase');
		expect(resolution.canProceedWithoutClientDecision).toBe(false);
		expect(resolution.clientPriceDeltaCents).toBe(5000);
		expect(resolution.clientCopy).toContain('approve the difference');
	});

	it('refunds when no suitable reschedule or replacement exists', () => {
		const resolution = getProtectedBookingReplacementResolution({
			paidClientChargeCents: 40000,
			sameInstructorCanReschedule: false,
			replacementInstructorAvailable: false
		});

		expect(resolution.action).toBe('refund-client');
		expect(resolution.canProceedWithoutClientDecision).toBe(true);
		expect(resolution.clientCopy).toContain('refund');
	});
});
