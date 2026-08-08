import type { AvailabilityCommitment } from '$src/features/Availability/lib/availabilitySpine';

export type SkiRelayTrustedNetworkStatus = 'invited' | 'vouched' | 'active' | 'paused';

export type SkiRelayPrivateProfile = {
	skiRelayInstructorId: string;
	displayName: string;
	phone?: string | null;
	email?: string | null;
	bio?: string | null;
	sports: string[];
	languages?: string[];
	resortSlug?: string | null;
	avatarUrl?: string | null;
	payment?: {
		iban?: string | null;
		bizumPhone?: string | null;
	} | null;
	trustedNetworkStatus?: SkiRelayTrustedNetworkStatus;
};

export type SkiRelayBridgeConsent = {
	publishToLocalSnow: boolean;
	sharePhonePublicly?: boolean;
	shareEmailPublicly?: boolean;
};

export type LocalSnowProfileBridgeDraft = {
	displayName: string;
	bio: string | null;
	sports: string[];
	languages: string[];
	resortSlug: string;
	avatarUrl: string | null;
	isPublished: false;
	sourceProduct: 'skirelay';
	sourceInstructorId: string;
	publicPhone: string | null;
	publicEmail: string | null;
};

export type BridgeReadiness = {
	canCreateDraft: boolean;
	missingFields: string[];
	nextAction: 'request-explicit-consent' | 'collect-public-profile-fields' | 'create-profile-draft';
};

export type LocalSnowUnservedRequestStatus =
	| 'pending'
	| 'viewed'
	| 'accepted'
	| 'rejected'
	| 'cancelled'
	| 'expired'
	| 'completed'
	| 'no_show';

export type LocalSnowUnservedRequest = {
	localSnowRequestId: number;
	status: LocalSnowUnservedRequestStatus;
	unservedReason?:
		| 'instructor_unavailable'
		| 'outside_scope'
		| 'expired_no_response'
		| 'manual_operator_decision';
	clientName?: string | null;
	clientEmail?: string | null;
	clientPhone?: string | null;
	resortSlug: string;
	sport: string;
	skillLevel: string;
	numberOfStudents: number;
	sessions: SkiRelaySession[];
	message?: string | null;
};

export type SkiRelaySession = {
	date: string;
	startTime: string;
	endTime: string;
};

export type SkiRelayOpportunityDraft = {
	sourceProduct: 'localsnow';
	sourceRequestId: number;
	visibility: 'private-network';
	resortSlug: string;
	sport: string;
	skillLevel: string;
	numberOfStudents: number;
	sessions: SkiRelaySession[];
	networkSummary: string;
	privateClient: {
		name: string | null;
		email: string | null;
		phone: string | null;
	};
	privateClientNotes: string | null;
};

export type SkiRelayAvailabilityCommitment = AvailabilityCommitment & {
	publicLabel: 'Private SkiRelay commitment';
};

export function getSkiRelayBridgeReadiness({
	profile,
	consent
}: {
	profile: SkiRelayPrivateProfile;
	consent: SkiRelayBridgeConsent;
}): BridgeReadiness {
	if (!consent.publishToLocalSnow) {
		return {
			canCreateDraft: false,
			missingFields: [],
			nextAction: 'request-explicit-consent'
		};
	}

	const missingFields: string[] = [];
	if (!profile.displayName?.trim()) missingFields.push('displayName');
	if (!profile.sports?.length) missingFields.push('sports');
	if (!profile.resortSlug?.trim()) missingFields.push('resortSlug');

	return {
		canCreateDraft: missingFields.length === 0,
		missingFields,
		nextAction: missingFields.length ? 'collect-public-profile-fields' : 'create-profile-draft'
	};
}

export function buildLocalSnowProfileBridgeDraft({
	profile,
	consent
}: {
	profile: SkiRelayPrivateProfile;
	consent: SkiRelayBridgeConsent;
}):
	| { status: 'ready'; reason: null; publicProfileDraft: LocalSnowProfileBridgeDraft }
	| { status: 'blocked'; reason: string; publicProfileDraft: null } {
	const readiness = getSkiRelayBridgeReadiness({ profile, consent });

	if (readiness.nextAction === 'request-explicit-consent') {
		return {
			status: 'blocked',
			reason:
				'SkiRelay instructors need explicit consent before a LocalSnow public profile draft is created.',
			publicProfileDraft: null
		};
	}

	if (!readiness.canCreateDraft) {
		return {
			status: 'blocked',
			reason: `Missing required public profile fields: ${readiness.missingFields.join(', ')}`,
			publicProfileDraft: null
		};
	}

	return {
		status: 'ready',
		reason: null,
		publicProfileDraft: {
			displayName: profile.displayName.trim(),
			bio: profile.bio?.trim() || null,
			sports: [...profile.sports],
			languages: [...(profile.languages ?? [])],
			resortSlug: profile.resortSlug!.trim(),
			avatarUrl: profile.avatarUrl ?? null,
			isPublished: false,
			sourceProduct: 'skirelay',
			sourceInstructorId: profile.skiRelayInstructorId,
			publicPhone: consent.sharePhonePublicly ? (profile.phone ?? null) : null,
			publicEmail: consent.shareEmailPublicly ? (profile.email ?? null) : null
		}
	};
}

export function buildSkiRelayOpportunityDraft({
	request,
	operatorConsent
}: {
	request: LocalSnowUnservedRequest;
	operatorConsent: boolean;
}):
	| { status: 'ready'; reason: null; opportunityDraft: SkiRelayOpportunityDraft }
	| { status: 'blocked'; reason: string; opportunityDraft: null } {
	if (!operatorConsent) {
		return {
			status: 'blocked',
			reason: 'Operator consent is required before moving LocalSnow demand into SkiRelay.',
			opportunityDraft: null
		};
	}

	if (!isUnservedRequest(request)) {
		return {
			status: 'blocked',
			reason: 'Only unserved LocalSnow requests can become SkiRelay opportunities.',
			opportunityDraft: null
		};
	}

	return {
		status: 'ready',
		reason: null,
		opportunityDraft: {
			sourceProduct: 'localsnow',
			sourceRequestId: request.localSnowRequestId,
			visibility: 'private-network',
			resortSlug: request.resortSlug,
			sport: request.sport,
			skillLevel: request.skillLevel,
			numberOfStudents: request.numberOfStudents,
			sessions: [...request.sessions],
			networkSummary: buildNetworkSummary(request),
			privateClient: {
				name: request.clientName ?? null,
				email: request.clientEmail ?? null,
				phone: request.clientPhone ?? null
			},
			privateClientNotes: request.message ?? null
		}
	};
}

export function createSkiRelayAvailabilityCommitment({
	opportunityId,
	instructorId,
	sessions,
	privateLabel
}: {
	opportunityId: string;
	instructorId: number;
	sessions: SkiRelaySession[];
	privateLabel?: string;
}): SkiRelayAvailabilityCommitment {
	if (!sessions.length) {
		throw new Error(
			'At least one SkiRelay session is required to create an availability commitment.'
		);
	}

	const sortedSessions = [...sessions].sort((a, b) =>
		`${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
	);
	const firstSession = sortedSessions[0];
	const lastSession = sortedSessions[sortedSessions.length - 1];

	return {
		id: `skirelay-referral:${opportunityId}`,
		instructorId,
		start: toDateTime(firstSession.date, firstSession.startTime),
		end: toDateTime(lastSession.date, lastSession.endTime),
		sourceProduct: 'skirelay',
		sourceRecordType: 'referral',
		sourceRecordId: opportunityId,
		status: 'tentative',
		visibility: 'private',
		publicState: 'limited',
		publicLabel: 'Private SkiRelay commitment',
		privateLabel
	};
}

function isUnservedRequest(request: LocalSnowUnservedRequest): boolean {
	if (!request.unservedReason) return false;
	return (
		request.status === 'rejected' || request.status === 'expired' || request.status === 'cancelled'
	);
}

function buildNetworkSummary(request: LocalSnowUnservedRequest): string {
	const sessionText =
		request.sessions.length === 1 ? '1 session' : `${request.sessions.length} sessions`;
	return `${request.numberOfStudents} ${request.skillLevel} ${request.sport} students in ${request.resortSlug}; ${sessionText}; source: LocalSnow unserved request.`;
}

function toDateTime(date: string, time: string): Date {
	return new Date(`${date}T${time}:00.000Z`);
}
