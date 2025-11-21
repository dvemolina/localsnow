import { json, error, type RequestHandler } from '@sveltejs/kit';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';

const bookingService = new BookingRequestService();

export const DELETE: RequestHandler = async ({ params, locals }) => {
    const bookingId = parseInt(params.bookingId);

    if (isNaN(bookingId)) {
        throw error(400, 'Invalid booking ID');
    }

    try {
        // Get the booking to verify ownership or status
        const booking = await bookingService.getBookingRequestById(bookingId);

        if (!booking) {
            throw error(404, 'Booking not found');
        }

        // Allow deletion if:
        // 1. User is authenticated and is the client who made the booking
        // 2. OR booking is still in 'pending' status (payment not completed yet)
        const isOwner = locals.user && locals.user.email === booking.clientEmail;
        const isPending = booking.status === 'pending';

        if (!isPending && !isOwner) {
            throw error(403, 'Cannot cancel this booking');
        }

        // Only allow cancellation of pending bookings (before payment)
        if (booking.status !== 'pending') {
            throw error(400, 'Only pending bookings can be cancelled this way');
        }

        // Mark booking as cancelled
        await bookingService.updateBookingStatus(bookingId, 'cancelled');

        return json({
            success: true,
            message: 'Booking cancelled successfully',
            bookingId
        });
    } catch (err) {
        console.error('Error cancelling booking:', err);

        // Re-throw known errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        throw error(500, 'Failed to cancel booking');
    }
};