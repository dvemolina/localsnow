import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';

const bookingService = new BookingRequestService();
const tentativeService = new TentativeBookingService();
const depositService = new ClientDepositService();

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
        
        if (!booking || booking.instructorId !== user.id) {
            throw error(404, 'Booking not found');
        }

        // Reject booking
        await bookingService.updateBookingStatus(bookingId, 'rejected');
        
        // Release tentative blocks
        await tentativeService.releaseTentativeBlocks(bookingId);
        
        // Refund deposit
        const deposit = await depositService.getDepositByBookingRequest(bookingId);
        if (deposit && deposit.status === 'held') {
            await depositService.refundDeposit(deposit.id, 'instructor_rejected');
        }

        return json({ success: true, message: 'Booking rejected and deposit refunded' });
    } catch (err) {
        console.error('Error rejecting booking:', err);
        
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        
        throw error(500, 'Failed to reject booking');
    }
};