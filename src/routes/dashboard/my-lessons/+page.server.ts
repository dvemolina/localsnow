import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (
		locals.user.role !== 'instructor-independent' &&
		locals.user.role !== 'instructor-school'
	) {
		throw error(403, 'Only instructors can access this page');
	}

	try {
		const service = new InstructorLessonService();
		const lessons = await service.getInstructorLessons(locals.user.id);

		return {
			lessons
		};
	} catch (err) {
		console.error('Error loading lessons:', err);
		throw error(500, 'Failed to load lessons');
	}
};
