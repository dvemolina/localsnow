import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests, schoolInstructors } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
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

		// Email validation (optional)
		const email = body.clientEmail ? String(body.clientEmail).trim() : '';
		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
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

		const bookingIdentifier = body.bookingIdentifier ? String(body.bookingIdentifier).trim() : '';
		if (bookingIdentifier && bookingIdentifier.length > 100) {
			return json({ error: 'Booking identifier must be 100 characters or less' }, { status: 400 });
		}

		// Look up school_id for instructor-school users
		let schoolId: number | null = null;
		if (user.role === 'instructor-school') {
			const schoolAssociation = await db
				.select({ schoolId: schoolInstructors.schoolId })
				.from(schoolInstructors)
				.where(
					and(
						eq(schoolInstructors.instructorId, user.id),
						eq(schoolInstructors.isAcceptedBySchool, true),
						eq(schoolInstructors.isActive, true)
					)
				)
				.limit(1);

			schoolId = schoolAssociation[0]?.schoolId || null;
		}

		// Create manual booking
		const [booking] = await db
			.insert(bookingRequests)
			.values({
				instructorId: user.id,
				schoolId: schoolId,
				lessonId: body.lessonId || null,
				clientName: body.clientName.trim(),
				clientEmail: email ? email.toLowerCase() : null,
				clientPhone: body.clientPhone || null,
				numberOfStudents: body.numberOfStudents || 1,
				startDate: new Date(body.startDate),
				endDate: body.endDate ? new Date(body.endDate) : null,
				hoursPerDay: body.hoursPerDay?.toString() || '2',
				skillLevel: body.skillLevel || null,
				message: body.message || null,
				source: 'manual', // Mark as manual booking
				bookingIdentifier: bookingIdentifier || null,
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
