import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

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
