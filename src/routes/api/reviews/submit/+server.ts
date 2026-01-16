import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests, instructorReviews, users } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { ExpiringTokenBucket } from '$lib/server/rate-limit';
import { getClientIP } from '$lib/utils/auth';

// Rate limiting: 5 review submissions per hour per IP
const reviewSubmissionBucket = new ExpiringTokenBucket<string>(5, 3600);

export const POST: RequestHandler = async (event) => {
	const { request } = event;

	// Get client IP for rate limiting
	const clientIP = getClientIP(event);
	if (clientIP === null) {
		throw error(400, 'Unable to determine client IP');
	}

	// Check rate limit
	if (!reviewSubmissionBucket.check(clientIP, 1)) {
		return json(
			{ error: 'Rate limit exceeded. Maximum 5 review submissions per hour.' },
			{ status: 429 }
		);
	}
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

		// Check if user is logged in (hybrid system: token + account)
		const loggedInUser = event.locals.user;
		const reviewerId = loggedInUser?.id || null;

		// Prevent instructors from reviewing themselves
		// Priority: Check userId first (more reliable), then email (for anonymous)
		if (loggedInUser && loggedInUser.id === booking.instructorId) {
			return json(
				{ error: 'Instructors cannot review themselves' },
				{ status: 403 }
			);
		}

		// Also check email for anonymous reviews
		const [instructor] = await db
			.select({ email: users.email })
			.from(users)
			.where(eq(users.id, booking.instructorId))
			.limit(1);

		if (
			instructor &&
			booking.clientEmail &&
			instructor.email.toLowerCase() === booking.clientEmail.toLowerCase()
		) {
			return json(
				{ error: 'Instructors cannot review themselves' },
				{ status: 403 }
			);
		}

		// Start transaction to create review and update booking
		const now = new Date();

		const displayNameRaw =
			body.displayName && typeof body.displayName === 'string' ? body.displayName.trim() : '';

		if (displayNameRaw && displayNameRaw.length > 100) {
			return json({ error: 'Display name must be 100 characters or less' }, { status: 400 });
		}

		const accountName = loggedInUser?.name
			? `${loggedInUser.name}${loggedInUser.lastName ? ' ' + loggedInUser.lastName : ''}`
			: '';
		const reviewerDisplayName = displayNameRaw || accountName || 'Anonymous';

		// Create the review
		const reviewerEmail = loggedInUser?.email
			? loggedInUser.email.toLowerCase()
			: booking.clientEmail
				? booking.clientEmail.toLowerCase()
				: null;

		const [review] = await db
			.insert(instructorReviews)
			.values({
				instructorId: booking.instructorId,
				reviewerId, // Link to user account if logged in
				bookingId: booking.id,
				reviewerName: reviewerDisplayName,
				clientName: booking.clientName,
				clientEmail: reviewerEmail,
				rating: body.rating,
				comment: body.comment?.trim() || null,
				isVerified: true, // Verified because it came from a booking link
				isPublished: true, // Auto-publish verified reviews from booking links
				createdAt: now
			})
			.returning();

		console.log('✅ Review created:', {
			reviewId: review.id,
			instructorId: review.instructorId,
			rating: review.rating,
			isPublished: review.isPublished,
			isVerified: review.isVerified
		});

		// Update booking with review submission timestamp
		await db
			.update(bookingRequests)
			.set({
				reviewSubmittedAt: now,
				updatedAt: now
			})
			.where(eq(bookingRequests.id, booking.id));

		// Consume rate limit token after successful submission
		reviewSubmissionBucket.consume(clientIP, 1);

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
