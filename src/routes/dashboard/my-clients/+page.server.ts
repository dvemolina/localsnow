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
		const clients = await service.getClientList(locals.user.id);

		// Calculate totals for stats
		const stats = {
			totalClients: clients.length,
			totalLessons: clients.reduce((sum, client) => sum + client.lessonCount, 0),
			totalHours: clients.reduce((sum, client) => sum + parseFloat(client.totalHours.toString()), 0),
			clientsWithReviews: clients.filter(client => client.hasReview).length
		};

		return {
			clients,
			stats
		};
	} catch (err) {
		console.error('Error loading clients:', err);
		throw error(500, 'Failed to load clients');
	}
};
