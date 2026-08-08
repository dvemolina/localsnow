import { describe, expect, it } from 'vitest';
import {
	getAvailabilityProofInputFromWorkingHours,
	getAvailabilityProofState,
	getClientPathOptions,
	protectedBookingIsEnabled
} from './clientProofPath';

describe('clientProofPath', () => {
	it('describes a requestable availability state from real working-hours signal', () => {
		const input = getAvailabilityProofInputFromWorkingHours({ workingHoursCount: 5 });
		const state = getAvailabilityProofState(input);

		expect(input).toMatchObject({
			hasAvailabilitySignal: true,
			availableSlotsCount: 5,
			isFresh: true,
			source: 'working-hours'
		});
		expect(state.label).toBe('Available to request');
		expect(state.tone).toBe('positive');
		expect(state.clientCopy).toContain('availability pattern');
		expect(state.clientCopy).not.toContain('client@example.com');
		expect(state.clientCopy).not.toContain('google-event-id');
	});

	it('is honest when availability is not configured', () => {
		const input = getAvailabilityProofInputFromWorkingHours({ workingHoursCount: 0 });
		const state = getAvailabilityProofState(input);

		expect(input.hasAvailabilitySignal).toBe(false);
		expect(state.label).toBe('Availability not set');
		expect(state.tone).toBe('muted');
	});

	it('is honest when availability is stale or not live-confirmed', () => {
		const state = getAvailabilityProofState({
			hasAvailabilitySignal: true,
			availableSlotsCount: 0,
			isFresh: false
		});

		expect(state.label).toBe('Request availability');
		expect(state.clientCopy).toContain('not live-confirmed');
	});

	it('keeps direct contact free and outside the LocalSnow safeguard', () => {
		const [direct] = getClientPathOptions({ hasProtectedBooking: false });

		expect(direct.kind).toBe('direct');
		expect(direct.priceSignal).toBe('free');
		expect(direct.enabled).toBe(true);
		expect(direct.safeguardCopy).toContain('No LocalSnow safeguard');
	});

	it('does not enable protected booking just because a price exists', () => {
		expect(protectedBookingIsEnabled({ hasBaseLesson: true })).toBe(false);
		expect(
			protectedBookingIsEnabled({
				hasBaseLesson: true,
				allowProtectedBooking: true,
				isSchoolRate: true
			})
		).toBe(false);
		expect(
			protectedBookingIsEnabled({
				hasBaseLesson: true,
				allowProtectedBooking: true,
				isSchoolRate: false
			})
		).toBe(true);
	});

	it('frames protected support as assisted follow-up, not payment automation', () => {
		const protectedPath = getClientPathOptions({ hasProtectedBooking: true }).find(
			(option) => option.kind === 'protected'
		);

		expect(protectedPath?.enabled).toBe(true);
		expect(protectedPath?.priceSignal).toBe('assisted');
		expect(protectedPath?.cta).toBe('Request protected support');
		expect(protectedPath?.safeguardCopy).toContain('follow up');
		expect(protectedPath?.safeguardCopy).not.toContain('payment');
	});
});
