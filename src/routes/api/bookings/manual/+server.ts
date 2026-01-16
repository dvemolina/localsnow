import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { ExpiringTokenBucket } from '$lib/server/rate-limit';

// Rate limiting: 50 manual bookings per day per instructor
const manualBookingBucket = new ExpiringTokenBucket<number>(50, 86400);

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	// Authentication check
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only instructors can add manual bookings
	if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
		return json({ error: 'Forbidden: Only instructors can add manual bookings' }, { status: 403 });
	}

	// Check rate limit (using user ID as key)
	if (!manualBookingBucket.check(user.id, 1)) {
		return json(
			{ error: 'Rate limit exceeded. Maximum 50 manual bookings per day.' },
			{ status: 429 }
		);
	}

	try {
		const body = await request.json();

		// Validation
		if (!body.clientName || !body.startDate) {
			return json(
				{ error: 'Missing required fields: clientName, startDate' },
				{ status: 400 }
			);
		}

		// Email validation (optional, but if provided must be valid)
		if (body.clientEmail) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(body.clientEmail)) {
				return json({ error: 'Invalid email address' }, { status: 400 });
			}
		}

		// Number of students validation
		if (body.numberOfStudents && (body.numberOfStudents < 1 || body.numberOfStudents > 20)) {
			return json({ error: 'Number of students must be between 1 and 20' }, { status: 400 });
		}

		// Hours per day validation
		if (body.hoursPerDay && (body.hoursPerDay < 1 || body.hoursPerDay > 12)) {
			return json({ error: 'Hours per day must be between 1 and 12' }, { status: 400 });
		}

		// Price validation
		if (body.manualPrice && body.manualPrice < 0) {
			return json({ error: 'Price must be positive' }, { status: 400 });
		}

		// Create manual booking
		const [booking] = await db
			.insert(bookingRequests)
			.values({
				instructorId: user.id,
				lessonId: body.lessonId || null,
				clientName: body.clientName.trim(),
				clientEmail: body.clientEmail ? body.clientEmail.toLowerCase().trim() : null, // Optional
				clientPhone: body.clientPhone || null,
				numberOfStudents: body.numberOfStudents || 1,
				startDate: new Date(body.startDate),
				endDate: body.endDate ? new Date(body.endDate) : null,
				hoursPerDay: body.hoursPerDay?.toString() || '2',
				skillLevel: body.skillLevel || null,
				message: body.message || null,
				source: 'manual', // Mark as manual booking
				manualPrice: body.manualPrice || null,
				currency: body.currency || '€',
				notes: body.notes || null,
				status: 'accepted', // Manual bookings start as accepted
				contactInfoUnlocked: true // Manual bookings have contact info visible
			})
			.returning();

		// Consume rate limit token after successful creation
		manualBookingBucket.consume(user.id, 1);

		return json(
			{
				success: true,
				booking: {
					id: booking.id,
					uuid: booking.uuid,
					clientName: booking.clientName,
					startDate: booking.startDate
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating manual booking:', error);
		return json({ error: 'Failed to create booking' }, { status: 500 });
	}
};
