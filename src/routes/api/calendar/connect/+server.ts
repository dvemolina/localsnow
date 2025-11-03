import { json } from '@sveltejs/kit';
import { getCalendarAuthUrl, disconnectCalendar, isCalendarConnected } from '$lib/server/google/oauth';
import { triggerManualSync } from '$lib/server/google/sync';
import type { RequestHandler } from './$types';

// Connect calendar (get OAuth URL)
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	// Check if already connected
	const connected = await isCalendarConnected(user.id);
	
	if (connected) {
		return json({ connected: true });
	}
	
	// Generate OAuth URL for calendar
	const authUrl = getCalendarAuthUrl(user.id);
	
	return json({ authUrl });
};

// Disconnect calendar
export const DELETE: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		await disconnectCalendar(user.id);
		return json({ success: true });
	} catch (error) {
		return json({ error: 'Failed to disconnect calendar' }, { status: 500 });
	}
};

// Manual sync trigger
export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const result = await triggerManualSync(user.id);
		return json(result);
	} catch (error) {
		return json({ 
			error: error instanceof Error ? error.message : 'Sync failed' 
		}, { status: 500 });
	}
};