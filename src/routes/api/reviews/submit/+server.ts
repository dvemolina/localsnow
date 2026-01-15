import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests, instructorReviews } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validation
		if (!body.token || typeof body.token !== 'string') {
			return json({ error: 'Missing or invalid review token' }, { status: 400 });
		}

		if (!body.rating || body.rating < 1 || body.rating > 5) {
			return json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
		}

		if (body.comment && typeof body.comment === 'string' && body.comment.length > 1000) {
			return json({ error: 'Comment must be less than 1000 characters' }, { status: 400 });
		}

		// Find the booking by token
		const [booking] = await db
			.select()
			.from(bookingRequests)
			.where(
				and(
					eq(bookingRequests.reviewToken, body.token),
					eq(bookingRequests.status, 'completed'),
					isNull(bookingRequests.reviewSubmittedAt)
				)
			)
			.limit(1);

		if (!booking) {
			return json({ error: 'Review link not found, expired, or already used' }, { status: 404 });
		}

		// Start transaction to create review and update booking
		const now = new Date();

		// Create the review
		const [review] = await db
			.insert(instructorReviews)
			.values({
				instructorId: booking.instructorId,
				bookingId: booking.id,
				clientName: booking.clientName,
				clientEmail: booking.clientEmail,
				rating: body.rating,
				comment: body.comment?.trim() || null,
				isVerified: true, // Verified because it came from a booking link
				isPublished: false, // Not published yet - instructor/admin can moderate
				createdAt: now
			})
			.returning();

		// Update booking with review submission timestamp
		await db
			.update(bookingRequests)
			.set({
				reviewSubmittedAt: now,
				updatedAt: now
			})
			.where(eq(bookingRequests.id, booking.id));

		return json(
			{
				success: true,
				review: {
					id: review.id,
					rating: review.rating,
					isVerified: review.isVerified
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error submitting review:', error);
		return json({ error: 'Failed to submit review' }, { status: 500 });
	}
};
