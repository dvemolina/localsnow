import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';

export const GET: RequestHandler = async ({ params, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const lessonId = parseInt(params.id);

		if (isNaN(lessonId)) {
			throw error(400, 'Invalid lesson ID');
		}

		const service = new InstructorLessonService();
		const result = await service.generateReviewLink(lessonId, locals.user.id);

		return json(result);
	} catch (err: any) {
		console.error('Error generating review link:', err);

		if (err.message.includes('not found') || err.message.includes('unauthorized')) {
			throw error(404, err.message);
		}

		throw error(500, 'Failed to generate review link');
	}
};
