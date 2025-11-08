import { json } from '@sveltejs/kit';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        const cronSecret = env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const depositService = new ClientDepositService();
        const result = await depositService.processExpiredDeposits();

        console.log(`Processed ${result.processedCount} expired deposits:`, result.depositIds);

        return json({
            success: true,
            processedCount: result.processedCount,
            depositIds: result.depositIds,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing expired deposits:', error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to process expired deposits' },
            { status: 500 }
        );
    }
};

// GET endpoint removed for security - cron jobs should only use POST with Bearer token authentication