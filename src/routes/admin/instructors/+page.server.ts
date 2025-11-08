// src/routes/admin/instructors/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq, or, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const verificationFilter = url.searchParams.get('filter');

		// Get all instructors
		let query = db
			.select()
			.from(users)
			.where(
				or(eq(users.role, 'instructor-independent'), eq(users.role, 'instructor-school'))
			)
			.$dynamic();

		// Apply verification filter if provided
		if (verificationFilter === 'pending') {
			query = query.where(
				sql`(${users.role} = 'instructor-independent' OR ${users.role} = 'instructor-school') AND ${users.isVerified} = false`
			);
		} else if (verificationFilter === 'verified') {
			query = query.where(
				sql`(${users.role} = 'instructor-independent' OR ${users.role} = 'instructor-school') AND ${users.isVerified} = true`
			);
		}

		const instructors = await query.orderBy(sql`${users.createdAt} DESC`);

		return {
			instructors,
			currentFilter: verificationFilter
		};
	} catch (error) {
		console.error('Error loading instructors:', error);
		return {
			instructors: [],
			currentFilter: null
		};
	}
};

export const actions: Actions = {
	verify: async ({ request }) => {
		const formData = await request.formData();
		const instructorId = formData.get('instructorId');

		if (!instructorId) {
			return fail(400, { error: 'Instructor ID is required' });
		}

		try {
			await db
				.update(users)
				.set({ isVerified: true, updatedAt: new Date() })
				.where(eq(users.id, parseInt(instructorId as string)));

			return { success: true };
		} catch (error) {
			console.error('Error verifying instructor:', error);
			return fail(500, { error: 'Failed to verify instructor' });
		}
	},

	unverify: async ({ request }) => {
		const formData = await request.formData();
		const instructorId = formData.get('instructorId');

		if (!instructorId) {
			return fail(400, { error: 'Instructor ID is required' });
		}

		try {
			await db
				.update(users)
				.set({ isVerified: false, updatedAt: new Date() })
				.where(eq(users.id, parseInt(instructorId as string)));

			return { success: true };
		} catch (error) {
			console.error('Error unverifying instructor:', error);
			return fail(500, { error: 'Failed to unverify instructor' });
		}
	}
};
