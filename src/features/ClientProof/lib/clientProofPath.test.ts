import { describe, expect, it } from 'vitest';
import {
	getAvailabilityProofState,
	getClientPathOptions,
	protectedBookingIsEnabled
} from './clientProofPath';

describe('LocalSnow client proof path helpers', () => {
	it('describes a requestable availability state without leaking private booking details', () => {
		const state = getAvailabilityProofState({
			hasAvailabilitySignal: true,
			availableSlotsCount: 3,
			isFresh: true
		});

		expect(state.label).toBe('Available to request');
		expect(state.clientCopy).toContain('available slots');
		expect(state.clientCopy).not.toMatch(/client name|calendar notes|booking source/i);
		expect(state.tone).toBe('positive');
	});

	it('is honest when availability is not fresh enough for direct confirmation', () => {
		const state = getAvailabilityProofState({
			hasAvailabilitySignal: true,
			availableSlotsCount: 0,
			isFresh: false
		});

		expect(state.label).toBe('Request availability');
		expect(state.clientCopy).toContain('not live-confirmed');
		expect(state.tone).toBe('neutral');
	});

	it('always keeps free direct contact separate from protected booking', () => {
		const options = getClientPathOptions({ hasProtectedBooking: true });

		expect(options).toHaveLength(2);
		expect(options[0]).toMatchObject({ kind: 'direct', priceSignal: 'free' });
		expect(options[0].safeguardCopy).toContain('No LocalSnow safeguard');
		expect(options[1]).toMatchObject({ kind: 'protected', priceSignal: 'paid' });
		expect(options[1].safeguardCopy).toContain('replacement help');
	});

	it('does not show protected booking as ready when there is no lesson price to charge against', () => {
		expect(protectedBookingIsEnabled({ hasBaseLesson: true })).toBe(true);
		expect(protectedBookingIsEnabled({ hasBaseLesson: false })).toBe(false);
	});
});
