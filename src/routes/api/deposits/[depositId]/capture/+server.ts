import { json } from '@sveltejs/kit';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
    try {
        const depositId = parseInt(params.depositId);
        const { reason } = await request.json();

        if (isNaN(depositId)) {
            return json({ error: 'Invalid deposit ID' }, { status: 400 });
        }

        const depositService = new ClientDepositService();
        const result = await depositService.captureDeposit(depositId, reason || 'no_show');

        return json({
            success: true,
            depositId: result.depositId,
            reason: result.reason
        });
    } catch (error) {
        console.error('Error capturing deposit:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to capture deposit' },
            { status: 500 }
        );
    }
};