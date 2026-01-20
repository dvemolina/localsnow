import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SchoolService } from '$src/features/Schools/lib/schoolService';
import { SchoolInstructorRepository } from '$src/features/Schools/lib/schoolInstructorRepository';

const schoolService = new SchoolService();
const schoolInstructorRepo = new SchoolInstructorRepository();

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only instructors can create school listings
	if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
		return json(
			{ error: 'Only instructors can create school listings' },
			{ status: 403 }
		);
	}

	try {
		const body = await request.json();
		const { name, resortId, countryCode, bio, schoolEmail, schoolPhone } = body;

		// Validation
		if (!name || !resortId || !countryCode) {
			return json(
				{ error: 'Missing required fields: name, resortId, countryCode' },
				{ status: 400 }
			);
		}

		// Check if school name already exists (case-insensitive)
		const existingSchools = await schoolService.searchSchools(name, resortId);
		if (existingSchools.length > 0) {
			const exactMatch = existingSchools.find(
				s => s.name.toLowerCase() === name.toLowerCase()
			);
			if (exactMatch) {
				return json(
					{
						error: 'A school with this name already exists',
						existingSchool: {
							id: exactMatch.id,
							name: exactMatch.name,
							slug: exactMatch.slug,
							isVerified: exactMatch.isVerified
						}
					},
					{ status: 409 }
				);
			}
		}

		// Create the school listing
		const school = await schoolService.createInstructorListedSchool(
			user.id,
			name,
			resortId,
			countryCode,
			bio,
			schoolEmail,
			schoolPhone
		);

		// Auto-associate the instructor with the school
		await schoolInstructorRepo.applyToSchool(user.id, school.id);
		// Auto-accept since they created it
		await schoolInstructorRepo.acceptInstructor(school.id, user.id);

		return json(
			{
				success: true,
				school: {
					id: school.id,
					name: school.name,
					slug: school.slug,
					isVerified: school.isVerified
				},
				message: 'School listing created successfully'
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error('Error creating school listing:', error);
		return json(
			{ error: error.message || 'Failed to create school listing' },
			{ status: 500 }
		);
	}
};
