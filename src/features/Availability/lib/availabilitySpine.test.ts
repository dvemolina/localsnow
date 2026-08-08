import { describe, expect, it } from 'vitest';
import {
	getClientSafeAvailabilityState,
	getSlotStatusFromCalendarBlockSource,
	normalizeCalendarBlockCommitment,
	normalizeWorkingHoursRule,
	timeRangesOverlap,
	type AvailabilityCommitment,
	type AvailabilityRule
} from './availabilitySpine';

const mondayRule: AvailabilityRule = {
	instructorId: 7,
	dayOfWeek: 1,
	startTime: '09:00',
	endTime: '16:00',
	seasonStart: '2026-12-01',
	seasonEnd: '2027-04-15',
	isActive: true
};

describe('availability spine', () => {
	it('normalizes working hours into a season-aware availability rule', () => {
		const rule = normalizeWorkingHoursRule({
			instructorId: 7,
			dayOfWeek: 1,
			startTime: '09:00',
			endTime: '16:00',
			seasonStart: new Date('2026-12-01T00:00:00Z'),
			seasonEnd: new Date('2027-04-15T00:00:00Z'),
			isActive: true
		});

		expect(rule).toEqual(mondayRule);
	});

	it('maps current LocalSnow calendar blocks into canonical commitments', () => {
		const commitment = normalizeCalendarBlockCommitment({
			id: 42,
			instructorId: 7,
			startDatetime: new Date('2027-01-04T10:00:00Z'),
			endDatetime: new Date('2027-01-04T12:00:00Z'),
			source: 'booking_pending',
			bookingRequestId: 99,
			title: 'Pending Booking Request',
			expiresAt: new Date('2027-01-02T10:00:00Z')
		});

		expect(commitment).toMatchObject({
			id: 'localsnow-calendar-block:42',
			instructorId: 7,
			sourceProduct: 'localsnow',
			sourceRecordType: 'booking_request',
			sourceRecordId: '99',
			status: 'tentative',
			visibility: 'private',
			publicState: 'limited'
		});
	});

	it('keeps existing LocalSnow slot statuses derived from the canonical source mapping', () => {
		expect(getSlotStatusFromCalendarBlockSource('booking_pending')).toBe('pending');
		expect(getSlotStatusFromCalendarBlockSource('booking_confirmed')).toBe('booked');
		expect(getSlotStatusFromCalendarBlockSource('google_calendar')).toBe('blocked');
		expect(getSlotStatusFromCalendarBlockSource('manual')).toBe('blocked');
	});

	it('does not treat adjacent time ranges as overlapping conflicts', () => {
		expect(
			timeRangesOverlap(
				new Date('2027-01-04T09:00:00Z'),
				new Date('2027-01-04T10:00:00Z'),
				new Date('2027-01-04T10:00:00Z'),
				new Date('2027-01-04T11:00:00Z')
			)
		).toBe(false);
	});

	it('returns only client-safe availability state for public LocalSnow surfaces', () => {
		const commitments: AvailabilityCommitment[] = [
			{
				id: 'google-calendar:redacted-event',
				instructorId: 7,
				start: new Date('2027-01-04T10:00:00Z'),
				end: new Date('2027-01-04T11:00:00Z'),
				sourceProduct: 'google_calendar',
				sourceRecordType: 'external_event',
				sourceRecordId: 'private-event-id',
				status: 'confirmed',
				visibility: 'private',
				publicState: 'blocked',
				privateLabel: 'Private family calendar event'
			}
		];

		const state = getClientSafeAvailabilityState({
			instructorId: 7,
			start: new Date('2027-01-04T10:00:00Z'),
			end: new Date('2027-01-04T11:00:00Z'),
			rules: [mondayRule],
			commitments
		});

		expect(state).toEqual({
			state: 'blocked',
			label: 'Request another time',
			confidence: 'specific',
			canRequestDirectly: false,
			canRequestProtectedBooking: false,
			reason: 'That time is not publicly available.'
		});
		expect(JSON.stringify(state)).not.toContain('Private family calendar event');
		expect(JSON.stringify(state)).not.toContain('private-event-id');
	});

	it('represents future SkiRelay referrals without exposing private details publicly', () => {
		const state = getClientSafeAvailabilityState({
			instructorId: 7,
			start: new Date('2027-01-04T13:00:00Z'),
			end: new Date('2027-01-04T14:00:00Z'),
			rules: [mondayRule],
			commitments: [
				{
					id: 'skirelay-referral:abc',
					instructorId: 7,
					start: new Date('2027-01-04T13:00:00Z'),
					end: new Date('2027-01-04T14:00:00Z'),
					sourceProduct: 'skirelay',
					sourceRecordType: 'referral',
					sourceRecordId: 'abc',
					status: 'tentative',
					visibility: 'network',
					publicState: 'limited',
					privateLabel: 'SkiRelay overflow class for a named client'
				}
			]
		});

		expect(state).toMatchObject({
			state: 'limited',
			label: 'Limited availability',
			canRequestDirectly: true,
			canRequestProtectedBooking: true
		});
		expect(JSON.stringify(state)).not.toContain('named client');
	});

	it('lets private commitments win even when no availability rule matches', () => {
		const state = getClientSafeAvailabilityState({
			instructorId: 7,
			start: new Date('2027-01-04T18:00:00Z'),
			end: new Date('2027-01-04T19:00:00Z'),
			rules: [],
			commitments: [
				{
					id: 'google-calendar:private-evening-event',
					instructorId: 7,
					start: new Date('2027-01-04T18:00:00Z'),
					end: new Date('2027-01-04T19:00:00Z'),
					sourceProduct: 'google_calendar',
					sourceRecordType: 'external_event',
					sourceRecordId: 'private-evening-event',
					status: 'confirmed',
					visibility: 'private',
					publicState: 'blocked',
					privateLabel: 'Named private dinner'
				}
			]
		});

		expect(state).toMatchObject({
			state: 'blocked',
			label: 'Request another time',
			canRequestDirectly: false,
			canRequestProtectedBooking: false
		});
		expect(JSON.stringify(state)).not.toContain('Named private dinner');
		expect(JSON.stringify(state)).not.toContain('private-evening-event');
	});

	it('ignores expired tentative holds instead of showing stale limited availability', () => {
		const state = getClientSafeAvailabilityState({
			instructorId: 7,
			start: new Date('2027-01-04T14:00:00Z'),
			end: new Date('2027-01-04T15:00:00Z'),
			rules: [mondayRule],
			commitments: [
				{
					id: 'localsnow-calendar-block:expired-hold',
					instructorId: 7,
					start: new Date('2027-01-04T14:00:00Z'),
					end: new Date('2027-01-04T15:00:00Z'),
					sourceProduct: 'localsnow',
					sourceRecordType: 'booking_request',
					sourceRecordId: 'expired-hold',
					status: 'tentative',
					visibility: 'private',
					publicState: 'limited',
					expiresAt: new Date('2027-01-04T13:00:00Z')
				}
			],
			now: new Date('2027-01-04T13:30:00Z')
		});

		expect(state.state).toBe('available');
		expect(state.confidence).toBe('rule-based');
	});
});
