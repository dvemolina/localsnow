import type { PageServerLoad, Actions } from './$types';
import { SchoolInstructorService } from '$src/features/Schools/lib/schoolInstructorService';
import { SchoolRepository } from '$src/features/Schools/lib/schoolRepository';
import { db } from '$lib/server/db';
import { users, instructorResorts, instructorSports, sports, resorts, schoolInstructors, userRoles } from '$lib/server/db/schema';
import { eq, and, inArray, or, isNull } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireSchoolAdmin } from '$lib/utils/schoolAuth';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { school } = await parent();

	const schoolRepository = new SchoolRepository();
	const schoolResorts = await schoolRepository.getSchoolResorts(school.id);

	// Get all instructors at school's resorts who are independent
	const instructors = await db
		.select({
			instructor: users,
			sport: sports,
			resort: resorts
		})
		.from(users)
		.leftJoin(userRoles, eq(users.id, userRoles.userId))
		.leftJoin(instructorResorts, eq(users.id, instructorResorts.instructorId))
		.leftJoin(resorts, eq(instructorResorts.resortId, resorts.id))
		.leftJoin(instructorSports, eq(users.id, instructorSports.instructorId))
		.leftJoin(sports, eq(instructorSports.sportId, sports.id))
		.where(
			and(
				eq(userRoles.role, 'instructor-independent'),
				eq(users.isVerified, true),
				inArray(instructorResorts.resortId, schoolResorts)
			)
		);

	// Group instructors and aggregate their data
	const instructorMap = new Map();
	for (const row of instructors) {
		if (!instructorMap.has(row.instructor.id)) {
			instructorMap.set(row.instructor.id, {
				...row.instructor,
				sports: [],
				resorts: []
			});
		}

		const instructor = instructorMap.get(row.instructor.id);

		if (row.sport && !instructor.sports.some((s: any) => s.id === row.sport.id)) {
			instructor.sports.push(row.sport);
		}

		if (row.resort && !instructor.resorts.some((r: any) => r.id === row.resort.id)) {
			instructor.resorts.push(row.resort);
		}
	}

	// Check for existing relationships
	const instructorService = new SchoolInstructorService();
	const availableInstructors = [];

	for (const instructor of Array.from(instructorMap.values())) {
		// Check if there's already a pending request or active relationship
		const hasPending = await db
			.select()
			.from(schoolInstructors)
			.where(
				and(
					eq(schoolInstructors.schoolId, school.id),
					eq(schoolInstructors.instructorId, instructor.id),
					or(
						eq(schoolInstructors.isActive, true), // Already active
						and(
							eq(schoolInstructors.isAcceptedBySchool, false),
							isNull(schoolInstructors.rejectedAt) // Pending, not rejected
						)
					)
				)
			);

		if (hasPending.length === 0) {
			availableInstructors.push(instructor);
		}
	}

	return {
		availableInstructors
	};
};

export const actions: Actions = {
	invite: async (event) => {
		const { school } = await requireSchoolAdmin(event);
		const formData = await event.request.formData();
		const instructorId = Number(formData.get('instructorId'));
		const instructorEmail = formData.get('instructorEmail') as string;
		const instructorName = formData.get('instructorName') as string;

		if (!instructorId || !instructorEmail || !instructorName) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			const instructorService = new SchoolInstructorService();
			await instructorService.inviteInstructor(
				school.id,
				school.name,
				instructorId,
				instructorEmail,
				instructorName
			);

			return { success: true, message: 'Invitation sent successfully' };
		} catch (error: any) {
			console.error('Error inviting instructor:', error);
			return fail(500, { message: error.message || 'Failed to send invitation' });
		}
	}
};
