import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { syncAllInstructorCalendars } from '$lib/server/google/sync';
import { CRON_SECRET } from '$lib/server/config';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';

const tentativeBookingService = new TentativeBookingService();

/**
 * Cron endpoint - should be called hourly by your server cron
 * Protect with a secret token in production
 */
export const POST: RequestHandler = async ({ request }) => {
	// Verify cron secret (add CRON_SECRET to your .env)
	const authHeader = request.headers.get('authorization');

	if (!CRON_SECRET) {
		console.error('CRON_SECRET environment variable is not set');
		return json({ error: 'Server configuration error' }, { status: 500 });
	}

	if (authHeader !== `Bearer ${CRON_SECRET}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Run cleanup tasks
		const [cleanupResult, syncResult] = await Promise.allSettled([
			tentativeBookingService.cleanupExpiredBlocks(),
			syncAllInstructorCalendars()
		]);

		const response: any = {
			timestamp: new Date().toISOString(),
			tasks: {}
		};

		// Cleanup expired blocks result
		if (cleanupResult.status === 'fulfilled') {
			response.tasks.cleanup = {
				success: true,
				...cleanupResult.value
			};
		} else {
			response.tasks.cleanup = {
				success: false,
				error: cleanupResult.reason.message
			};
		}

		// Calendar sync result
		if (syncResult.status === 'fulfilled') {
			response.tasks.sync = {
				success: true,
				...syncResult.value
			};
		} else {
			response.tasks.sync = {
				success: false,
				error: syncResult.reason.message
			};
		}

		return json(response);
	} catch (error) {
		console.error('Cron job error:', error);
		return json(
			{
				error: 'Cron job failed',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};