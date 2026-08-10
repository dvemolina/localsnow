import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import {
	getAvailabilityProofInputFromWorkingHours,
	getAvailabilityProofState,
	getClientPathOptions,
	getHomepageTrustPaths,
	getHowItWorksTrustPaths,
	protectedBookingIsEnabled
} from './clientProofPath';

const TRUST_PATH_CONSUMER_FILES = [
	'src/features/ClientProof/lib/clientProofPath.ts',
	'src/routes/+page.svelte',
	'src/routes/how-it-works/+page.svelte',
	'src/features/Instructors/components/InstructorCard.svelte',
	'src/routes/instructors/[slug]/+page.svelte'
];

const FORBIDDEN_TRUST_PATH_COPY = [
	'Contact instructor free',
	'Request protected booking',
	'How LocalSnow works now',
	'Free direct request',
	'Protected booking request',
	'Free direct path',
	'Protected booking path',
	'Protected LocalSnow route',
	'Available to request',
	'Request availability',
	'Availability not set'
];

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
		expect(state.labelKey).toBe('availability_proof_available_label');
		expect(state.tone).toBe('positive');
		expect(state.clientCopyKey).toBe('availability_proof_available_copy');
	});

	it('is honest when availability is not configured', () => {
		const input = getAvailabilityProofInputFromWorkingHours({ workingHoursCount: 0 });
		const state = getAvailabilityProofState(input);

		expect(input.hasAvailabilitySignal).toBe(false);
		expect(state.labelKey).toBe('availability_proof_not_set_label');
		expect(state.tone).toBe('muted');
	});

	it('is honest when availability is stale or not live-confirmed', () => {
		const state = getAvailabilityProofState({
			hasAvailabilitySignal: true,
			availableSlotsCount: 0,
			isFresh: false
		});

		expect(state.labelKey).toBe('availability_proof_request_label');
		expect(state.clientCopyKey).toBe('availability_proof_request_copy');
	});

	it('keeps direct contact free and outside the LocalSnow safeguard without embedding copy', () => {
		const [direct] = getClientPathOptions({ hasProtectedBooking: false });

		expect(direct.kind).toBe('direct');
		expect(direct.priceSignal).toBe('free');
		expect(direct.enabled).toBe(true);
		expect(direct).toMatchObject({
			labelKey: 'client_path_direct_label',
			safeguardCopyKey: 'client_path_direct_safeguard',
			ctaKey: 'client_path_direct_cta'
		});
		expect(direct).not.toHaveProperty('safeguardCopy');
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

	it('frames protected support as safeguarded booking with translation keys, not payout automation copy', () => {
		const protectedPath = getClientPathOptions({ hasProtectedBooking: true }).find(
			(option) => option.kind === 'protected'
		);

		expect(protectedPath?.enabled).toBe(true);
		expect(protectedPath?.priceSignal).toBe('assisted');
		expect(protectedPath).toMatchObject({
			labelKey: 'client_path_protected_label',
			safeguardCopyKey: 'client_path_protected_safeguard',
			ctaKey: 'client_path_protected_cta'
		});
		expect(protectedPath).not.toHaveProperty('cta');
		expect(protectedPath).not.toHaveProperty('safeguardCopy');
	});

	it('summarizes the public platform as free to search and paid to guarantee through translation keys', () => {
		const trustPaths = getHomepageTrustPaths();

		expect(trustPaths).toMatchObject({
			eyebrowKey: 'home_trust_paths_eyebrow',
			headlineKey: 'home_trust_paths_headline',
			subtitleKey: 'home_trust_paths_subtitle',
			operatorTruthKey: 'home_trust_paths_operator_truth'
		});
		expect(trustPaths.paths.map((path) => path.kind)).toEqual(['direct', 'protected']);
		expect(trustPaths.paths[0]).toMatchObject({
			kind: 'direct',
			labelKey: 'home_trust_paths_direct_label',
			priceSignal: 'free',
			humanOpsRequired: false
		});
		expect(trustPaths.paths[1]).toMatchObject({
			kind: 'protected',
			labelKey: 'home_trust_paths_protected_label',
			priceSignal: 'assisted',
			humanOpsRequired: true
		});
		expect(trustPaths).not.toHaveProperty('headline');
		expect(trustPaths.paths[1]).not.toHaveProperty('copy');
	});

	it('explains How It Works as two client paths without embedding localized copy in the model', () => {
		const trustPaths = getHowItWorksTrustPaths();

		expect(trustPaths).toMatchObject({
			headingKey: 'how_it_works_trust_paths_heading',
			subtitleKey: 'how_it_works_trust_paths_subtitle',
			discoveryNoteKey: 'how_it_works_trust_paths_discovery_note'
		});
		expect(trustPaths.steps.map((step) => step.kind)).toEqual(['direct', 'protected']);
		expect(trustPaths.steps[0]).toMatchObject({
			kind: 'direct',
			labelKey: 'how_it_works_trust_paths_direct_label',
			costSignal: 'free',
			operatorRole: 'none'
		});
		expect(trustPaths.steps[1]).toMatchObject({
			kind: 'protected',
			labelKey: 'how_it_works_trust_paths_protected_label',
			costSignal: 'paid-support',
			operatorRole: 'manual-support'
		});
		expect(trustPaths).not.toHaveProperty('heading');
		expect(trustPaths.steps[1]).not.toHaveProperty('clientCopy');
	});

	it('keeps trust-path UI copy behind translation keys in the touched surfaces', () => {
		const violations = TRUST_PATH_CONSUMER_FILES.flatMap((file) => {
			const source = readFileSync(join(process.cwd(), file), 'utf8');
			return FORBIDDEN_TRUST_PATH_COPY.filter((copy) => source.includes(copy)).map(
				(copy) => `${file}: ${copy}`
			);
		});

		expect(violations).toEqual([]);
	});
});
