import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SchoolVerificationService } from '$src/features/Schools/lib/schoolVerificationService';

const verificationService = new SchoolVerificationService();

/**
 * Submit a verification request to admin
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { schoolId, schoolName, schoolEmail, schoolPhone, resortId, countryCode, message, proofDocument } = body;

		if (!schoolName) {
			return json({ error: 'School name is required' }, { status: 400 });
		}

		const requestData = await verificationService.submitRequest({
			requesterId: user.id,
			schoolId,
			schoolName,
			schoolEmail,
			schoolPhone,
			resortId,
			countryCode,
			message,
			proofDocument
		});

		return json(
			{
				success: true,
				request: {
					id: requestData.id,
					status: requestData.status,
					schoolName
				},
				message: 'Verification request submitted successfully. The admin will contact you soon.'
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error('Error submitting verification request:', error);
		return json(
			{ error: error.message || 'Failed to submit verification request' },
			{ status: 500 }
		);
	}
};

/**
 * Get user's verification requests
 */
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requests = await verificationService.getRequestsByUser(user.id);

		return json({
			success: true,
			requests: requests.map(req => ({
				id: req.id,
				schoolName: req.schoolName,
				schoolId: req.schoolId,
				status: req.status,
				message: req.message,
				adminNotes: req.adminNotes,
				createdAt: req.createdAt,
				reviewedAt: req.reviewedAt
			}))
		});
	} catch (error) {
		console.error('Error fetching verification requests:', error);
		return json({ error: 'Failed to fetch requests' }, { status: 500 });
	}
};
