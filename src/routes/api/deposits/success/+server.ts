import { redirect } from '@sveltejs/kit';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        throw redirect(303, '/booking/booking-error?reason=no_session');
    }

    try {
        const depositService = new ClientDepositService();
        const result = await depositService.handleSuccessfulDeposit(sessionId);

        if (result.success) {
            // Redirect to success page with booking ID
            throw redirect(303, `/booking/booking-success?bookingId=${result.bookingRequestId}`);
        } else {
            throw redirect(303, '/booking/booking-error?reason=payment_failed');
        }
    } catch (error) {
        console.error('Error handling deposit success:', error);
        throw redirect(303, '/booking/booking-error?reason=processing_error');
    }
};