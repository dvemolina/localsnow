// src/routes/admin/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, bookingRequests, resorts } from '$lib/server/db/schema';
import { eq, and, or, gte, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	try {
		// Get stats
		const [instructorCount, bookingCount, pendingInstructorCount, resortCount] =
			await Promise.all([
				// Total instructors
				db
					.select({ count: sql<number>`cast(count(*) as integer)` })
					.from(users)
					.where(
						or(eq(users.role, 'instructor-independent'), eq(users.role, 'instructor-school'))
					),

				// Total bookings
				db.select({ count: sql<number>`cast(count(*) as integer)` }).from(bookingRequests),

				// Pending instructor verifications
				db
					.select({ count: sql<number>`cast(count(*) as integer)` })
					.from(users)
					.where(
						and(
							or(eq(users.role, 'instructor-independent'), eq(users.role, 'instructor-school')),
							eq(users.isVerified, false)
						)
					),

				// Total resorts
				db.select({ count: sql<number>`cast(count(*) as integer)` }).from(resorts)
			]);

		// Get instructors from this month
		const firstDayOfMonth = new Date();
		firstDayOfMonth.setDate(1);
		firstDayOfMonth.setHours(0, 0, 0, 0);

		const [newInstructorsCount, newBookingsCount] = await Promise.all([
			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(users)
				.where(
					and(
						or(eq(users.role, 'instructor-independent'), eq(users.role, 'instructor-school')),
						gte(users.createdAt, firstDayOfMonth)
					)
				),

			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(bookingRequests)
				.where(gte(bookingRequests.createdAt, firstDayOfMonth))
		]);

		// Get recent bookings
		const recentBookings = await db
			.select({
				id: bookingRequests.id,
				clientName: bookingRequests.clientName,
				instructorId: bookingRequests.instructorId,
				startDate: bookingRequests.startDate,
				status: bookingRequests.status
			})
			.from(bookingRequests)
			.orderBy(sql`${bookingRequests.createdAt} DESC`)
			.limit(10);

		// Get instructor names for recent bookings
		const recentBookingsWithInstructors = await Promise.all(
			recentBookings.map(async (booking) => {
				const instructor = await db
					.select({ name: users.name, lastName: users.lastName })
					.from(users)
					.where(eq(users.id, booking.instructorId))
					.limit(1);

				return {
					...booking,
					instructorName: instructor[0]
						? `${instructor[0].name} ${instructor[0].lastName}`
						: 'Unknown'
				};
			})
		);

		return {
			stats: {
				totalInstructors: instructorCount[0].count,
				totalBookings: bookingCount[0].count,
				pendingVerifications: pendingInstructorCount[0].count,
				totalResorts: resortCount[0].count,
				newInstructorsThisMonth: newInstructorsCount[0].count,
				newBookingsThisMonth: newBookingsCount[0].count
			},
			recentBookings: recentBookingsWithInstructors
		};
	} catch (error) {
		console.error('Error loading admin dashboard:', error);
		return {
			stats: {
				totalInstructors: 0,
				totalBookings: 0,
				pendingVerifications: 0,
				totalResorts: 0,
				newInstructorsThisMonth: 0,
				newBookingsThisMonth: 0
			},
			recentBookings: []
		};
	}
};
