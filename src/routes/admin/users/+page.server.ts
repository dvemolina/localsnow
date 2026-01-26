// src/routes/admin/users/+page.server.ts
import { adminUserService } from '$src/features/Admin/lib/adminUserService';
import { fail } from '@sveltejs/kit';
import { hasRole } from '$src/lib/utils/roles';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const role = url.searchParams.get('role') || undefined;
	const search = url.searchParams.get('search') || undefined;

	const filters = { role, search };
	const result = await adminUserService.getAllUsers(filters, page, 50);

	return { ...result, filters };
};

export const actions: Actions = {
	suspend: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = parseInt(formData.get('userId') as string);
		const reason = formData.get('reason') as string;

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminUserService.suspendUser(userId, locals.user.id, reason);
		return { success: true };
	},

	unsuspend: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = parseInt(formData.get('userId') as string);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminUserService.unsuspendUser(userId, locals.user.id);
		return { success: true };
	}
};
