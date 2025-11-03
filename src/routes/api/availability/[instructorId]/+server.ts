import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SlotGenerationService } from '$src/features/Availability/lib/slotGenerationService';

const slotService = new SlotGenerationService();

export const GET: RequestHandler = async ({ params, url }) => {
	const instructorId = parseInt(params.instructorId);

	if (isNaN(instructorId)) {
		return json({ error: 'Invalid instructor ID' }, { status: 400 });
	}

	// Get query parameters
	const startDateStr = url.searchParams.get('startDate');
	const endDateStr = url.searchParams.get('endDate');
	const slotDuration = parseInt(url.searchParams.get('slotDuration') || '60');

	if (!startDateStr || !endDateStr) {
		return json(
			{ error: 'startDate and endDate are required' },
			{ status: 400 }
		);
	}

	try {
		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return json({ error: 'Invalid date format' }, { status: 400 });
		}

		const availability = await slotService.generateSlotsForDateRange(
			instructorId,
			startDate,
			endDate,
			slotDuration
		);

		return json({
			instructorId,
			startDate: startDateStr,
			endDate: endDateStr,
			slotDurationMinutes: slotDuration,
			availability
		});
	} catch (error) {
		console.error('Error generating availability slots:', error);
		return json(
			{ error: 'Failed to generate availability slots' },
			{ status: 500 }
		);
	}
};