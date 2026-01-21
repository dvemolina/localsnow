import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SchoolVerificationService } from '$src/features/Schools/lib/schoolVerificationService';

const verificationService = new SchoolVerificationService();

/**
 * Approve or reject a verification request (admin only)
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;

	if (!user || user.role !== 'admin') {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requestId = parseInt(params.id);
		if (isNaN(requestId)) {
			return json({ error: 'Invalid request ID' }, { status: 400 });
		}

		const body = await request.json();
		const { action, adminNotes } = body;

		if (action !== 'approve' && action !== 'reject') {
			return json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
		}

		if (action === 'approve') {
			const result = await verificationService.approveRequest(requestId, user.id, adminNotes);

			if (!result.success) {
				return json({ error: 'Failed to approve request' }, { status: 500 });
			}

			return json({
				success: true,
				message: 'Request approved. User has been granted school-admin access.',
				schoolId: result.schoolId
			});
		} else {
			const result = await verificationService.rejectRequest(requestId, user.id, adminNotes);

			if (!result) {
				return json({ error: 'Failed to reject request' }, { status: 500 });
			}

			return json({
				success: true,
				message: 'Request rejected.'
			});
		}
	} catch (error: any) {
		console.error('Error reviewing verification request:', error);
		return json(
			{ error: error.message || 'Failed to process request review' },
			{ status: 500 }
		);
	}
};
