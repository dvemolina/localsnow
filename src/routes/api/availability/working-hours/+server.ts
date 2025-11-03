import { json, type RequestHandler } from '@sveltejs/kit';
import { WorkingHoursService } from '$src/features/Availability/lib/workingHoursService';

const workingHoursService = new WorkingHoursService();

// Get working hours
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const hours = await workingHoursService.getInstructorWorkingHours(user.id);
		return json({ workingHours: hours });
	} catch (error) {
		console.error('Error fetching working hours:', error);
		return json({ error: 'Failed to fetch working hours' }, { status: 500 });
	}
};

// Create/Update working hours
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();

		// Expecting array of working hours for each day
		if (!Array.isArray(data.workingHours)) {
			return json({ error: 'Invalid data format' }, { status: 400 });
		}

		const results = await workingHoursService.bulkUpsertWorkingHours(
			user.id,
			data.workingHours
		);

		return json({ success: true, workingHours: results });
	} catch (error) {
		console.error('Error saving working hours:', error);
		return json({ error: 'Failed to save working hours' }, { status: 500 });
	}
};

// Delete working hours for a specific day
export const DELETE: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { dayOfWeek } = await request.json();

		if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
			return json({ error: 'Invalid day of week' }, { status: 400 });
		}

		await workingHoursService.deleteWorkingHours(user.id, dayOfWeek);

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting working hours:', error);
		return json({ error: 'Failed to delete working hours' }, { status: 500 });
	}
};