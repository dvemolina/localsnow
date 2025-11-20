// src/routes/admin/launch-codes/[id]/edit/+page.server.ts
import { db } from '$lib/server/db';
import { launchCodes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);

	if (!id || isNaN(id)) {
		throw error(400, 'Invalid code ID');
	}

	const code = await db.query.launchCodes.findFirst({
		where: eq(launchCodes.id, id)
	});

	if (!code) {
		throw error(404, 'Code not found');
	}

	return {
		code
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const data = await request.formData();

		const code = data.get('code')?.toString().trim().toUpperCase();
		const description = data.get('description')?.toString().trim();
		const validUntil = data.get('validUntil')?.toString();
		const maxUses = data.get('maxUses')?.toString();
		const isActive = data.get('isActive') === 'on';

		// Validation
		if (!code) {
			return fail(400, { error: 'Code is required' });
		}

		if (!/^[A-Z0-9]+$/.test(code)) {
			return fail(400, { error: 'Code must contain only letters and numbers' });
		}

		if (!validUntil) {
			return fail(400, { error: 'Valid until date is required' });
		}

		// Check if code already exists (excluding current)
		const existing = await db.query.launchCodes.findFirst({
			where: (codes, { eq, and, ne }) =>
				and(eq(codes.code, code), ne(codes.id, id))
		});

		if (existing) {
			return fail(400, { error: 'Code already exists' });
		}

		try {
			await db.update(launchCodes)
				.set({
					code,
					description: description || null,
					validUntil: new Date(validUntil),
					maxUses: maxUses ? parseInt(maxUses) : null,
					isActive
				})
				.where(eq(launchCodes.id, id));

			throw redirect(303, '/admin/launch-codes');
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error updating launch code:', error);
			return fail(500, { error: 'Failed to update code' });
		}
	}
};
