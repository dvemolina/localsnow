export type AvailabilitySourceProduct = 'localsnow' | 'skirelay' | 'manual' | 'google_calendar';
export type AvailabilitySourceRecordType =
	| 'booking_request'
	| 'calendar_block'
	| 'external_event'
	| 'referral'
	| 'job_post'
	| 'availability_rule';
export type AvailabilityCommitmentStatus =
	| 'tentative'
	| 'confirmed'
	| 'completed'
	| 'cancelled'
	| 'expired';
export type AvailabilityVisibility = 'private' | 'network' | 'public-derived';
export type PublicAvailabilityState = 'available' | 'limited' | 'blocked' | 'requestable';

export type AvailabilityRule = {
	instructorId: number;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	seasonStart?: string;
	seasonEnd?: string;
	isActive: boolean;
};

export type AvailabilityCommitment = {
	id: string;
	instructorId: number;
	start: Date;
	end: Date;
	sourceProduct: AvailabilitySourceProduct;
	sourceRecordType: AvailabilitySourceRecordType;
	sourceRecordId?: string;
	status: AvailabilityCommitmentStatus;
	visibility: AvailabilityVisibility;
	publicState: Exclude<PublicAvailabilityState, 'available' | 'requestable'>;
	privateLabel?: string;
	expiresAt?: Date | null;
};

export type ClientSafeAvailabilityState = {
	state: PublicAvailabilityState;
	label: string;
	confidence: 'specific' | 'rule-based' | 'unknown';
	canRequestDirectly: boolean;
	canRequestProtectedBooking: boolean;
	reason: string;
};

export type LocalSnowSlotStatus = 'blocked' | 'pending' | 'booked';

type WorkingHoursLike = {
	instructorId: number;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	seasonStart?: Date | string | null;
	seasonEnd?: Date | string | null;
	isActive?: boolean | null;
};

type CalendarBlockLike = {
	id: number | string;
	instructorId: number;
	startDatetime: Date | string;
	endDatetime: Date | string;
	source: string;
	bookingRequestId?: number | string | null;
	googleEventId?: string | null;
	title?: string | null;
	expiresAt?: Date | string | null;
};

type ClientSafeStateInput = {
	instructorId: number;
	start: Date;
	end: Date;
	rules: AvailabilityRule[];
	commitments: AvailabilityCommitment[];
	/**
	 * Availability proof uses UTC Date objects for now. Resort-local timezones should become explicit
	 * before this spine is promoted from proof helper to persisted calendar law.
	 */
	now?: Date;
};

export function normalizeWorkingHoursRule(hours: WorkingHoursLike): AvailabilityRule {
	return {
		instructorId: hours.instructorId,
		dayOfWeek: hours.dayOfWeek,
		startTime: hours.startTime,
		endTime: hours.endTime,
		seasonStart: toDateOnly(hours.seasonStart),
		seasonEnd: toDateOnly(hours.seasonEnd),
		isActive: hours.isActive ?? true
	};
}

export function normalizeCalendarBlockCommitment(block: CalendarBlockLike): AvailabilityCommitment {
	const source = mapCalendarBlockSource(block.source);
	const sourceRecordId = block.bookingRequestId ?? block.googleEventId ?? block.id;

	return {
		id: `localsnow-calendar-block:${block.id}`,
		instructorId: block.instructorId,
		start: toDate(block.startDatetime),
		end: toDate(block.endDatetime),
		sourceProduct: source.sourceProduct,
		sourceRecordType: source.sourceRecordType,
		sourceRecordId: sourceRecordId == null ? undefined : String(sourceRecordId),
		status: source.status,
		visibility: source.visibility,
		publicState: source.publicState,
		privateLabel: block.title ?? undefined,
		expiresAt: block.expiresAt == null ? null : toDate(block.expiresAt)
	};
}

export function getSlotStatusFromCalendarBlockSource(source: string): LocalSnowSlotStatus {
	const mapping = mapCalendarBlockSource(source);

	if (mapping.status === 'tentative') {
		return 'pending';
	}

	if (mapping.sourceProduct === 'localsnow' && mapping.status === 'confirmed') {
		return 'booked';
	}

	return 'blocked';
}

export function getClientSafeAvailabilityState({
	instructorId,
	start,
	end,
	rules,
	commitments,
	now = new Date()
}: ClientSafeStateInput): ClientSafeAvailabilityState {
	const activeConflicts = commitments.filter(
		(commitment) =>
			commitment.instructorId === instructorId &&
			isActiveCommitment(commitment, now) &&
			timeRangesOverlap(start, end, commitment.start, commitment.end)
	);

	if (activeConflicts.some((commitment) => commitment.publicState === 'blocked')) {
		return {
			state: 'blocked',
			label: 'Request another time',
			confidence: 'specific',
			canRequestDirectly: false,
			canRequestProtectedBooking: false,
			reason: 'That time is not publicly available.'
		};
	}

	if (activeConflicts.some((commitment) => commitment.publicState === 'limited')) {
		return {
			state: 'limited',
			label: 'Limited availability',
			confidence: 'specific',
			canRequestDirectly: true,
			canRequestProtectedBooking: true,
			reason: 'This time may already have a tentative commitment, but you can still request it.'
		};
	}

	const matchingRule = rules.find((rule) => ruleAllowsSlot(rule, instructorId, start, end));

	if (!matchingRule) {
		return {
			state: 'requestable',
			label: 'Request availability',
			confidence: 'unknown',
			canRequestDirectly: true,
			canRequestProtectedBooking: false,
			reason: 'Availability is not configured for that exact time yet.'
		};
	}

	return {
		state: 'available',
		label: 'Available to request',
		confidence: 'rule-based',
		canRequestDirectly: true,
		canRequestProtectedBooking: true,
		reason: 'This time matches the instructor availability rules.'
	};
}

export function timeRangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
	return startA < endB && endA > startB;
}

function mapCalendarBlockSource(
	source: string
): Pick<
	AvailabilityCommitment,
	'sourceProduct' | 'sourceRecordType' | 'status' | 'visibility' | 'publicState'
> {
	switch (source) {
		case 'booking_pending':
			return {
				sourceProduct: 'localsnow',
				sourceRecordType: 'booking_request',
				status: 'tentative',
				visibility: 'private',
				publicState: 'limited'
			};
		case 'booking_confirmed':
			return {
				sourceProduct: 'localsnow',
				sourceRecordType: 'booking_request',
				status: 'confirmed',
				visibility: 'private',
				publicState: 'blocked'
			};
		case 'google_calendar':
			return {
				sourceProduct: 'google_calendar',
				sourceRecordType: 'external_event',
				status: 'confirmed',
				visibility: 'private',
				publicState: 'blocked'
			};
		case 'manual':
		default:
			return {
				sourceProduct: 'manual',
				sourceRecordType: 'calendar_block',
				status: 'confirmed',
				visibility: 'private',
				publicState: 'blocked'
			};
	}
}

function ruleAllowsSlot(
	rule: AvailabilityRule,
	instructorId: number,
	start: Date,
	end: Date
): boolean {
	if (!rule.isActive || rule.instructorId !== instructorId) {
		return false;
	}

	if (rule.dayOfWeek !== start.getUTCDay()) {
		return false;
	}

	const date = toDateOnly(start);
	if (rule.seasonStart && date && date < rule.seasonStart) {
		return false;
	}
	if (rule.seasonEnd && date && date > rule.seasonEnd) {
		return false;
	}

	const startTime = toTimeOnly(start);
	const endTime = toTimeOnly(end);
	return startTime >= rule.startTime && endTime <= rule.endTime;
}

function isActiveCommitment(commitment: AvailabilityCommitment, now: Date): boolean {
	if (['cancelled', 'expired', 'completed'].includes(commitment.status)) {
		return false;
	}

	if (commitment.status === 'tentative' && commitment.expiresAt && commitment.expiresAt <= now) {
		return false;
	}

	return true;
}

function toDate(value: Date | string): Date {
	return value instanceof Date ? value : new Date(value);
}

function toDateOnly(value?: Date | string | null): string | undefined {
	if (!value) {
		return undefined;
	}
	return toDate(value).toISOString().slice(0, 10);
}

function toTimeOnly(value: Date): string {
	return `${String(value.getUTCHours()).padStart(2, '0')}:${String(value.getUTCMinutes()).padStart(2, '0')}`;
}
