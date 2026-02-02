// src/routes/admin/schools/[id]/+page.server.ts
import { adminSchoolService } from '$src/features/Admin/lib/adminSchoolService';
import { error, fail } from '@sveltejs/kit';
import { hasRole } from '$src/lib/utils/roles';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const schoolId = parseInt(params.id);

	if (isNaN(schoolId)) {
		error(400, 'Invalid school ID');
	}

	const result = await adminSchoolService.getSchoolById(schoolId);

	if (!result) {
		error(404, 'School not found');
	}

	return result;
};

export const actions: Actions = {
	verify: async ({ params, locals, request }) => {
		const schoolId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminSchoolService.verifySchool(
			schoolId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'School verified successfully' };
	},

	reject: async ({ params, locals, request }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;
		const schoolId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		if (!reason) {
			return fail(400, { error: 'Rejection reason is required' });
		}

		await adminSchoolService.rejectSchool(
			schoolId,
			locals.user.id,
			reason,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'School verification rejected' };
	},

	suspend: async ({ params, locals, request }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;
		const schoolId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		if (!reason) {
			return fail(400, { error: 'Suspension reason is required' });
		}

		await adminSchoolService.suspendSchool(
			schoolId,
			locals.user.id,
			reason,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'School suspended successfully' };
	},

	unsuspend: async ({ params, locals, request }) => {
		const schoolId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminSchoolService.unsuspendSchool(
			schoolId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'School unsuspended successfully' };
	},

	publish: async ({ params, locals, request }) => {
		const schoolId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminSchoolService.publishSchool(
			schoolId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'School published successfully' };
	},

	unpublish: async ({ params, locals, request }) => {
		const schoolId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminSchoolService.unpublishSchool(
			schoolId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'School unpublished successfully' };
	}
};
