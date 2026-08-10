import { db } from '$lib/server/db';
import { sports } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { getAdminActionAccessFailure } from '$lib/server/adminAccess';
import { isSportName, isSportSlug } from '$src/features/Sports/lib/sportsConstants';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const accessFailure = getAdminActionAccessFailure(locals.user);
		if (accessFailure) return accessFailure;

		const formData = await request.formData();
		const sport = formData.get('sport');
		const sportSlug = formData.get('sportSlug');

		// Validation
		if (!isSportName(sport) || !isSportSlug(sportSlug)) {
			return fail(400, { error: 'Sport name and slug are required' });
		}

		// Check if slug already exists
		const existing = await db.query.sports.findFirst({
			where: (sports, { eq }) => eq(sports.sportSlug, sportSlug)
		});

		if (existing) {
			return fail(400, { error: 'Slug already exists' });
		}

		try {
			await db.insert(sports).values({
				sport,
				sportSlug
			});

			console.log('Sport created successfully');
		} catch (error) {
			console.error('Error creating sport:', error);
			return fail(500, { error: 'Failed to create sport' });
		}

		// Redirect OUTSIDE try-catch
		redirect(303, '/admin/sports');
	}
};
