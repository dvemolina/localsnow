export type AvailabilityProofInput = {
	hasAvailabilitySignal: boolean;
	availableSlotsCount?: number;
	isFresh?: boolean;
};

export type AvailabilityProofState = {
	label: 'Available to request' | 'Request availability' | 'Availability not set';
	tone: 'positive' | 'neutral' | 'muted';
	clientCopy: string;
};

export type ClientPathOption = {
	kind: 'direct' | 'protected';
	label: string;
	priceSignal: 'free' | 'paid';
	safeguardCopy: string;
	cta: string;
};

export function getAvailabilityProofState(input: AvailabilityProofInput): AvailabilityProofState {
	if (!input.hasAvailabilitySignal) {
		return {
			label: 'Availability not set',
			tone: 'muted',
			clientCopy:
				'This instructor has not published a calendar yet. Send a request and wait for confirmation.'
		};
	}

	if (input.isFresh && (input.availableSlotsCount ?? 0) > 0) {
		return {
			label: 'Available to request',
			tone: 'positive',
			clientCopy:
				'This profile has available slots you can request. Availability only shows whether a time may work, never private booking details.'
		};
	}

	return {
		label: 'Request availability',
		tone: 'neutral',
		clientCopy:
			'Availability is not live-confirmed yet. Request your preferred time and the instructor will confirm or suggest another option.'
	};
}

export function protectedBookingIsEnabled({ hasBaseLesson }: { hasBaseLesson: boolean }): boolean {
	return hasBaseLesson;
}

export function getClientPathOptions({
	hasProtectedBooking
}: {
	hasProtectedBooking: boolean;
}): ClientPathOption[] {
	const direct: ClientPathOption = {
		kind: 'direct',
		label: 'Free direct request',
		priceSignal: 'free',
		safeguardCopy:
			'No LocalSnow safeguard: you contact the instructor directly and wait for their confirmation.',
		cta: 'Contact instructor free'
	};

	const protectedPath: ClientPathOption = {
		kind: 'protected',
		label: hasProtectedBooking ? 'Protected booking request' : 'Protected booking coming soon',
		priceSignal: 'paid',
		safeguardCopy:
			'LocalSnow can tentatively hold requested slots and provide rescheduling or replacement help when you book through the platform.',
		cta: hasProtectedBooking ? 'Request protected booking' : 'Ask LocalSnow for help'
	};

	return [direct, protectedPath];
}
