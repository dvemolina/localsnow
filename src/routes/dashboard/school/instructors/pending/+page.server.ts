import type { PageServerLoad, Actions } from './$types';
import { SchoolInstructorService } from '$src/features/Schools/lib/schoolInstructorService';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { school } = await parent();

	const instructorService = new SchoolInstructorService();
	const pendingInstructors = await instructorService.getPendingInstructors(school.id);

	return {
		pendingInstructors
	};
};

export const actions: Actions = {
	accept: async ({ request, parent }) => {
		const { school } = await parent();
		const formData = await request.formData();
		const instructorId = Number(formData.get('instructorId'));
		const instructorEmail = formData.get('instructorEmail') as string;
		const instructorName = formData.get('instructorName') as string;

		if (!instructorId || !instructorEmail || !instructorName) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			const instructorService = new SchoolInstructorService();
			await instructorService.acceptInstructor(
				school.id,
				school.name,
				instructorId,
				instructorEmail,
				instructorName
			);

			return { success: true, message: 'Instructor accepted successfully' };
		} catch (error) {
			console.error('Error accepting instructor:', error);
			return fail(500, { message: 'Failed to accept instructor' });
		}
	},

	reject: async ({ request, parent }) => {
		const { school } = await parent();
		const formData = await request.formData();
		const instructorId = Number(formData.get('instructorId'));
		const instructorEmail = formData.get('instructorEmail') as string;
		const instructorName = formData.get('instructorName') as string;

		if (!instructorId || !instructorEmail || !instructorName) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			const instructorService = new SchoolInstructorService();
			await instructorService.rejectInstructor(
				school.id,
				school.name,
				instructorId,
				instructorEmail,
				instructorName
			);

			return { success: true, message: 'Instructor rejected successfully' };
		} catch (error) {
			console.error('Error rejecting instructor:', error);
			return fail(500, { message: 'Failed to reject instructor' });
		}
	}
};
