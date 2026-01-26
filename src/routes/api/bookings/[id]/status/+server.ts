import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { hasInstructorRole } from '$src/lib/utils/roles';

const bookingService = new BookingRequestService();

export const PATCH: RequestHandler = async (event) => {
	const user = event.locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	if (!hasInstructorRole(user)) {
		throw error(403, 'Only instructors can update booking status');
	}

	const bookingId = parseInt(event.params.id);
	if (isNaN(bookingId)) {
		throw error(400, 'Invalid booking ID');
	}

	try {
		const body = await event.request.json();
		const { status } = body ?? {};

		if (!status || typeof status !== 'string') {
			throw error(400, 'Status is required');
		}

		const updated = await bookingService.updateBookingStatusForInstructor(bookingId, user.id, status);

		return json({
			success: true,
			booking: updated
		});
	} catch (err) {
		console.error('Error updating booking status:', err);

		if (err instanceof Error) {
			if (err.message === 'Booking not found') {
				throw error(404, 'Booking not found');
			}
			if (err.message === 'Not authorized') {
				throw error(403, 'You can only update your own bookings');
			}
			if (err.message === 'Invalid status') {
				throw error(400, 'Invalid status');
			}
			if (err.message === 'Booking is inactive') {
				throw error(409, 'Cannot update an inactive booking');
			}
			if (err.message === 'Booking must be accepted before completing') {
				throw error(409, 'Booking must be accepted before completing');
			}
			if (err.message === 'Failed to update booking status') {
				throw error(500, 'Failed to update booking status');
			}
		}

		throw error(500, 'Failed to update booking status');
	}
};
