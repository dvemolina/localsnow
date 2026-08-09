import { describe, expect, it } from 'vitest';
import {
	buildClientDepositDraft,
	buildProtectedBookingRevenuePlan,
	getProtectedBookingReplacementResolution,
	getProtectedBookingRevenueReadiness
} from './protectedBookingRevenue';

describe('protectedBookingRevenue', () => {
	const confirmedProtectedRequest = {
		bookingRequestId: 77,
		path: 'protected' as const,
		protectedSupportEnabled: true,
		instructorConfirmedFinalTerms: true,
		finalLessonPriceCents: 36000,
		localSnowServiceFeeCents: 4000,
		currency: 'EUR' as const,
		payoutRecipientType: 'instructor' as const
	};

	it('blocks payment for free/direct requests', () => {
		const readiness = getProtectedBookingRevenueReadiness({
			...confirmedProtectedRequest,
			path: 'direct'
		});

		expect(readiness.canCreateClientCharge).toBe(false);
		expect(readiness.reason).toContain('free direct');
		expect(readiness.nextAction).toBe('use-direct-payment-between-client-and-instructor');
	});

	it('blocks protected charges until the instructor confirms final lesson terms', () => {
		const readiness = getProtectedBookingRevenueReadiness({
			...confirmedProtectedRequest,
			instructorConfirmedFinalTerms: false
		});

		expect(readiness.canCreateClientCharge).toBe(false);
		expect(readiness.reason).toContain('final lesson terms');
		expect(readiness.nextAction).toBe('confirm-final-lesson-terms');
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

	it('locks the protected promise to reschedule, replace, or refund', () => {
		const plan = buildProtectedBookingRevenuePlan(confirmedProtectedRequest);

		expect(plan.chargePlan?.customerPromise).toEqual({
			kind: 'reschedule-replace-or-refund',
			copy: 'LocalSnow reschedules, finds another suitable instructor, or refunds the client.',
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
