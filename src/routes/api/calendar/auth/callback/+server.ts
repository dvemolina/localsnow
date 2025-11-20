import { handleCalendarOAuthCallback } from '$lib/server/google/oauth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const error = url.searchParams.get('error');

	// Handle user denial
	if (error) {
		redirect(303, '/dashboard/availability?error=access_denied');
	}

	if (!code || !state) {
		redirect(303, '/dashboard/availability?error=invalid_request');
	}

	// Parse and validate state
	let parsedState;
	try {
		parsedState = JSON.parse(state);
	} catch (parseError) {
		console.error('Invalid state parameter:', parseError);
		// parsedState will be undefined, caught below
	}

	if (!parsedState || !parsedState?.instructorId) {
		// Redirect OUTSIDE try-catch
		redirect(303, '/dashboard/availability?error=invalid_state');
	}

	// Handle OAuth callback
	let callbackError = false;
	try {
		await handleCalendarOAuthCallback(code, parsedState.instructorId);
	} catch (err) {
		console.error('Calendar OAuth callback error:', err);
		callbackError = true;
	}

	// Redirect OUTSIDE try-catch
	if (callbackError) {
		redirect(303, '/dashboard/availability?error=connection_failed');
	}

	redirect(303, '/dashboard/availability?success=connected');
};