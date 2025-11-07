import { json, error, type RequestHandler } from '@sveltejs/kit';

import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';

const bookingService = new BookingRequestService();

export const DELETE: RequestHandler = async ({ params }) => {
    const bookingId = parseInt(params.bookingId);
    
    if (isNaN(bookingId)) {
        throw error(400, 'Invalid booking ID');
    }

    try {
        // Mark booking as cancelled/expired
        await bookingService.updateBookingStatus(bookingId, 'expired');
        
        return json({ success: true, message: 'Booking cancelled' });
    } catch (err) {
        console.error('Error cancelling booking:', err);
        throw error(500, 'Failed to cancel booking');
    }
};