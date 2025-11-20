// src/routes/admin/launch-codes/+page.server.ts
import { db } from '$lib/server/db';
import { launchCodes, bookingRequests, leadPayments } from '$lib/server/db/schema';
import { desc, eq, sql, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// Fetch all launch codes with usage statistics
	const codes = await db.query.launchCodes.findMany({
		orderBy: [desc(launchCodes.createdAt)]
	});

	// Get usage statistics for each code
	const codesWithStats = await Promise.all(
		codes.map(async (code) => {
			// Count booking requests that used this code
			const bookingUsage = await db
				.select({ count: count() })
				.from(bookingRequests)
				.where(eq(bookingRequests.usedLaunchCode, code.code));

			// Count lead payments that used this code
			const leadUsage = await db
				.select({ count: count() })
				.from(leadPayments)
				.where(eq(leadPayments.usedLaunchCode, code.code));

			return {
				...code,
				bookingUsage: bookingUsage[0]?.count || 0,
				leadUsage: leadUsage[0]?.count || 0,
				totalUsage: (bookingUsage[0]?.count || 0) + (leadUsage[0]?.count || 0)
			};
		})
	);

	return {
		codes: codesWithStats
	};
};

export const actions: Actions = {
	// Toggle active status
	toggle: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) {
			return fail(400, { error: 'Invalid code ID' });
		}

		try {
			// Get current status
			const code = await db.query.launchCodes.findFirst({
				where: eq(launchCodes.id, id)
			});

			if (!code) {
				return fail(404, { error: 'Code not found' });
			}

			// Toggle status
			await db
				.update(launchCodes)
				.set({ isActive: !code.isActive })
				.where(eq(launchCodes.id, id));

			return { success: true };
		} catch (error) {
			console.error('Error toggling launch code:', error);
			return fail(500, { error: 'Failed to toggle code' });
		}
	},

	// Delete launch code
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) {
			return fail(400, { error: 'Invalid code ID' });
		}

		try {
			await db.delete(launchCodes).where(eq(launchCodes.id, id));
			return { success: true };
		} catch (error) {
			console.error('Error deleting launch code:', error);
			return fail(500, { error: 'Failed to delete code' });
		}
	}
};
