import { describe, expect, it } from 'vitest';
import {
	getAvailabilityProofInputFromWorkingHours,
	getAvailabilityProofState,
	getClientPathOptions,
	getHomepageTrustPaths,
	getHowItWorksTrustPaths,
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

	it('frames protected support as safeguarded booking, not payout automation', () => {
		const protectedPath = getClientPathOptions({ hasProtectedBooking: true }).find(
			(option) => option.kind === 'protected'
		);

		expect(protectedPath?.enabled).toBe(true);
		expect(protectedPath?.priceSignal).toBe('assisted');
		expect(protectedPath?.cta).toBe('Request protected booking');
		expect(protectedPath?.safeguardCopy).toContain('reschedule');
		expect(protectedPath?.safeguardCopy).toContain('refund');
		expect(protectedPath?.safeguardCopy).not.toContain('payout');
	});

	it('summarizes the public platform as free to search and paid to guarantee without pretending full automation', () => {
		const trustPaths = getHomepageTrustPaths();

		expect(trustPaths.headline).toBe(
			'Free to search. Paid when you want LocalSnow to guarantee the lesson.'
		);
		expect(trustPaths.paths.map((path) => path.kind)).toEqual(['direct', 'protected']);
		expect(trustPaths.paths[0]).toMatchObject({
			kind: 'direct',
			label: 'Free direct path',
			priceSignal: 'free',
			humanOpsRequired: false
		});
		expect(trustPaths.paths[1]).toMatchObject({
			kind: 'protected',
			label: 'Protected booking path',
			priceSignal: 'assisted',
			humanOpsRequired: true
		});
		expect(trustPaths.paths[1].copy).toContain('requested instructor first');
		expect(trustPaths.paths[1].copy).toContain('replacement');
		expect(trustPaths.paths[1].copy).toContain('refund');
		expect(trustPaths.paths[1].copy).not.toContain('automatic payout');
	});

	it('explains How It Works as two client paths without inventing an operational checklist', () => {
		const trustPaths = getHowItWorksTrustPaths();

		expect(trustPaths.heading).toBe('Choose the level of help you want');
		expect(trustPaths.steps.map((step) => step.kind)).toEqual(['direct', 'protected']);
		expect(trustPaths.steps[0]).toMatchObject({
			kind: 'direct',
			costSignal: 'free',
			operatorRole: 'none'
		});
		expect(trustPaths.steps[1]).toMatchObject({
			kind: 'protected',
			costSignal: 'paid-support',
			operatorRole: 'manual-support'
		});
		expect(trustPaths.steps[1].clientCopy).toContain('requested instructor first');
		expect(trustPaths.steps[1].clientCopy).toContain('replacement');
		expect(trustPaths.steps[1].clientCopy).toContain('refund');
		expect(trustPaths.steps[1].clientCopy).not.toContain('automatic matching');
		expect(trustPaths.discoveryNote).toContain('not a fixed checklist');

		const spanishTrustPaths = getHowItWorksTrustPaths('es');
		expect(spanishTrustPaths.heading).toBe('Elige el nivel de ayuda que quieres');
		expect(spanishTrustPaths.steps[1]).toMatchObject({
			kind: 'protected',
			operatorRole: 'manual-support'
		});
		expect(spanishTrustPaths.steps[1].clientCopy).toContain('instructor solicitado');
	});
});
