export type AvailabilityProofInput = {
	hasAvailabilitySignal: boolean;
	availableSlotsCount?: number;
	isFresh?: boolean;
	source?: 'working-hours' | 'slots' | 'none';
};

export type AvailabilityProofState = {
	labelKey: string;
	tone: 'positive' | 'neutral' | 'muted';
	clientCopyKey: string;
};

export type ClientPathOption = {
	kind: 'direct' | 'protected';
	labelKey: string;
	priceSignal: 'free' | 'assisted';
	safeguardCopyKey: string;
	ctaKey: string;
	enabled: boolean;
};

export type HomepageTrustPath = {
	kind: 'direct' | 'protected';
	labelKey: string;
	priceSignal: 'free' | 'assisted';
	badgeKey: string;
	copyKey: string;
	clientPromiseKey: string;
	humanOpsRequired: boolean;
};

export type HomepageTrustPaths = {
	eyebrowKey: string;
	headlineKey: string;
	subtitleKey: string;
	paths: HomepageTrustPath[];
	operatorTruthKey: string;
};

export type HowItWorksTrustStep = {
	kind: 'direct' | 'protected';
	labelKey: string;
	badgeKey: string;
	costSignal: 'free' | 'paid-support';
	operatorRole: 'none' | 'manual-support';
	clientCopyKey: string;
};

export type HowItWorksTrustPaths = {
	headingKey: string;
	subtitleKey: string;
	steps: HowItWorksTrustStep[];
	discoveryNoteKey: string;
};

export type ProtectedBookingCapabilityInput = {
	hasBaseLesson: boolean;
	isSchoolRate?: boolean;
	allowProtectedBooking?: boolean;
};

export function getAvailabilityProofState(input: AvailabilityProofInput): AvailabilityProofState {
	if (!input.hasAvailabilitySignal) {
		return {
			labelKey: 'availability_proof_not_set_label',
			tone: 'muted',
			clientCopyKey: 'availability_proof_not_set_copy'
		};
	}

	if (input.isFresh && (input.availableSlotsCount ?? 0) > 0) {
		return {
			labelKey: 'availability_proof_available_label',
			tone: 'positive',
			clientCopyKey: 'availability_proof_available_copy'
		};
	}

	return {
		labelKey: 'availability_proof_request_label',
		tone: 'neutral',
		clientCopyKey: 'availability_proof_request_copy'
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
	return [
		{
			kind: 'direct',
			labelKey: 'client_path_direct_label',
			priceSignal: 'free',
			enabled: true,
			safeguardCopyKey: 'client_path_direct_safeguard',
			ctaKey: 'client_path_direct_cta'
		},
		{
			kind: 'protected',
			labelKey: hasProtectedBooking
				? 'client_path_protected_label'
				: 'client_path_protected_disabled_label',
			priceSignal: 'assisted',
			enabled: hasProtectedBooking,
			safeguardCopyKey: hasProtectedBooking
				? 'client_path_protected_safeguard'
				: 'client_path_protected_disabled_safeguard',
			ctaKey: hasProtectedBooking
				? 'client_path_protected_cta'
				: 'client_path_protected_disabled_cta'
		}
	];
}

export function getHomepageTrustPaths(): HomepageTrustPaths {
	return {
		eyebrowKey: 'home_trust_paths_eyebrow',
		headlineKey: 'home_trust_paths_headline',
		subtitleKey: 'home_trust_paths_subtitle',
		paths: [
			{
				kind: 'direct',
				labelKey: 'home_trust_paths_direct_label',
				priceSignal: 'free',
				badgeKey: 'home_trust_paths_direct_badge',
				copyKey: 'home_trust_paths_direct_copy',
				clientPromiseKey: 'home_trust_paths_direct_promise',
				humanOpsRequired: false
			},
			{
				kind: 'protected',
				labelKey: 'home_trust_paths_protected_label',
				priceSignal: 'assisted',
				badgeKey: 'home_trust_paths_protected_badge',
				copyKey: 'home_trust_paths_protected_copy',
				clientPromiseKey: 'home_trust_paths_protected_promise',
				humanOpsRequired: true
			}
		],
		operatorTruthKey: 'home_trust_paths_operator_truth'
	};
}

export function getHowItWorksTrustPaths(): HowItWorksTrustPaths {
	return {
		headingKey: 'how_it_works_trust_paths_heading',
		subtitleKey: 'how_it_works_trust_paths_subtitle',
		steps: [
			{
				kind: 'direct',
				labelKey: 'how_it_works_trust_paths_direct_label',
				badgeKey: 'how_it_works_trust_paths_direct_badge',
				costSignal: 'free',
				operatorRole: 'none',
				clientCopyKey: 'how_it_works_trust_paths_direct_copy'
			},
			{
				kind: 'protected',
				labelKey: 'how_it_works_trust_paths_protected_label',
				badgeKey: 'how_it_works_trust_paths_protected_badge',
				costSignal: 'paid-support',
				operatorRole: 'manual-support',
				clientCopyKey: 'how_it_works_trust_paths_protected_copy'
			}
		],
		discoveryNoteKey: 'how_it_works_trust_paths_discovery_note'
	};
}
