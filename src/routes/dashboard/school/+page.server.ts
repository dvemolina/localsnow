import type { PageServerLoad } from './$types';
import { SchoolInstructorService } from '$src/features/Schools/lib/schoolInstructorService';
import { db } from '$lib/server/db';
import { bookingRequests } from '$lib/server/db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { schoolInstructors } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ parent }) => {
	const { school } = await parent();

	const instructorService = new SchoolInstructorService();

	// Get school stats
	const stats = await instructorService.getSchoolStats(school.id);

	// Get recent bookings for school instructors
	const activeInstructors = await instructorService.getActiveInstructors(school.id);
	const instructorIds = activeInstructors.map(i => i.id);

	let recentBookings = [];
	if (instructorIds.length > 0) {
		recentBookings = await db
			.select()
			.from(bookingRequests)
			.where(
				and(
					eq(bookingRequests.schoolId, school.id),
					inArray(bookingRequests.instructorId, instructorIds)
				)
			)
			.orderBy(desc(bookingRequests.createdAt))
			.limit(5);
	}

	// Get pending instructor requests
	const pendingInstructors = await instructorService.getPendingInstructors(school.id);

	return {
		stats,
		recentBookings,
		pendingInstructors: pendingInstructors.slice(0, 3) // Show only first 3
	};
};
