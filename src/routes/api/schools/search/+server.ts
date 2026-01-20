import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SchoolService } from '$src/features/Schools/lib/schoolService';

const schoolService = new SchoolService();

/**
 * Search schools by name or location
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchTerm = url.searchParams.get('q');
		const resortIdParam = url.searchParams.get('resortId');

		if (!searchTerm || searchTerm.trim().length < 2) {
			return json(
				{ error: 'Search term must be at least 2 characters' },
				{ status: 400 }
			);
		}

		const resortId = resortIdParam ? parseInt(resortIdParam) : undefined;

		const schools = await schoolService.searchSchools(searchTerm, resortId);

		return json({
			success: true,
			schools: schools.map(school => ({
				id: school.id,
				name: school.name,
				slug: school.slug,
				bio: school.bio,
				logo: school.logo,
				isVerified: school.isVerified,
				createdBy: school.createdBy,
				resortName: school.resortName,
				schoolEmail: school.schoolEmail,
				schoolPhone: school.schoolPhone
			})),
			count: schools.length
		});
	} catch (error) {
		console.error('Error searching schools:', error);
		return json({ error: 'Failed to search schools' }, { status: 500 });
	}
};
