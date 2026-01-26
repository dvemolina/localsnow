import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { ExpiringTokenBucket } from '$lib/server/rate-limit';
import { hasInstructorRole } from '$src/lib/utils/roles';

// Rate limiting: 100 review token generations per day per instructor
const reviewTokenBucket = new ExpiringTokenBucket<number>(100, 86400);

export const POST: RequestHandler = async ({ params, locals, url }) => {
	const user = locals.user;

	// Authentication check
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only instructors can generate review links
	if (!hasInstructorRole(user)) {
		return json({ error: 'Forbidden: Only instructors can generate review links' }, { status: 403 });
	}

	// Check rate limit (using user ID as key)
	if (!reviewTokenBucket.check(user.id, 1)) {
		return json(
			{ error: 'Rate limit exceeded. Maximum 100 review tokens per day.' },
			{ status: 429 }
		);
	}

	const bookingId = parseInt(params.id);
	if (isNaN(bookingId)) {
		return json({ error: 'Invalid booking ID' }, { status: 400 });
	}

	try {
		// Fetch the booking and verify ownership
		const [booking] = await db
			.select()
			.from(bookingRequests)
			.where(and(eq(bookingRequests.id, bookingId), eq(bookingRequests.instructorId, user.id)))
			.limit(1);

		if (!booking) {
			return json({ error: 'Booking not found or unauthorized' }, { status: 404 });
		}

		// Check if booking is completed
		if (booking.status !== 'completed') {
			return json(
				{ error: 'Booking must be completed before generating review link' },
				{ status: 400 }
			);
		}

		// Check if review already submitted
		if (booking.reviewSubmittedAt) {
			return json({ error: 'Review has already been submitted for this booking' }, { status: 400 });
		}

		// Generate or reuse review token
		let reviewToken = booking.reviewToken;

		if (!reviewToken) {
			// Generate a secure random token
			reviewToken = randomBytes(32).toString('hex');

			// Update booking with token
			await db
				.update(bookingRequests)
				.set({
					reviewToken,
					updatedAt: new Date()
				})
				.where(eq(bookingRequests.id, bookingId));
		}

		// Build full review URL
		const protocol = url.protocol;
		const host = url.host;
		const reviewUrl = `${protocol}//${host}/reviews/submit/${reviewToken}`;

		// Consume rate limit token after successful generation
		reviewTokenBucket.consume(user.id, 1);

		return json({
			success: true,
			reviewToken,
			reviewUrl,
			booking: {
				id: booking.id,
				clientName: booking.clientName,
				clientEmail: booking.clientEmail
			}
		});
	} catch (error) {
		console.error('Error generating review token:', error);
		return json({ error: 'Failed to generate review link' }, { status: 500 });
	}
};
