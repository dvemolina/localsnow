import { db } from '$src/lib/server/db';
import { instructorCalendarBlocks, bookingRequests } from '$src/lib/server/db/schema';
import { eq, and, or, gte, lte, lt } from 'drizzle-orm';

export class TentativeBookingService {
	private readonly EXPIRATION_HOURS = 48;

	/**
	 * Create tentative block for pending booking (with race condition protection)
	 * @param bookingRequestId - The booking request ID
	 * @param timeSlots - Array of time slots in "HH:MM" format (e.g., ["09:00", "10:00", "14:00"])
	 */
	async createTentativeBlock(bookingRequestId: number, timeSlots?: string[]) {
		// Get booking request details
		const booking = await db.query.bookingRequests.findFirst({
			where: eq(bookingRequests.id, bookingRequestId)
		});

		if (!booking) {
			throw new Error('Booking request not found');
		}

		const startDate = new Date(booking.startDate);
		const endDate = booking.endDate ? new Date(booking.endDate) : startDate;

		// Calculate tentative block times
		const blocksToCreate = [];
		const currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			if (timeSlots && timeSlots.length > 0) {
				// Create individual blocks for each time slot
				for (const timeSlot of timeSlots) {
					const [hours, minutes] = timeSlot.split(':').map(Number);
					
					const slotStart = new Date(currentDate);
					slotStart.setHours(hours, minutes, 0, 0);
					
					const slotEnd = new Date(slotStart);
					slotEnd.setHours(slotStart.getHours() + 1, minutes, 0, 0); // Each slot is 1 hour
					
					blocksToCreate.push({
						startDatetime: slotStart,
						endDatetime: slotEnd
					});
				}
			} else {
				// Fallback: Create continuous block (legacy behavior)
				const dayStart = new Date(currentDate);
				dayStart.setHours(9, 0, 0, 0); // Default 9am start

				const dayEnd = new Date(currentDate);
				const hours = Number(booking.hoursPerDay);
				dayEnd.setHours(9 + hours, 0, 0, 0); // Add hours to start time

				blocksToCreate.push({
					startDatetime: dayStart,
					endDatetime: dayEnd
				});
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Use transaction with row-level locking to prevent race conditions
		return await db.transaction(async (tx) => {
			// Check for conflicting blocks WITH row lock
			for (const block of blocksToCreate) {
				const conflicts = await tx
					.select()
					.from(instructorCalendarBlocks)
					.where(
						and(
							eq(instructorCalendarBlocks.instructorId, booking.instructorId),
							or(
								// Existing block starts during new block
								and(
									gte(instructorCalendarBlocks.startDatetime, block.startDatetime),
									lt(instructorCalendarBlocks.startDatetime, block.endDatetime)
								),
								// Existing block ends during new block
								and(
									gte(instructorCalendarBlocks.endDatetime, block.startDatetime),
									lte(instructorCalendarBlocks.endDatetime, block.endDatetime)
								),
								// Existing block spans entire new block
								and(
									lte(instructorCalendarBlocks.startDatetime, block.startDatetime),
									gte(instructorCalendarBlocks.endDatetime, block.endDatetime)
								)
							)
						)
					)
					.for('update'); // Row-level lock

				if (conflicts.length > 0) {
					throw new Error('Slots no longer available - another booking was just made');
				}
			}

			// All checks passed - create tentative blocks
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + this.EXPIRATION_HOURS);

			const insertedBlocks = [];
			for (const block of blocksToCreate) {
				const inserted = await tx
					.insert(instructorCalendarBlocks)
					.values({
						instructorId: booking.instructorId,
						startDatetime: block.startDatetime,
						endDatetime: block.endDatetime,
						allDay: false,
						source: 'booking_pending',
						bookingRequestId: bookingRequestId,
						title: 'Pending Booking Request',
						expiresAt: expiresAt
					})
					.returning();

				insertedBlocks.push(inserted[0]);
			}

			return {
				success: true,
				blocks: insertedBlocks,
				expiresAt
			};
		});
	}

	/**
	 * Confirm booking - convert tentative blocks to confirmed
	 */
	async confirmBooking(bookingRequestId: number) {
		return await db
			.update(instructorCalendarBlocks)
			.set({
				source: 'booking_confirmed',
				title: 'Confirmed Booking',
				expiresAt: null,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(instructorCalendarBlocks.bookingRequestId, bookingRequestId),
					eq(instructorCalendarBlocks.source, 'booking_pending')
				)
			)
			.returning();
	}

	/**
	 * Release tentative blocks (on expiration or rejection)
	 */
	async releaseTentativeBlocks(bookingRequestId: number) {
		return await db
			.delete(instructorCalendarBlocks)
			.where(
				and(
					eq(instructorCalendarBlocks.bookingRequestId, bookingRequestId),
					eq(instructorCalendarBlocks.source, 'booking_pending')
				)
			)
			.returning();
	}

	/**
	 * Cleanup expired tentative blocks (cron job)
	 */
	async cleanupExpiredBlocks() {
		const now = new Date();

		const expired = await db
			.delete(instructorCalendarBlocks)
			.where(
				and(
					eq(instructorCalendarBlocks.source, 'booking_pending'),
					lt(instructorCalendarBlocks.expiresAt, now)
				)
			)
			.returning();

		// Also mark booking requests as expired
		if (expired.length > 0) {
			const expiredBookingIds = expired
				.map((block) => block.bookingRequestId)
				.filter((id): id is number => id !== null);

			if (expiredBookingIds.length > 0) {
				await db
					.update(bookingRequests)
					.set({
						status: 'expired',
						updatedAt: new Date()
					})
					.where(
						and(
							eq(bookingRequests.status, 'pending'),
							// Use inArray equivalent with or
							or(
								...expiredBookingIds.map((id) =>
									eq(bookingRequests.id, id)
								)
							)
						)
					);
			}
		}

		return {
			blocksDeleted: expired.length,
			message: `Cleaned up ${expired.length} expired tentative blocks`
		};
	}

	/**
	 * Delete tentative blocks for a specific booking
	 */
	async deleteTentativeBlocksForBooking(bookingRequestId: number) {
		try {
			await db.delete(instructorCalendarBlocks)
				.where(
					and(
						eq(instructorCalendarBlocks.bookingRequestId, bookingRequestId),
						eq(instructorCalendarBlocks.source, 'booking_pending')
					)
				);
			
			console.log(`Deleted tentative blocks for booking ${bookingRequestId}`);
			return { success: true };
		} catch (error) {
			console.error('Error deleting tentative blocks:', error);
			throw new Error('Failed to delete tentative blocks');
		}
	}

	/**
	 * Check if instructor can accept booking (no conflicts with confirmed bookings)
	 */
	async canAcceptBooking(bookingRequestId: number): Promise<{
		canAccept: boolean;
		reason?: string;
	}> {
		const booking = await db.query.bookingRequests.findFirst({
			where: eq(bookingRequests.id, bookingRequestId)
		});

		if (!booking) {
			return { canAccept: false, reason: 'Booking not found' };
		}

		// Check for confirmed bookings that conflict
		const startDate = new Date(booking.startDate);
		const endDate = booking.endDate ? new Date(booking.endDate) : startDate;

		const conflicts = await db.query.instructorCalendarBlocks.findMany({
			where: and(
				eq(instructorCalendarBlocks.instructorId, booking.instructorId),
				eq(instructorCalendarBlocks.source, 'booking_confirmed'),
				or(
					and(
						gte(instructorCalendarBlocks.startDatetime, startDate),
						lte(instructorCalendarBlocks.startDatetime, endDate)
					),
					and(
						gte(instructorCalendarBlocks.endDatetime, startDate),
						lte(instructorCalendarBlocks.endDatetime, endDate)
					),
					and(
						lte(instructorCalendarBlocks.startDatetime, startDate),
						gte(instructorCalendarBlocks.endDatetime, endDate)
					)
				)
			)
		});

		if (conflicts.length > 0) {
			return {
				canAccept: false,
				reason: 'You already have a confirmed booking for these dates'
			};
		}

		return { canAccept: true };
	}
}