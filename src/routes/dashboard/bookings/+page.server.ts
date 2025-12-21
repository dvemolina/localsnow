import { requireAuth } from "$src/lib/utils/auth";
import { redirect, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { BookingRequestService } from "$src/features/Bookings/lib/bookingRequestService";

const bookingService = new BookingRequestService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access bookings');
    
    // Only instructors can access
    if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
        redirect(302, '/dashboard');
    }
    
    const statusFilter = event.url.searchParams.get('status') || 'all';
    
    try {
        // Delegate to service layer
        const bookings = await bookingService.getBookingsWithDetailsForInstructor(user.id, statusFilter);
        
        return {
            bookings,
            currentFilter: statusFilter
        };
    } catch (error) {
        console.error('Error loading bookings:', error);
        return {
            bookings: [],
            currentFilter: statusFilter
        };
    }
};

export const actions: Actions = {
    acceptBooking: async (event) => {
        const user = requireAuth(event, 'Session expired. Please login again.');
        
        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Not authorized' });
        }
        
        const formData = await event.request.formData();
        const bookingId = parseInt(formData.get('bookingId') as string);
        
        if (isNaN(bookingId)) {
            return fail(400, { message: 'Invalid booking ID' });
        }
        
        try {
            await bookingService.updateRequestStatus(bookingId, 'accepted');
            return { success: true, message: 'Booking accepted!' };
        } catch (error) {
            console.error('Error accepting booking:', error);
            return fail(500, { message: 'Failed to accept booking' });
        }
    },
    
    rejectBooking: async (event) => {
        const user = requireAuth(event, 'Session expired. Please login again.');

        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Not authorized' });
        }

        const formData = await event.request.formData();
        const bookingId = parseInt(formData.get('bookingId') as string);

        if (isNaN(bookingId)) {
            return fail(400, { message: 'Invalid booking ID' });
        }

        try {
            // Verify ownership
            const booking = await bookingService.getBookingRequestById(bookingId);

            if (!booking || booking.instructorId !== user.id) {
                return fail(404, { message: 'Booking not found' });
            }

            // Reject booking and release tentative blocks (handled by updateBookingStatus)
            await bookingService.updateBookingStatus(bookingId, 'rejected');

            // No deposit refund needed - platform is 100% free

            return { success: true, message: 'Booking rejected' };
        } catch (error) {
            console.error('Error rejecting booking:', error);
            return fail(500, { message: 'Failed to reject booking' });
        }
    }
};