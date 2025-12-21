import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';
import { updateLessonNotesSchema } from '$src/features/InstructorLessons/lib/instructorLessonSchema';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const lessonId = parseInt(params.id);

		if (isNaN(lessonId)) {
			throw error(400, 'Invalid lesson ID');
		}

		// Parse and validate request body
		const body = await request.json();
		const { notes } = updateLessonNotesSchema.parse(body);

		const service = new InstructorLessonService();
		const updatedLesson = await service.updateLessonNotes(lessonId, locals.user.id, notes);

		return json(updatedLesson);
	} catch (err: any) {
		console.error('Error updating lesson notes:', err);

		if (err.name === 'ZodError') {
			throw error(400, { message: 'Validation failed', errors: err.errors });
		}

		if (err.message.includes('not found') || err.message.includes('unauthorized')) {
			throw error(404, err.message);
		}

		throw error(500, 'Failed to update lesson notes');
	}
};
