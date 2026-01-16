import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SchoolService } from '$src/features/Schools/lib/schoolService';

const schoolService = new SchoolService();

export const GET: RequestHandler = async () => {
	try {
		// Get all published schools
		const schools = await schoolService.getAllSchools();

		// Return only id and name for the select dropdown
		const schoolList = schools.map((school) => ({
			id: school.id,
			name: school.name
		}));

		return json(schoolList);
	} catch (error) {
		console.error('Error fetching schools list:', error);
		return json({ error: 'Failed to fetch schools' }, { status: 500 });
	}
};
