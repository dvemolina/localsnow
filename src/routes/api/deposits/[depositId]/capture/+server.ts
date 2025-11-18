import { json } from '@sveltejs/kit';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import { requireAuth } from '$src/lib/utils/auth';
import { db } from '$lib/server/db';
import { clientDeposits, bookingRequests } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    try {
        // Require authentication
        const user = requireAuth(event, 'Login to capture deposit');

        const depositId = parseInt(event.params.depositId);
        const { reason } = await event.request.json();

        if (isNaN(depositId)) {
            return json({ error: 'Invalid deposit ID' }, { status: 400 });
        }

        // Verify ownership: user must be the instructor for this booking
        const [deposit] = await db
            .select({
                depositId: clientDeposits.id,
                bookingRequestId: clientDeposits.bookingRequestId
            })
            .from(clientDeposits)
            .where(eq(clientDeposits.id, depositId));

        if (!deposit) {
            return json({ error: 'Deposit not found' }, { status: 404 });
        }

        const [booking] = await db
            .select({
                instructorId: bookingRequests.instructorId
            })
            .from(bookingRequests)
            .where(eq(bookingRequests.id, deposit.bookingRequestId));

        if (!booking || booking.instructorId !== user.id) {
            return json({ error: 'Unauthorized: You can only capture deposits for your own bookings' }, { status: 403 });
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