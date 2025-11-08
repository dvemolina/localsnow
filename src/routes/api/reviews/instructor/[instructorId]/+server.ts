import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';

const reviewService = new ReviewService();

/**
 * GET /api/reviews/instructor/[instructorId]
 * Get reviews and statistics for an instructor
 */
export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const instructorId = parseInt(params.instructorId);

		if (isNaN(instructorId)) {
			return json({ error: 'Invalid instructor ID' }, { status: 400 });
		}

		// Parse pagination parameters
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Get reviews and stats in parallel
		const [reviews, stats] = await Promise.all([
			reviewService.getInstructorReviews(instructorId, limit, offset),
			reviewService.getInstructorStats(instructorId)
		]);

		return json({
			success: true,
			reviews,
			stats
		});
	} catch (error) {
		console.error('Error fetching instructor reviews:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch reviews'
			},
			{ status: 500 }
		);
	}
};
