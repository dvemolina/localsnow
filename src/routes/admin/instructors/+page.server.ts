// src/routes/admin/instructors/+page.server.ts
import { adminInstructorService } from '$src/features/Admin/lib/adminInstructorService';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const search = url.searchParams.get('search') || undefined;
	const verified = url.searchParams.get('verified');
	const suspended = url.searchParams.get('suspended');

	const filters = {
		search,
		isVerified: verified === 'true' ? true : verified === 'false' ? false : undefined,
		isSuspended: suspended === 'true' ? true : suspended === 'false' ? false : undefined
	};

	const result = await adminInstructorService.getAllInstructors(filters, page, 20);

	return {
		...result,
		filters: {
			search,
			verified,
			suspended
		}
	};
};

export const actions: Actions = {
	verify: async ({ request, locals }) => {
		const formData = await request.formData();
		const instructorId = parseInt(formData.get('instructorId') as string);

		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminInstructorService.verifyInstructor(instructorId, locals.user.id);

		return { success: true, message: 'Instructor verified successfully' };
	},

	suspend: async ({ request, locals }) => {
		const formData = await request.formData();
		const instructorId = parseInt(formData.get('instructorId') as string);
		const reason = formData.get('reason') as string;

		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		if (!reason) {
			return fail(400, { error: 'Suspension reason is required' });
		}

		await adminInstructorService.suspendInstructor(instructorId, locals.user.id, reason);

		return { success: true, message: 'Instructor suspended' };
	},

	unsuspend: async ({ request, locals }) => {
		const formData = await request.formData();
		const instructorId = parseInt(formData.get('instructorId') as string);

		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminInstructorService.unsuspendInstructor(instructorId, locals.user.id);

		return { success: true, message: 'Instructor unsuspended' };
	}
};
