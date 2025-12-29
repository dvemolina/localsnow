import type { PageServerLoad, Actions } from './$types';
import { SchoolInstructorService } from '$src/features/Schools/lib/schoolInstructorService';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { school } = await parent();

	const instructorService = new SchoolInstructorService();
	const activeInstructors = await instructorService.getActiveInstructors(school.id);

	return {
		activeInstructors
	};
};

export const actions: Actions = {
	deactivate: async ({ request, parent }) => {
		const { school } = await parent();
		const formData = await request.formData();
		const instructorId = Number(formData.get('instructorId'));

		if (!instructorId) {
			return fail(400, { message: 'Instructor ID is required' });
		}

		try {
			const instructorService = new SchoolInstructorService();
			await instructorService.deactivateInstructor(
				school.id,
				school.name,
				instructorId,
				'', // Email will be fetched in service
				'' // Name will be fetched in service
			);

			return { success: true, message: 'Instructor deactivated successfully' };
		} catch (error) {
			console.error('Error deactivating instructor:', error);
			return fail(500, { message: 'Failed to deactivate instructor' });
		}
	},

	reactivate: async ({ request, parent }) => {
		const { school } = await parent();
		const formData = await request.formData();
		const instructorId = Number(formData.get('instructorId'));

		if (!instructorId) {
			return fail(400, { message: 'Instructor ID is required' });
		}

		try {
			const instructorService = new SchoolInstructorService();
			await instructorService.reactivateInstructor(school.id, instructorId);

			return { success: true, message: 'Instructor reactivated successfully' };
		} catch (error) {
			console.error('Error reactivating instructor:', error);
			return fail(500, { message: 'Failed to reactivate instructor' });
		}
	}
};
