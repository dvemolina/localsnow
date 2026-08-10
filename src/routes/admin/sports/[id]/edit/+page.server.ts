import { db } from '$lib/server/db';
import { sports } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminAccess } from '$src/lib/utils/roles';
import { getAdminActionAccessFailure } from '$lib/server/adminAccess';
import { isSportName, isSportSlug } from '$src/features/Sports/lib/sportsConstants';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const sport = await db.query.sports.findFirst({
		where: eq(sports.id, parseInt(params.id))
	});

	if (!sport) {
		error(404, 'Sport not found');
	}

	return { sport };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const accessFailure = getAdminActionAccessFailure(locals.user);
		if (accessFailure) return accessFailure;

		const formData = await request.formData();
		const sport = formData.get('sport');
		const sportSlug = formData.get('sportSlug');

		// Validation
		if (!isSportName(sport) || !isSportSlug(sportSlug)) {
			return fail(400, { error: 'Sport name and slug are required' });
		}

		// Check if slug exists for another sport
		const existing = await db.query.sports.findFirst({
			where: (sports, { eq, and, ne }) =>
				and(eq(sports.sportSlug, sportSlug), ne(sports.id, parseInt(params.id)))
		});

		if (existing) {
			return fail(400, { error: 'Slug already exists for another sport' });
		}

		let updateError = false;

		try {
			await db
				.update(sports)
				.set({
					sport,
					sportSlug
				})
				.where(eq(sports.id, parseInt(params.id)));
		} catch (err) {
			console.error('Error updating sport:', err);
			updateError = true;
		}

		if (updateError) {
			return fail(500, { error: 'Failed to update sport' });
		}

		return { success: true, message: 'Sport updated successfully' };
	},

	delete: async ({ params, locals }) => {
		if (!locals.user || !hasAdminAccess(locals.user)) {
			return fail(403, { error: 'Unauthorized' });
		}

		let deleteError = false;

		try {
			await db.delete(sports).where(eq(sports.id, parseInt(params.id)));
		} catch (err) {
			console.error('Error deleting sport:', err);
			deleteError = true;
		}

		if (deleteError) {
			return fail(500, { error: 'Failed to delete sport. It may be in use by instructors.' });
		}

		// Redirect OUTSIDE try-catch
		redirect(303, '/admin/sports');
	}
};
