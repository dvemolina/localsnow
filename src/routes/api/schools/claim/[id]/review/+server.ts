import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SchoolClaimService } from '$src/features/Schools/lib/schoolClaimService';

const claimService = new SchoolClaimService();

/**
 * Approve or reject a claim
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const claimId = parseInt(params.id);
		if (isNaN(claimId)) {
			return json({ error: 'Invalid claim ID' }, { status: 400 });
		}

		const body = await request.json();
		const { action, responseMessage } = body;

		if (action !== 'approve' && action !== 'reject') {
			return json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
		}

		if (action === 'approve') {
			const result = await claimService.approveClaim(claimId, user.id, responseMessage);

			if (!result) {
				return json({ error: 'Failed to approve claim' }, { status: 500 });
			}

			return json({
				success: true,
				message: 'Claim approved. Ownership has been transferred.',
				schoolId: result.schoolId
			});
		} else {
			const result = await claimService.rejectClaim(claimId, user.id, responseMessage);

			if (!result) {
				return json({ error: 'Failed to reject claim' }, { status: 500 });
			}

			return json({
				success: true,
				message: 'Claim rejected.'
			});
		}
	} catch (error: any) {
		console.error('Error reviewing claim:', error);
		return json(
			{ error: error.message || 'Failed to process claim review' },
			{ status: 500 }
		);
	}
};
