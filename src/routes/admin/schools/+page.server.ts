// src/routes/admin/schools/+page.server.ts
import { adminSchoolService } from '$src/features/Admin/lib/adminSchoolService';
import { fail } from '@sveltejs/kit';
import { hasRole } from '$src/lib/utils/roles';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const search = url.searchParams.get('search') || undefined;
	const verified = url.searchParams.get('verified');
	const suspended = url.searchParams.get('suspended');
	const published = url.searchParams.get('published');

	const filters = {
		search,
		isVerified: verified === 'true' ? true : verified === 'false' ? false : undefined,
		isSuspended: suspended === 'true' ? true : suspended === 'false' ? false : undefined,
		isPublished: published === 'true' ? true : published === 'false' ? false : undefined
	};

	const result = await adminSchoolService.getAllSchools(filters, page, 20);

	return {
		...result,
		filters: {
			search,
			verified,
			suspended,
			published
		}
	};
};

export const actions: Actions = {
	verify: async ({ request, locals }) => {
		const formData = await request.formData();
		const schoolId = parseInt(formData.get('schoolId') as string);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminSchoolService.verifySchool(schoolId, locals.user.id);

		return { success: true, message: 'School verified successfully' };
	},

	suspend: async ({ request, locals }) => {
		const formData = await request.formData();
		const schoolId = parseInt(formData.get('schoolId') as string);
		const reason = formData.get('reason') as string;

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		if (!reason) {
			return fail(400, { error: 'Suspension reason is required' });
		}

		await adminSchoolService.suspendSchool(schoolId, locals.user.id, reason);

		return { success: true, message: 'School suspended' };
	},

	unsuspend: async ({ request, locals }) => {
		const formData = await request.formData();
		const schoolId = parseInt(formData.get('schoolId') as string);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminSchoolService.unsuspendSchool(schoolId, locals.user.id);

		return { success: true, message: 'School unsuspended' };
	}
};
