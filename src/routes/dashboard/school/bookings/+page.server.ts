import type { PageServerLoad } from './$types';
import { SchoolInstructorService } from '$src/features/Schools/lib/schoolInstructorService';
import { db } from '$lib/server/db';
import { bookingRequests, users } from '$lib/server/db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { school } = await parent();

	const instructorService = new SchoolInstructorService();

	// Get all active instructors for the school
	const activeInstructors = await instructorService.getActiveInstructors(school.id);
	const instructorIds = activeInstructors.map(i => i.id);

	// Get all bookings for school instructors
	let bookings = [];
	if (instructorIds.length > 0) {
		bookings = await db
			.select({
				booking: bookingRequests,
				instructor: users
			})
			.from(bookingRequests)
			.innerJoin(users, eq(bookingRequests.instructorId, users.id))
			.where(
				and(
					eq(bookingRequests.schoolId, school.id),
					inArray(bookingRequests.instructorId, instructorIds)
				)
			)
			.orderBy(desc(bookingRequests.createdAt));
	}

	return {
		bookings,
		instructorCount: instructorIds.length
	};
};
