// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session?.user) {
		throw redirect(302, '/login');
	}

	// Check if user is admin
	if (session.user.role !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	return {
		user: session.user
	};
};
