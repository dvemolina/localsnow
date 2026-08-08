export type BookingRevenuePath = 'direct' | 'protected';
export type PayoutRecipientType = 'instructor' | 'school';
export type CurrencyCode = 'EUR';

export type ProtectedBookingRevenueInput = {
	bookingRequestId: number;
	path: BookingRevenuePath;
	protectedSupportEnabled: boolean;
	instructorConfirmedFinalTerms: boolean;
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
		| 'confirm-final-lesson-terms'
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

export type ProtectedBookingChargePlan = {
	bookingRequestId: number;
	collectionOwner: 'localsnow';
	paymentProvider: 'stripe_checkout';
	currency: CurrencyCode;
	totalClientChargeCents: number;
	lineItems: ProtectedBookingLineItem[];
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

	if (!input.instructorConfirmedFinalTerms) {
		return {
			canCreateClientCharge: false,
			reason: 'LocalSnow should not charge until the instructor confirms final lesson terms.',
			nextAction: 'confirm-final-lesson-terms'
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

function centsToDecimalString(cents: number): string {
	return (cents / 100).toFixed(2);
}

function addHours(date: Date, hours: number): Date {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
