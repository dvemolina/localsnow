import { json } from '@sveltejs/kit';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
    try {
        const { bookingRequestId, clientEmail } = await request.json();

        if (!bookingRequestId || !clientEmail) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const depositService = new ClientDepositService();
        
        // Generate success/cancel URLs
        const baseUrl = url.origin;
        const successUrl = `${baseUrl}/api/deposits/success`;
        const cancelUrl = `${baseUrl}/booking-request-cancelled`;

        const result = await depositService.createDepositPaymentIntent(
            bookingRequestId,
            clientEmail,
            successUrl,
            cancelUrl
        );

        return json({
            success: true,
            sessionId: result.sessionId,
            url: result.url,
            depositId: result.depositId
        });
    } catch (error) {
        console.error('Error creating deposit payment:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to create deposit payment' },
            { status: 500 }
        );
    }
};