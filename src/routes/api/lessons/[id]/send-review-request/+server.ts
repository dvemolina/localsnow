import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';

export const POST: RequestHandler = async ({ params, locals }) => {
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
		const result = await service.sendReviewRequest(lessonId, locals.user.id);

		return json(result);
	} catch (err: any) {
		console.error('Error sending review request:', err);

		if (err.message.includes('not found') || err.message.includes('unauthorized')) {
			throw error(404, err.message);
		}

		if (err.message.includes('already sent') || err.message.includes('already exists')) {
			throw error(400, err.message);
		}

		throw error(500, 'Failed to send review request');
	}
};
