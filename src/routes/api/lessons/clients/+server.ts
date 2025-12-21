import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';

export const GET: RequestHandler = async ({ locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const service = new InstructorLessonService();
		const clients = await service.getClientList(locals.user.id);

		return json({ clients });
	} catch (err: any) {
		console.error('Error fetching client list:', err);
		throw error(500, 'Failed to fetch client list');
	}
};
