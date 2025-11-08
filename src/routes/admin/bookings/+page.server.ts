// src/routes/admin/bookings/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, bookingRequests } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const statusFilter = url.searchParams.get('status');

		// Build query
		let query = db
			.select({
				id: bookingRequests.id,
				clientName: bookingRequests.clientName,
				clientEmail: bookingRequests.clientEmail,
				clientPhone: bookingRequests.clientPhone,
				instructorId: bookingRequests.instructorId,
				startDate: bookingRequests.startDate,
				endDate: bookingRequests.endDate,
				numberOfStudents: bookingRequests.numberOfStudents,
				hoursPerDay: bookingRequests.hoursPerDay,
				estimatedPrice: bookingRequests.estimatedPrice,
				currency: bookingRequests.currency,
				status: bookingRequests.status,
				createdAt: bookingRequests.createdAt
			})
			.from(bookingRequests)
			.$dynamic();

		// Apply status filter if provided
		if (statusFilter) {
			query = query.where(eq(bookingRequests.status, statusFilter as any));
		}

		const bookings = await query.orderBy(sql`${bookingRequests.createdAt} DESC`);

		// Get instructor names
		const bookingsWithInstructors = await Promise.all(
			bookings.map(async (booking) => {
				const instructor = await db
					.select({ name: users.name, lastName: users.lastName, email: users.email })
					.from(users)
					.where(eq(users.id, booking.instructorId))
					.limit(1);

				return {
					...booking,
					instructorName: instructor[0]
						? `${instructor[0].name} ${instructor[0].lastName}`
						: 'Unknown',
					instructorEmail: instructor[0]?.email || ''
				};
			})
		);

		return {
			bookings: bookingsWithInstructors,
			currentFilter: statusFilter
		};
	} catch (error) {
		console.error('Error loading bookings:', error);
		return {
			bookings: [],
			currentFilter: null
		};
	}
};
