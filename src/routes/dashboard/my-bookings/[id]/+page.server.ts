import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';

const bookingService = new BookingRequestService();

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        redirect(302, '/login');
    }

    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
        error(400, 'Invalid booking ID');
    }

    // Get all bookings for this client to find the one we want
    // Use user ID (preferred) with email fallback for backward compatibility
    const bookings = await bookingService.getBookingRequestsByClient(locals.user.id, locals.user.email);
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
        error(404, 'Booking request not found');
    }

    return {
        booking
    };
};
