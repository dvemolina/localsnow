// src/routes/admin/launch-codes/create/+page.server.ts
import { db } from '$lib/server/db';
import { launchCodes } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const code = data.get('code')?.toString().trim().toUpperCase();
		const description = data.get('description')?.toString().trim();
		const validUntil = data.get('validUntil')?.toString();
		const maxUses = data.get('maxUses')?.toString();
		const isActive = data.get('isActive') === 'on';

		// Validation
		if (!code) {
			return fail(400, { error: 'Code is required', code, description });
		}

		if (!/^[A-Z0-9]+$/.test(code)) {
			return fail(400, { error: 'Code must contain only letters and numbers', code, description });
		}

		if (!validUntil) {
			return fail(400, { error: 'Valid until date is required', code, description });
		}

		// Check if code already exists
		const existing = await db.query.launchCodes.findFirst({
			where: (codes, { eq }) => eq(codes.code, code)
		});

		if (existing) {
			return fail(400, { error: 'Code already exists', code, description });
		}

		try {
			await db.insert(launchCodes).values({
				code,
				description: description || null,
				validUntil: new Date(validUntil),
				maxUses: maxUses ? parseInt(maxUses) : null,
				isActive
			});

			throw redirect(303, '/admin/launch-codes');
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error creating launch code:', error);
			return fail(500, { error: 'Failed to create code', code, description });
		}
	}
};
