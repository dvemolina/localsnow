import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';

export const DELETE: RequestHandler = async ({ params, locals }) => {
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
		await service.deleteLesson(lessonId, locals.user.id);

		return new Response(null, { status: 204 });
	} catch (err: any) {
		console.error('Error deleting lesson:', err);

		if (err.message.includes('not found') || err.message.includes('unauthorized')) {
			throw error(404, err.message);
		}

		throw error(500, 'Failed to delete lesson');
	}
};
