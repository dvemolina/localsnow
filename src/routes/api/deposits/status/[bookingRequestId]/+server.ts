import { json } from '@sveltejs/kit';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const bookingRequestId = parseInt(params.bookingRequestId);

        if (isNaN(bookingRequestId)) {
            return json({ error: 'Invalid booking request ID' }, { status: 400 });
        }

        const depositService = new ClientDepositService();
        const status = await depositService.getDepositStatus(bookingRequestId);

        return json(status);
    } catch (error) {
        console.error('Error getting deposit status:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to get deposit status' },
            { status: 500 }
        );
    }
};