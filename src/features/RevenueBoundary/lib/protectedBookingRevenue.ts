export type BookingRevenuePath = 'direct' | 'protected';
export type PayoutRecipientType = 'instructor' | 'school';
export type CurrencyCode = 'EUR';

export type ProtectedBookingRevenueInput = {
	bookingRequestId: number;
	path: BookingRevenuePath;
	protectedSupportEnabled: boolean;
	checkoutReady: boolean;
	finalLessonPriceCents: number;
	localSnowServiceFeeCents: number;
	currency: CurrencyCode;
	payoutRecipientType: PayoutRecipientType;
};

export type ProtectedBookingRevenueReadiness = {
	canCreateClientCharge: boolean;
	reason: string;
	nextAction:
		| 'use-direct-payment-between-client-and-instructor'
		| 'enable-protected-support'
		| 'prepare-checkout-total'
		| 'set-positive-final-price'
		| 'set-nonnegative-service-fee'
		| 'create-localsnow-client-charge';
};

export type ProtectedBookingLineItem =
	| {
			kind: 'lesson_amount';
			label: 'Confirmed lesson amount';
			amountCents: number;
	  }
	| {
			kind: 'localsnow_protection_fee';
			label: 'LocalSnow protected booking support';
			amountCents: number;
	  };

export type ForbiddenPaymentAutomation = 'stripe_connect' | 'shared_ledger' | 'automatic_payout';

export type ProtectedBookingCustomerPromise = {
	kind: 'reschedule-replace-or-refund';
	copy: string;
	replacementPricePolicy: 'client_approval_required_for_price_increase';
};

export type ProtectedBookingChargePlan = {
	bookingRequestId: number;
	collectionOwner: 'localsnow';
	paymentProvider: 'stripe_checkout';
	currency: CurrencyCode;
	totalClientChargeCents: number;
	lineItems: ProtectedBookingLineItem[];
	customerPromise: ProtectedBookingCustomerPromise;
	payout: {
		mode: 'manual';
		recipientType: PayoutRecipientType;
		automation: 'not_started';
	};
	forbiddenAutomation: ForbiddenPaymentAutomation[];
};

export type ClientDepositDraft = {
	bookingRequestId: number;
	clientEmail: string;
	amount: string;
	currency: CurrencyCode;
	status: 'pending';
	expiresAt: Date;
};

export type ProtectedBookingReplacementResolutionInput = {
	paidClientChargeCents: number;
	sameInstructorCanReschedule: boolean;
	replacementInstructorAvailable: boolean;
	replacementClientChargeCents?: number;
	clientApprovedPriceIncrease?: boolean;
};

export type ProtectedBookingReplacementResolution = {
	action:
		| 'reschedule-same-instructor'
		| 'offer-replacement-without-price-increase'
		| 'ask-client-to-approve-price-increase'
		| 'replace-after-client-approved-price-increase'
		| 'refund-client';
	canProceedWithoutClientDecision: boolean;
	clientPriceDeltaCents: number;
	clientCopy: string;
};

export type ProtectedBookingPaymentBoundaryInput = {
	currency: CurrencyCode;
	lessonEstimateCents: number;
	checkoutReady: boolean;
	finalLessonPriceCents?: number;
	localSnowServiceFeeCents?: number;
};

export type ProtectedBookingPaymentBoundaryLineItem =
	| {
			kind: 'estimated_lesson_amount' | 'confirmed_lesson_amount';
			label: 'Estimated lesson amount' | 'Instructor net';
			amountCents: number;
			displayAmount: string;
			visibility: 'client' | 'internal';
	  }
	| {
			kind: 'localsnow_margin';
			label: 'LocalSnow margin';
			amountCents: number;
			displayAmount: string;
			visibility: 'internal';
	  };

export type ProtectedBookingClientDisplay = {
	feeDisplayMode: 'bundled_total';
	label: 'Protected booking total';
	displayAmount: string;
};

export type ProtectedBookingInternalAccounting = {
	instructorNetCents: number;
	localSnowMarginCents: number;
};

export type ProtectedBookingPaymentBoundary = {
	status: 'estimate_only' | 'ready_for_payment_review';
	canCollectPayment: boolean;
	currency: CurrencyCode;
	lineItems: ProtectedBookingPaymentBoundaryLineItem[];
	totalClientChargeCents: number | null;
	displayTotalClientCharge: string;
	clientDisplay: ProtectedBookingClientDisplay;
	internalAccounting: ProtectedBookingInternalAccounting | null;
	clientChargeTiming: 'after_checkout_total_is_ready' | 'after_client_reviews_protected_total';
	reviewRequirement: 'client_reviews_protected_booking_total_before_payment';
	clientCopy: string[];
};

export type ProtectedCheckoutReadinessInput = {
	protectedSupportEnabled: boolean;
	protectedTotalCents?: number;
	request: {
		resortSelected: boolean;
		dateSelected: boolean;
		timeWindowSelected: boolean;
		sportSelected: boolean;
		levelSelected: boolean;
		participantCount: number;
		durationMinutes: number;
	};
	serviceability: {
		leadTime: 'safe' | 'too_soon';
		supplyConfidence: 'exact_instructor_available' | 'fallback_available' | 'unknown' | 'none';
		clientAcceptsSuitableReplacement: boolean;
	};
};

export type ProtectedCheckoutReadiness =
	| {
			status: 'checkout_ready';
			canCollectPayment: true;
			exactInstructorConfirmationRequiredBeforePayment: false;
			nextAction: 'collect-protected-payment';
			clientCopy: string;
			missingDetails: [];
			reasons: [];
	  }
	| {
			status: 'needs_more_details';
			canCollectPayment: false;
			exactInstructorConfirmationRequiredBeforePayment: false;
			nextAction: 'collect-request-details';
			clientCopy: string;
			missingDetails: string[];
			reasons: [];
	  }
	| {
			status: 'not_serviceable';
			canCollectPayment: false;
			exactInstructorConfirmationRequiredBeforePayment: false;
			nextAction: 'do-not-take-payment';
			clientCopy: string;
			missingDetails: [];
			reasons: string[];
	  };

export function getProtectedCheckoutReadiness(
	input: ProtectedCheckoutReadinessInput
): ProtectedCheckoutReadiness {
	if (!input.protectedSupportEnabled) {
		return {
			status: 'not_serviceable',
			canCollectPayment: false,
			exactInstructorConfirmationRequiredBeforePayment: false,
			nextAction: 'do-not-take-payment',
			clientCopy: 'Protected booking is not available for this request yet.',
			missingDetails: [],
			reasons: ['Protected booking is not enabled for this instructor or request.']
		};
	}

	const missingDetails = getProtectedCheckoutMissingDetails(input);
	if (
		missingDetails.length > 0 ||
		input.protectedTotalCents == null ||
		input.protectedTotalCents <= 0
	) {
		return {
			status: 'needs_more_details',
			canCollectPayment: false,
			exactInstructorConfirmationRequiredBeforePayment: false,
			nextAction: 'collect-request-details',
			clientCopy:
				'Add the lesson details so LocalSnow can calculate the protected booking total before payment.',
			missingDetails,
			reasons: []
		};
	}

	const reasons = getProtectedCheckoutServiceabilityReasons(input);
	if (reasons.length > 0) {
		return {
			status: 'not_serviceable',
			canCollectPayment: false,
			exactInstructorConfirmationRequiredBeforePayment: false,
			nextAction: 'do-not-take-payment',
			clientCopy: 'Protected booking is not available for this request yet.',
			missingDetails: [],
			reasons
		};
	}

	return {
		status: 'checkout_ready',
		canCollectPayment: true,
		exactInstructorConfirmationRequiredBeforePayment: false,
		nextAction: 'collect-protected-payment',
		clientCopy:
			'Pay the protected booking total now. LocalSnow confirms the requested instructor first; if they cannot serve, LocalSnow finds a suitable replacement or refunds you.',
		missingDetails: [],
		reasons: []
	};
}

function getProtectedCheckoutMissingDetails(input: ProtectedCheckoutReadinessInput): string[] {
	const missingDetails: string[] = [];

	if (!input.request.resortSelected) missingDetails.push('resort');
	if (!input.request.dateSelected) missingDetails.push('date');
	if (!input.request.timeWindowSelected) missingDetails.push('time window');
	if (!input.request.sportSelected) missingDetails.push('sport');
	if (!input.request.levelSelected) missingDetails.push('level');
	if (input.request.participantCount <= 0) missingDetails.push('participants');
	if (input.request.durationMinutes <= 0) missingDetails.push('duration');
	if (input.protectedTotalCents == null || input.protectedTotalCents <= 0) {
		missingDetails.push('protected booking total');
	}

	return missingDetails;
}

function getProtectedCheckoutServiceabilityReasons(
	input: ProtectedCheckoutReadinessInput
): string[] {
	const reasons: string[] = [];

	if (input.serviceability.leadTime === 'too_soon') {
		reasons.push('Request is too soon for LocalSnow to guarantee fulfillment.');
	}

	if (input.serviceability.supplyConfidence === 'none') {
		reasons.push('LocalSnow has no suitable instructor or fallback confidence for this request.');
	}

	if (input.serviceability.supplyConfidence === 'unknown') {
		reasons.push('LocalSnow does not yet know whether this request is serviceable.');
	}

	if (!input.serviceability.clientAcceptsSuitableReplacement) {
		reasons.push('Client must accept that LocalSnow may use a suitable replacement instructor.');
	}

	return reasons;
}

export function getProtectedBookingRevenueReadiness(
	input: ProtectedBookingRevenueInput
): ProtectedBookingRevenueReadiness {
	if (input.path === 'direct') {
		return {
			canCreateClientCharge: false,
			reason: 'The free direct request path keeps payment between client and instructor.',
			nextAction: 'use-direct-payment-between-client-and-instructor'
		};
	}

	if (!input.protectedSupportEnabled) {
		return {
			canCreateClientCharge: false,
			reason:
				'Protected support must be enabled for this request before LocalSnow creates a client charge.',
			nextAction: 'enable-protected-support'
		};
	}

	if (!input.checkoutReady) {
		return {
			canCreateClientCharge: false,
			reason: 'LocalSnow should not charge until the protected booking checkout total is ready.',
			nextAction: 'prepare-checkout-total'
		};
	}

	if (input.finalLessonPriceCents <= 0) {
		return {
			canCreateClientCharge: false,
			reason:
				'A positive final price is required before a protected booking charge can be created.',
			nextAction: 'set-positive-final-price'
		};
	}

	if (input.localSnowServiceFeeCents < 0) {
		return {
			canCreateClientCharge: false,
			reason:
				'A non-negative LocalSnow service fee is required before a protected booking charge can be created.',
			nextAction: 'set-nonnegative-service-fee'
		};
	}

	return {
		canCreateClientCharge: true,
		reason:
			'Protected booking can create a LocalSnow-owned client charge with manual payout follow-up.',
		nextAction: 'create-localsnow-client-charge'
	};
}

export function buildProtectedBookingRevenuePlan(
	input: ProtectedBookingRevenueInput
):
	| { status: 'ready'; reason: null; chargePlan: ProtectedBookingChargePlan }
	| { status: 'blocked'; reason: string; chargePlan: null } {
	const readiness = getProtectedBookingRevenueReadiness(input);

	if (!readiness.canCreateClientCharge) {
		return {
			status: 'blocked',
			reason: readiness.reason,
			chargePlan: null
		};
	}

	const lineItems: ProtectedBookingLineItem[] = [
		{
			kind: 'lesson_amount',
			label: 'Confirmed lesson amount',
			amountCents: input.finalLessonPriceCents
		},
		{
			kind: 'localsnow_protection_fee',
			label: 'LocalSnow protected booking support',
			amountCents: input.localSnowServiceFeeCents
		}
	];

	return {
		status: 'ready',
		reason: null,
		chargePlan: {
			bookingRequestId: input.bookingRequestId,
			collectionOwner: 'localsnow',
			paymentProvider: 'stripe_checkout',
			currency: input.currency,
			totalClientChargeCents: lineItems.reduce((total, item) => total + item.amountCents, 0),
			lineItems,
			customerPromise: {
				kind: 'reschedule-replace-or-refund',
				copy: 'LocalSnow confirms the requested instructor first; if they cannot serve, LocalSnow finds a suitable replacement or refunds the client.',
				replacementPricePolicy: 'client_approval_required_for_price_increase'
			},
			payout: {
				mode: 'manual',
				recipientType: input.payoutRecipientType,
				automation: 'not_started'
			},
			forbiddenAutomation: ['stripe_connect', 'shared_ledger', 'automatic_payout']
		}
	};
}

export function buildClientDepositDraft({
	plan,
	clientEmail,
	now
}: {
	plan: ProtectedBookingChargePlan;
	clientEmail: string;
	now: Date;
}): ClientDepositDraft {
	return {
		bookingRequestId: plan.bookingRequestId,
		clientEmail: clientEmail.toLowerCase().trim(),
		amount: centsToDecimalString(plan.totalClientChargeCents),
		currency: plan.currency,
		status: 'pending',
		expiresAt: addHours(now, 48)
	};
}

export function buildProtectedBookingPaymentBoundary(
	input: ProtectedBookingPaymentBoundaryInput
): ProtectedBookingPaymentBoundary {
	const canShowFinalPaymentReview =
		input.checkoutReady &&
		input.finalLessonPriceCents != null &&
		input.finalLessonPriceCents > 0 &&
		input.localSnowServiceFeeCents != null &&
		input.localSnowServiceFeeCents >= 0;

	if (!canShowFinalPaymentReview) {
		return {
			status: 'estimate_only',
			canCollectPayment: false,
			currency: input.currency,
			lineItems: [
				{
					kind: 'estimated_lesson_amount',
					label: 'Estimated lesson amount',
					amountCents: input.lessonEstimateCents,
					displayAmount: formatCurrencyCents(input.lessonEstimateCents, input.currency),
					visibility: 'client'
				}
			],
			totalClientChargeCents: null,
			displayTotalClientCharge: 'Calculated before payment',
			clientDisplay: {
				feeDisplayMode: 'bundled_total',
				label: 'Protected booking total',
				displayAmount: 'Calculated before payment'
			},
			internalAccounting: null,
			clientChargeTiming: 'after_checkout_total_is_ready',
			reviewRequirement: 'client_reviews_protected_booking_total_before_payment',
			clientCopy: [
				'The protected booking total is automatically calculated from the instructor rate card and LocalSnow margin.',
				'LocalSnow shows one protected booking total before payment.',
				'Payment only happens after the client reviews the protected total.'
			]
		};
	}

	const totalClientChargeCents = input.finalLessonPriceCents! + input.localSnowServiceFeeCents!;

	return {
		status: 'ready_for_payment_review',
		canCollectPayment: true,
		currency: input.currency,
		lineItems: [
			{
				kind: 'confirmed_lesson_amount',
				label: 'Instructor net',
				amountCents: input.finalLessonPriceCents!,
				displayAmount: formatCurrencyCents(input.finalLessonPriceCents!, input.currency),
				visibility: 'internal'
			},
			{
				kind: 'localsnow_margin',
				label: 'LocalSnow margin',
				amountCents: input.localSnowServiceFeeCents!,
				displayAmount: formatCurrencyCents(input.localSnowServiceFeeCents!, input.currency),
				visibility: 'internal'
			}
		],
		totalClientChargeCents,
		displayTotalClientCharge: formatCurrencyCents(totalClientChargeCents, input.currency),
		clientDisplay: {
			feeDisplayMode: 'bundled_total',
			label: 'Protected booking total',
			displayAmount: formatCurrencyCents(totalClientChargeCents, input.currency)
		},
		internalAccounting: {
			instructorNetCents: input.finalLessonPriceCents!,
			localSnowMarginCents: input.localSnowServiceFeeCents!
		},
		clientChargeTiming: 'after_client_reviews_protected_total',
		reviewRequirement: 'client_reviews_protected_booking_total_before_payment',
		clientCopy: [
			'The protected booking total is ready for checkout.',
			'The client sees one protected booking total before payment.',
			'LocalSnow keeps internal accounting for instructor net and LocalSnow margin while payout remains manual.'
		]
	};
}

export function getProtectedBookingReplacementResolution(
	input: ProtectedBookingReplacementResolutionInput
): ProtectedBookingReplacementResolution {
	if (input.sameInstructorCanReschedule) {
		return {
			action: 'reschedule-same-instructor',
			canProceedWithoutClientDecision: true,
			clientPriceDeltaCents: 0,
			clientCopy: 'LocalSnow reschedules with the same instructor under the paid protected booking.'
		};
	}

	if (!input.replacementInstructorAvailable || input.replacementClientChargeCents == null) {
		return {
			action: 'refund-client',
			canProceedWithoutClientDecision: true,
			clientPriceDeltaCents: -input.paidClientChargeCents,
			clientCopy:
				'LocalSnow could not find a suitable instructor for the protected booking, so the client gets a refund.'
		};
	}

	const clientPriceDeltaCents = input.replacementClientChargeCents - input.paidClientChargeCents;

	if (clientPriceDeltaCents <= 0) {
		return {
			action: 'offer-replacement-without-price-increase',
			canProceedWithoutClientDecision: true,
			clientPriceDeltaCents,
			clientCopy:
				'LocalSnow can offer another suitable instructor without increasing the client price.'
		};
	}

	if (input.clientApprovedPriceIncrease) {
		return {
			action: 'replace-after-client-approved-price-increase',
			canProceedWithoutClientDecision: true,
			clientPriceDeltaCents,
			clientCopy:
				'The client approved the replacement instructor price difference, so LocalSnow can continue the protected booking.'
		};
	}

	return {
		action: 'ask-client-to-approve-price-increase',
		canProceedWithoutClientDecision: false,
		clientPriceDeltaCents,
		clientCopy:
			'The replacement instructor costs more, so the client must approve the difference before LocalSnow changes the booking.'
	};
}

function centsToDecimalString(cents: number): string {
	return (cents / 100).toFixed(2);
}

function formatCurrencyCents(cents: number, currency: CurrencyCode): string {
	const symbol = currency === 'EUR' ? '€' : `${currency} `;
	return `${symbol}${centsToDecimalString(cents)}`;
}

function addHours(date: Date, hours: number): Date {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
