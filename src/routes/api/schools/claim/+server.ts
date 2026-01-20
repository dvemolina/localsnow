import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SchoolClaimService } from '$src/features/Schools/lib/schoolClaimService';
import { SchoolService } from '$src/features/Schools/lib/schoolService';

const claimService = new SchoolClaimService();
const schoolService = new SchoolService();

/**
 * Submit a claim request for a school
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only school-admin or users wanting to become school-admin can claim
	if (user.role && user.role !== 'school-admin' && user.role !== 'client') {
		return json(
			{ error: 'Only school administrators can claim schools' },
			{ status: 403 }
		);
	}

	try {
		const body = await request.json();
		const { schoolId, message } = body;

		if (!schoolId) {
			return json({ error: 'School ID is required' }, { status: 400 });
		}

		// Get the school to find current owner
		const school = await schoolService.getSchoolById(schoolId);
		if (!school) {
			return json({ error: 'School not found' }, { status: 404 });
		}

		// Submit the claim
		const claim = await claimService.submitClaim(
			schoolId,
			user.id,
			school.ownerUserId,
			message
		);

		return json(
			{
				success: true,
				claim: {
					id: claim.id,
					status: claim.status,
					schoolName: school.name
				},
				message: 'Claim submitted successfully. The current owner will be notified.'
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error('Error submitting claim:', error);
		return json(
			{ error: error.message || 'Failed to submit claim' },
			{ status: 500 }
		);
	}
};

/**
 * Get pending claims for the current user (as owner)
 */
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const pendingClaims = await claimService.getPendingClaimsForOwner(user.id);

		return json({
			success: true,
			claims: pendingClaims.map(claim => ({
				id: claim.id,
				schoolId: claim.schoolId,
				schoolName: claim.school?.name,
				claimantName: claim.claimant ? `${claim.claimant.name} ${claim.claimant.lastName}` : 'Unknown',
				claimantEmail: claim.claimant?.email,
				message: claim.message,
				createdAt: claim.createdAt
			}))
		});
	} catch (error) {
		console.error('Error fetching pending claims:', error);
		return json({ error: 'Failed to fetch claims' }, { status: 500 });
	}
};
