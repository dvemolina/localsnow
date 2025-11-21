import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';

const bookingService = new BookingRequestService();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, '/login');
    }

    const clientEmail = locals.user.email;
    const bookingRequests = await bookingService.getBookingRequestsByClient(clientEmail);

    // Get counts for filtering
    const counts = {
        all: bookingRequests.length,
        active: bookingRequests.filter(b => ['pending', 'viewed'].includes(b.status)).length,
        completed: bookingRequests.filter(b => b.status === 'accepted').length,
        cancelled: bookingRequests.filter(b => ['rejected', 'cancelled', 'expired'].includes(b.status)).length
    };

    return {
        bookingRequests,
        counts,
        clientEmail
    };
};

export const actions: Actions = {
    cancel: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const bookingRequestId = parseInt(formData.get('bookingRequestId') as string);

        try {
            await bookingService.cancelBookingRequest(bookingRequestId, locals.user.email);
            return { success: true, message: 'Booking request cancelled successfully' };
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return fail(400, { error: (error as Error).message || 'Failed to cancel booking request' });
        }
    }
};
