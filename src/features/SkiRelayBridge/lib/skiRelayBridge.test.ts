import { describe, expect, it } from 'vitest';
import {
	buildLocalSnowProfileBridgeDraft,
	buildSkiRelayOpportunityDraft,
	createSkiRelayAvailabilityCommitments,
	getSkiRelayBridgeReadiness
} from './skiRelayBridge';

describe('skiRelayBridge', () => {
	const privateProfile = {
		skiRelayInstructorId: 'relay-inst-123',
		displayName: 'Alex Mountain',
		phone: '+34 600 000 000',
		email: 'alex@example.com',
		bio: 'Independent ski instructor in Baqueira.',
		sports: ['ski', 'snowboard'],
		languages: ['en', 'es'],
		resortSlug: 'baqueira-beret',
		avatarUrl: 'https://cdn.example/avatar.jpg',
		payment: {
			iban: 'ES00PRIVATEIBAN',
			bizumPhone: '+34 699 999 999'
		},
		trustedNetworkStatus: 'vouched' as const
	};

	it('blocks LocalSnow public profile creation without explicit consent', () => {
		const draft = buildLocalSnowProfileBridgeDraft({
			profile: privateProfile,
			consent: { publishToLocalSnow: false }
		});

		expect(draft.status).toBe('blocked');
		expect(draft.reason).toContain('explicit consent');
		expect(draft.publicProfileDraft).toBeNull();
	});

	it('creates a draft LocalSnow profile only from consented public-safe fields', () => {
		const draft = buildLocalSnowProfileBridgeDraft({
			profile: privateProfile,
			consent: {
				publishToLocalSnow: true,
				sharePhonePublicly: false,
				shareEmailPublicly: true
			}
		});

		expect(draft.status).toBe('ready');
		expect(draft.publicProfileDraft?.publicProfileFields).toMatchObject({
			displayName: 'Alex Mountain',
			bio: 'Independent ski instructor in Baqueira.',
			sports: ['ski', 'snowboard'],
			languages: ['en', 'es'],
			resortSlug: 'baqueira-beret',
			isPublished: false,
			publicEmail: 'alex@example.com',
			publicPhone: null
		});
		expect(draft.publicProfileDraft?.bridgeMetadata).toEqual({
			sourceProduct: 'skirelay',
			sourceInstructorId: 'relay-inst-123'
		});
		expect(JSON.stringify(draft.publicProfileDraft?.publicProfileFields)).not.toContain(
			'relay-inst-123'
		);
		expect(JSON.stringify(draft.publicProfileDraft)).not.toContain('ES00PRIVATEIBAN');
		expect(JSON.stringify(draft.publicProfileDraft)).not.toContain('bizum');
	});

	it('reports missing required public profile fields before bridge publishing', () => {
		const readiness = getSkiRelayBridgeReadiness({
			profile: { ...privateProfile, sports: [], resortSlug: null },
			consent: { publishToLocalSnow: true }
		});

		expect(readiness.canCreateDraft).toBe(false);
		expect(readiness.missingFields).toEqual(['sports', 'resortSlug']);
		expect(readiness.nextAction).toBe('collect-public-profile-fields');
	});

	it('turns only unserved LocalSnow requests into private SkiRelay opportunities', () => {
		const opportunity = buildSkiRelayOpportunityDraft({
			request: {
				localSnowRequestId: 42,
				status: 'rejected',
				unservedReason: 'instructor_unavailable',
				clientName: 'Client Secret',
				clientEmail: 'client@example.com',
				clientPhone: '+34 611 111 111',
				resortSlug: 'baqueira-beret',
				sport: 'ski',
				skillLevel: 'intermediate',
				numberOfStudents: 2,
				sessions: [{ date: '2026-01-15', startTime: '09:00', endTime: '12:00' }],
				message: 'Family lesson, nervous beginner sibling.'
			},
			operatorConsent: true
		});

		expect(opportunity.status).toBe('ready');
		expect(opportunity.opportunityDraft?.networkOpportunityDraft).toMatchObject({
			visibility: 'private-network',
			resortSlug: 'baqueira-beret',
			sport: 'ski',
			skillLevel: 'intermediate',
			numberOfStudents: 2
		});
		expect(opportunity.opportunityDraft?.networkOpportunityDraft.networkSummary).toContain(
			'2 intermediate ski students'
		);
		expect(opportunity.opportunityDraft?.internalClientContext).toMatchObject({
			sourceProduct: 'localsnow',
			sourceRequestId: 42,
			clientName: 'Client Secret',
			clientEmail: 'client@example.com',
			clientPhone: '+34 611 111 111',
			message: 'Family lesson, nervous beginner sibling.'
		});
		const networkJson = JSON.stringify(opportunity.opportunityDraft?.networkOpportunityDraft);
		expect(networkJson).not.toContain('Client Secret');
		expect(networkJson).not.toContain('client@example.com');
		expect(networkJson).not.toContain('+34 611');
		expect(networkJson).not.toContain('Family lesson');
		expect(networkJson).not.toContain('42');
	});

	it('does not bridge active or served LocalSnow requests into SkiRelay', () => {
		const opportunity = buildSkiRelayOpportunityDraft({
			request: {
				localSnowRequestId: 43,
				status: 'accepted',
				resortSlug: 'baqueira-beret',
				sport: 'ski',
				skillLevel: 'beginner',
				numberOfStudents: 1,
				sessions: [{ date: '2026-01-16', startTime: '10:00', endTime: '12:00' }]
			},
			operatorConsent: true
		});

		expect(opportunity.status).toBe('blocked');
		expect(opportunity.reason).toContain('unserved');
		expect(opportunity.opportunityDraft).toBeNull();
	});

	it('can project SkiRelay opportunity sessions into separate shared availability commitments', () => {
		const commitments = createSkiRelayAvailabilityCommitments({
			opportunityId: 'relay-opportunity-42',
			instructorId: 12,
			sessions: [
				{ date: '2026-01-15', startTime: '09:00', endTime: '12:00' },
				{ date: '2026-01-16', startTime: '09:00', endTime: '12:00' }
			],
			privateLabel: 'Client Secret family overflow class'
		});

		expect(commitments).toHaveLength(2);
		expect(commitments.map((commitment) => commitment.id)).toEqual([
			'skirelay-referral:relay-opportunity-42:0',
			'skirelay-referral:relay-opportunity-42:1'
		]);
		expect(commitments[0].start).toEqual(new Date('2026-01-15T09:00:00.000Z'));
		expect(commitments[0].end).toEqual(new Date('2026-01-15T12:00:00.000Z'));
		expect(commitments[1].start).toEqual(new Date('2026-01-16T09:00:00.000Z'));
		expect(commitments[1].end).toEqual(new Date('2026-01-16T12:00:00.000Z'));

		const commitment = commitments[0];
		expect(commitment.sourceProduct).toBe('skirelay');
		expect(commitment.sourceRecordType).toBe('referral');
		expect(commitment.visibility).toBe('private');
		expect(commitment.publicLabel).toBe('Private SkiRelay commitment');
		expect(commitment.privateLabel).toContain('Client Secret');
	});

	it('rejects invalid SkiRelay opportunity session ranges', () => {
		expect(() =>
			createSkiRelayAvailabilityCommitments({
				opportunityId: 'relay-opportunity-42',
				instructorId: 12,
				sessions: [{ date: '2026-01-15', startTime: '12:00', endTime: '09:00' }]
			})
		).toThrow('end after its start');
	});
});
