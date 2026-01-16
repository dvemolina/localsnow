import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, locals, request }) => {
	const user = locals.user;

	// Authentication check
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only instructors can update bookings
	if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
		return json({ error: 'Forbidden: Only instructors can update bookings' }, { status: 403 });
	}

	const bookingId = parseInt(params.id);

	if (isNaN(bookingId)) {
		return json({ error: 'Invalid booking ID' }, { status: 400 });
	}

	try {
		const body = await request.json();

		// Fetch the booking to verify ownership and conditions
		const [existingBooking] = await db
			.select()
			.from(bookingRequests)
			.where(eq(bookingRequests.id, bookingId));

		if (!existingBooking) {
			return json({ error: 'Booking not found' }, { status: 404 });
		}

		// Verify the booking belongs to the instructor
		if (existingBooking.instructorId !== user.id) {
			return json(
				{ error: 'Forbidden: You can only update your own bookings' },
				{ status: 403 }
			);
		}

		// Only allow updating manual bookings
		if (existingBooking.source !== 'manual') {
			return json(
				{ error: 'Forbidden: Only manual bookings can be edited' },
				{ status: 403 }
			);
		}

		// Don't allow editing completed bookings (they might have reviews)
		if (existingBooking.status === 'completed') {
			return json(
				{ error: 'Cannot edit completed bookings' },
				{ status: 400 }
			);
		}

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

		// Update booking
		const [updatedBooking] = await db
			.update(bookingRequests)
			.set({
				lessonId: body.lessonId || null,
				clientName: body.clientName.trim(),
				clientEmail: body.clientEmail ? body.clientEmail.toLowerCase().trim() : null,
				clientPhone: body.clientPhone || null,
				numberOfStudents: body.numberOfStudents || 1,
				startDate: new Date(body.startDate),
				endDate: body.endDate ? new Date(body.endDate) : null,
				hoursPerDay: body.hoursPerDay?.toString() || '2',
				skillLevel: body.skillLevel || null,
				message: body.message || null,
				manualPrice: body.manualPrice || null,
				currency: body.currency || '€',
				notes: body.notes || null
			})
			.where(eq(bookingRequests.id, bookingId))
			.returning();

		return json(
			{
				success: true,
				booking: {
					id: updatedBooking.id,
					uuid: updatedBooking.uuid,
					clientName: updatedBooking.clientName,
					startDate: updatedBooking.startDate
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating booking:', error);
		return json({ error: 'Failed to update booking' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;

	// Authentication check
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only instructors can delete bookings
	if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
		return json({ error: 'Forbidden: Only instructors can delete bookings' }, { status: 403 });
	}

	const bookingId = parseInt(params.id);

	if (isNaN(bookingId)) {
		return json({ error: 'Invalid booking ID' }, { status: 400 });
	}

	try {
		// Fetch the booking to verify ownership and conditions
		const [booking] = await db
			.select()
			.from(bookingRequests)
			.where(eq(bookingRequests.id, bookingId));

		if (!booking) {
			return json({ error: 'Booking not found' }, { status: 404 });
		}

		// Verify the booking belongs to the instructor
		if (booking.instructorId !== user.id) {
			return json(
				{ error: 'Forbidden: You can only delete your own bookings' },
				{ status: 403 }
			);
		}

		// Only allow deleting manual bookings
		if (booking.source !== 'manual') {
			return json(
				{ error: 'Forbidden: Only manual bookings can be deleted' },
				{ status: 403 }
			);
		}

		// Only allow deleting bookings in "accepted" status
		// Don't allow deleting completed bookings (they have reviews) or cancelled ones
		if (booking.status !== 'accepted') {
			return json(
				{
					error: `Cannot delete booking with status "${booking.status}". Only accepted bookings can be deleted.`
				},
				{ status: 400 }
			);
		}

		// Delete the booking
		await db.delete(bookingRequests).where(eq(bookingRequests.id, bookingId));

		return json(
			{
				success: true,
				message: 'Booking deleted successfully'
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting booking:', error);
		return json({ error: 'Failed to delete booking' }, { status: 500 });
	}
};
