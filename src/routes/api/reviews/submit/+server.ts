import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';
import { submitReviewSchema } from '$src/features/Reviews/lib/reviewSchema';
import { sendEmail } from '$lib/server/webhooks/n8n/email-n8n';

const reviewService = new ReviewService();

/**
 * POST /api/reviews/submit
 * Submit a review for a booking
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validate input
		const validatedData = submitReviewSchema.parse(body);

		// Submit review
		const review = await reviewService.submitReview(validatedData);

		// Optional: Send thank you email to client
		try {
			await sendEmail({
				to: validatedData.clientEmail,
				subject: 'Thank you for your review!',
				body: `Thank you for leaving a review for your ski lesson. Your feedback helps us improve and helps other students find great instructors!`,
				type: 'review-submitted'
			});
		} catch (emailError) {
			console.error('Failed to send review thank you email:', emailError);
			// Don't fail the review submission if email fails
		}

		return json({
			success: true,
			review
		});
	} catch (error) {
		console.error('Error submitting review:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to submit review'
			},
			{ status: 400 }
		);
	}
};
