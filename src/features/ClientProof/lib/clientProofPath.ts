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

export type HomepageTrustPath = {
	kind: 'direct' | 'protected';
	label: string;
	priceSignal: 'free' | 'assisted';
	copy: string;
	clientPromise: string;
	humanOpsRequired: boolean;
};

export type HomepageTrustPaths = {
	headline: string;
	subtitle: string;
	paths: HomepageTrustPath[];
	operatorTruth: string;
};

export type HowItWorksTrustStep = {
	kind: 'direct' | 'protected';
	label: string;
	costSignal: 'free' | 'paid-support';
	operatorRole: 'none' | 'manual-support';
	clientCopy: string;
};

export type HowItWorksTrustPaths = {
	heading: string;
	subtitle: string;
	steps: HowItWorksTrustStep[];
	discoveryNote: string;
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
			? 'With LocalSnow safeguarded booking, we contact the requested instructor first, then reschedule, find another suitable instructor, or refund the client if the instructor cannot serve the request.'
			: 'For now, use the free request path. LocalSnow protected support will be enabled profile by profile.',
		cta: hasProtectedBooking ? 'Request protected booking' : 'Use free request for now'
	};

	return [direct, protectedPath];
}

export function getHomepageTrustPaths(): HomepageTrustPaths {
	return {
		headline: 'Free to search. Paid when you want LocalSnow to guarantee the lesson.',
		subtitle:
			'Use LocalSnow as a free directory when you want direct contact. Choose protected booking when you want LocalSnow to help make the lesson happen.',
		paths: [
			{
				kind: 'direct',
				label: 'Free direct path',
				priceSignal: 'free',
				copy: 'Find instructors and schools, contact them directly, and wait for their confirmation. LocalSnow does not take commission or guarantee the outcome on the free path.',
				clientPromise: 'Discovery and direct contact stay free.',
				humanOpsRequired: false
			},
			{
				kind: 'protected',
				label: 'Protected booking path',
				priceSignal: 'assisted',
				copy: 'Pay for LocalSnow support: we contact the requested instructor first, then arrange a suitable replacement, reschedule, or refund if the lesson cannot happen.',
				clientPromise:
					'One protected total before payment; any more expensive replacement needs client approval first.',
				humanOpsRequired: true
			}
		],
		operatorTruth:
			'Behind the scenes, protected booking is manually operated by LocalSnow until real transaction volume proves automation is needed.'
	};
}

export function getHowItWorksTrustPaths(locale: 'en' | 'es' = 'en'): HowItWorksTrustPaths {
	if (locale === 'es') {
		return {
			heading: 'Elige el nivel de ayuda que quieres',
			subtitle:
				'LocalSnow puede ser un directorio gratuito o una capa de soporte para reserva protegida. El cliente elige la ruta antes de comprometerse.',
			steps: [
				{
					kind: 'direct',
					label: 'Ruta directa gratuita',
					costSignal: 'free',
					operatorRole: 'none',
					clientCopy:
						'Explora perfiles, contacta directamente con instructores o escuelas, acordáis los detalles y les pagas directamente. LocalSnow no garantiza la confirmación en esta ruta.'
				},
				{
					kind: 'protected',
					label: 'Ruta protegida con LocalSnow',
					costSignal: 'paid-support',
					operatorRole: 'manual-support',
					clientCopy:
						'Paga soporte de LocalSnow cuando quieres ayuda para que la clase ocurra: contactamos primero al instructor solicitado y luego ayudamos con sustitución, reprogramación o reembolso si hace falta. Es soporte humano, no cumplimiento automático por software.'
				}
			],
			discoveryNote:
				'Esto intencionadamente no es un checklist fijo todavía. LocalSnow está aprendiendo el flujo real de reserva protegida mediante operaciones manuales antes de automatizarlo.'
		};
	}

	return {
		heading: 'Choose the level of help you want',
		subtitle:
			'LocalSnow can be a free directory or a protected booking support layer. The client chooses the route before committing.',
		steps: [
			{
				kind: 'direct',
				label: 'Free direct route',
				costSignal: 'free',
				operatorRole: 'none',
				clientCopy:
					'Browse profiles, contact instructors or schools directly, agree the details yourselves, and pay them directly. LocalSnow does not guarantee confirmation on this route.'
			},
			{
				kind: 'protected',
				label: 'Protected LocalSnow route',
				costSignal: 'paid-support',
				operatorRole: 'manual-support',
				clientCopy:
					'Pay for LocalSnow support when you want help making the lesson happen: we contact the requested instructor first, then help with a suitable replacement, reschedule, or refund if needed. This is human support, not software-driven fulfillment.'
			}
		],
		discoveryNote:
			'This is intentionally not a fixed checklist yet. LocalSnow is learning the real protected-booking workflow through manual operations before automating it.'
	};
}
