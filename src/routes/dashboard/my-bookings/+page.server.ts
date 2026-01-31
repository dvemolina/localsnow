import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { requireDashboardRole } from '$src/lib/utils/dashboardAuth';

const bookingService = new BookingRequestService();

export const load: PageServerLoad = async (event) => {
    const user = requireDashboardRole(event, ['client'], 'Login to access your bookings');

    // Use user ID (preferred) with email fallback for backward compatibility
    const clientUserId = user.id;
    const clientEmail = user.email;
    const bookingRequests = await bookingService.getBookingRequestsByClient(clientUserId, clientEmail);

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
    cancel: async (event) => {
        const user = requireDashboardRole(event, ['client'], 'Session expired. Please login again.');

        const formData = await event.request.formData();
        const bookingRequestId = parseInt(formData.get('bookingRequestId') as string);

        try {
            // Use user ID (preferred) with email fallback
            const result = await bookingService.cancelBookingRequest(
                bookingRequestId,
                user.id,
                user.email
            );

            // Build detailed success message
            let message = 'Booking request cancelled successfully.';
            if (result.usedLaunchCode) {
                message += ' (No deposit to refund - launch code booking)';
            } else if (result.depositRefunded) {
                message += ` Your deposit of ${result.refundAmount} ${result.currency} has been refunded.`;
            } else {
                message += ' No deposit was found for this booking.';
            }

            return { success: true, message };
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return fail(400, { error: (error as Error).message || 'Failed to cancel booking request' });
        }
    }
};
