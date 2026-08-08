export type AvailabilityProofInput = {
	hasAvailabilitySignal: boolean;
	availableSlotsCount?: number;
	isFresh?: boolean;
	source?: 'working-hours' | 'slots' | 'none';
};

export type AvailabilityProofState = {
	label: 'Available to request' | 'Request availability' | 'Availability not set';
	tone: 'positive' | 'neutral' | 'muted';
	clientCopy: string;
};

export type ClientPathOption = {
	kind: 'direct' | 'protected';
	label: string;
	priceSignal: 'free' | 'assisted';
	safeguardCopy: string;
	cta: string;
	enabled: boolean;
};

export type ProtectedBookingCapabilityInput = {
	hasBaseLesson: boolean;
	isSchoolRate?: boolean;
	allowProtectedBooking?: boolean;
};

export function getAvailabilityProofState(input: AvailabilityProofInput): AvailabilityProofState {
	if (!input.hasAvailabilitySignal) {
		return {
			label: 'Availability not set',
			tone: 'muted',
			clientCopy:
				'This instructor has not published a LocalSnow availability pattern yet. Send a free request and wait for confirmation.'
		};
	}

	if (input.isFresh && (input.availableSlotsCount ?? 0) > 0) {
		return {
			label: 'Available to request',
			tone: 'positive',
			clientCopy:
				'This profile has a LocalSnow availability pattern. It shows whether a request may work, not private booking details.'
		};
	}

	return {
		label: 'Request availability',
		tone: 'neutral',
		clientCopy:
			'Availability is not live-confirmed for this profile yet. Request your preferred time and the instructor will confirm or suggest another option.'
	};
}

export function getAvailabilityProofInputFromWorkingHours({
	workingHoursCount
}: {
	workingHoursCount?: number | null;
}): AvailabilityProofInput {
	const count = workingHoursCount ?? 0;

	return {
		hasAvailabilitySignal: count > 0,
		availableSlotsCount: count,
		isFresh: count > 0,
		source: count > 0 ? 'working-hours' : 'none'
	};
}

export function protectedBookingIsEnabled({
	hasBaseLesson,
	isSchoolRate = false,
	allowProtectedBooking = false
}: ProtectedBookingCapabilityInput): boolean {
	return hasBaseLesson && !isSchoolRate && allowProtectedBooking;
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
		enabled: true,
		safeguardCopy:
			'No LocalSnow safeguard: you contact the instructor directly and wait for their confirmation.',
		cta: 'Contact instructor free'
	};

	const protectedPath: ClientPathOption = {
		kind: 'protected',
		label: hasProtectedBooking ? 'Protected booking request' : 'Protected support coming soon',
		priceSignal: 'assisted',
		enabled: hasProtectedBooking,
		safeguardCopy: hasProtectedBooking
			? 'LocalSnow can help coordinate the request and follow up if the instructor cannot serve the preferred slot.'
			: 'For now, use the free request path. LocalSnow protected support will be enabled profile by profile.',
		cta: hasProtectedBooking ? 'Request protected support' : 'Use free request for now'
	};

	return [direct, protectedPath];
}
