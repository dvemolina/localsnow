import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';

const bookingService = new BookingRequestService();
const tentativeService = new TentativeBookingService();

export const POST: RequestHandler = async ({ params, locals }) => {
    const user = locals.user;
    
    if (!user) {
        throw error(401, 'Unauthorized');
    }

    const bookingId = parseInt(params.bookingId);
    
    if (isNaN(bookingId)) {
        throw error(400, 'Invalid booking ID');
    }

    try {
        // Verify ownership
        const booking = await bookingService.getBookingRequestById(bookingId);
        
        if (!booking) {
            throw error(404, 'Booking not found');
        }
        
        if (booking.instructorId !== user.id) {
            throw error(403, 'Not your booking');
        }

        // Check if can accept
        const canAccept = await tentativeService.canAcceptBooking(bookingId);
        
        if (!canAccept.canAccept) {
            throw error(409, canAccept.reason || 'Cannot accept booking');
        }

        // Accept booking
        await bookingService.updateBookingStatus(bookingId, 'accepted');
        
        // Confirm tentative blocks
        await tentativeService.confirmBooking(bookingId);

        return json({ success: true, message: 'Booking accepted' });
    } catch (err) {
        console.error('Error accepting booking:', err);
        
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        
        throw error(500, 'Failed to accept booking');
    }
};