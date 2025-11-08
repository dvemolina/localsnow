import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';

const reviewService = new ReviewService();

/**
 * GET /api/reviews/can-review/[bookingId]?email=client@example.com
 * Check if a client can leave a review for a booking
 */
export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const bookingId = parseInt(params.bookingId);
		const clientEmail = url.searchParams.get('email');

		if (isNaN(bookingId)) {
			return json({ error: 'Invalid booking ID' }, { status: 400 });
		}

		if (!clientEmail) {
			return json({ error: 'Email parameter is required' }, { status: 400 });
		}

		const result = await reviewService.canLeaveReview(bookingId, clientEmail);

		return json({
			success: true,
			...result
		});
	} catch (error) {
		console.error('Error checking review eligibility:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to check review eligibility'
			},
			{ status: 500 }
		);
	}
};
