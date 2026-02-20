// src/routes/admin/instructors/[id]/+page.server.ts
import { adminInstructorService } from '$src/features/Admin/lib/adminInstructorService';
import { error, fail } from '@sveltejs/kit';
import { hasRole } from '$src/lib/utils/roles';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const instructorId = parseInt(params.id);

	if (isNaN(instructorId)) {
		error(400, 'Invalid instructor ID');
	}

	const result = await adminInstructorService.getInstructorById(instructorId);

	if (!result) {
		error(404, 'Instructor not found');
	}

	return result;
};

export const actions: Actions = {
	verify: async ({ params, locals, request }) => {
		const instructorId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const result = await adminInstructorService.verifyInstructor(
			instructorId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'Instructor verified successfully' };
	},

	reject: async ({ params, locals, request }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;
		const instructorId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		if (!reason) {
			return fail(400, { error: 'Rejection reason is required' });
		}

		await adminInstructorService.rejectInstructor(
			instructorId,
			locals.user.id,
			reason,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'Instructor verification rejected' };
	},

	suspend: async ({ params, locals, request }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;
		const instructorId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		if (!reason) {
			return fail(400, { error: 'Suspension reason is required' });
		}

		await adminInstructorService.suspendInstructor(
			instructorId,
			locals.user.id,
			reason,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'Instructor suspended successfully' };
	},

	unsuspend: async ({ params, locals, request }) => {
		const instructorId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminInstructorService.unsuspendInstructor(
			instructorId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'Instructor unsuspended successfully' };
	},

	publish: async ({ params, locals, request }) => {
		const instructorId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminInstructorService.publishInstructor(
			instructorId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'Instructor published successfully' };
	},

	unpublish: async ({ params, locals, request }) => {
		const instructorId = parseInt(params.id);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminInstructorService.unpublishInstructor(
			instructorId,
			locals.user.id,
			{ request, getClientAddress: () => null }
		);

		return { success: true, message: 'Instructor unpublished successfully' };
	}
};
