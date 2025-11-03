import { handleCalendarOAuthCallback } from '$lib/server/google/oauth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const error = url.searchParams.get('error');
	
	// Handle user denial
	if (error) {
		throw redirect(303, '/dashboard/availability?error=access_denied');
	}
	
	if (!code || !state) {
		throw redirect(303, '/dashboard/availability?error=invalid_request');
	}
	
	try {
		const { instructorId } = JSON.parse(state);
		await handleCalendarOAuthCallback(code, instructorId);
		
	} catch (err) {
		console.error('Calendar OAuth callback error:', err);
		throw redirect(303, '/dashboard/availability?error=connection_failed');
	}

	throw redirect(303, '/dashboard/availability?success=connected');
};