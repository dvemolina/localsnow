import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { bookingRequests, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const { token } = params;

	if (!token || token.length < 32) {
		throw error(400, 'Invalid review token');
	}

	try {
		// Find booking by token (allow both submitted and not submitted)
		const [booking] = await db
			.select({
				id: bookingRequests.id,
				instructorId: bookingRequests.instructorId,
				clientName: bookingRequests.clientName,
				clientEmail: bookingRequests.clientEmail,
				startDate: bookingRequests.startDate,
				endDate: bookingRequests.endDate,
				numberOfStudents: bookingRequests.numberOfStudents,
				status: bookingRequests.status,
				reviewSubmittedAt: bookingRequests.reviewSubmittedAt,
				instructorName: users.name,
				instructorProfileImage: users.profileImageUrl
			})
			.from(bookingRequests)
			.innerJoin(users, eq(bookingRequests.instructorId, users.id))
			.where(
				and(
					eq(bookingRequests.reviewToken, token),
					eq(bookingRequests.status, 'completed')
				)
			)
			.limit(1);

		if (!booking) {
			throw error(404, 'Review link not found or booking is not completed');
		}

		return {
			token,
			alreadySubmitted: !!booking.reviewSubmittedAt,
			booking: {
				id: booking.id,
				instructorId: booking.instructorId,
				instructorName: booking.instructorName,
				instructorProfileImage: booking.instructorProfileImage,
				clientName: booking.clientName,
				clientEmail: booking.clientEmail,
				startDate: booking.startDate,
				endDate: booking.endDate,
				numberOfStudents: booking.numberOfStudents,
				reviewSubmittedAt: booking.reviewSubmittedAt
			}
		};
	} catch (err) {
		console.error('Error loading review page:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load review page');
	}
};
