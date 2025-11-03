import { db } from '$lib/server/db';
import { instructorWorkingHours, instructorCalendarBlocks } from '$lib/server/db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';

export type TimeSlot = {
	date: string; // YYYY-MM-DD
	startTime: string; // HH:MM
	endTime: string; // HH:MM
	status: 'available' | 'blocked' | 'pending' | 'booked';
	blockSource?: 'google_calendar' | 'booking_pending' | 'booking_confirmed' | 'manual';
	bookingId?: number;
};

export type DayAvailability = {
	date: string;
	dayOfWeek: number;
	isWorkingDay: boolean;
	slots: TimeSlot[];
};

export class SlotGenerationService {
	/**
	 * Generate available time slots for a date range
	 */
	async generateSlotsForDateRange(
		instructorId: number,
		startDate: Date,
		endDate: Date,
		slotDurationMinutes: number = 60
	): Promise<DayAvailability[]> {
		// Get working hours
		const workingHours = await db.query.instructorWorkingHours.findMany({
			where: and(
				eq(instructorWorkingHours.instructorId, instructorId),
				eq(instructorWorkingHours.isActive, true)
			)
		});

		if (workingHours.length === 0) {
			return []; // No working hours configured
		}

		// Get calendar blocks for this date range
		const blocks = await db.query.instructorCalendarBlocks.findMany({
			where: and(
				eq(instructorCalendarBlocks.instructorId, instructorId),
				or(
					// Block starts within range
					and(
						gte(instructorCalendarBlocks.startDatetime, startDate),
						lte(instructorCalendarBlocks.startDatetime, endDate)
					),
					// Block ends within range
					and(
						gte(instructorCalendarBlocks.endDatetime, startDate),
						lte(instructorCalendarBlocks.endDatetime, endDate)
					),
					// Block spans entire range
					and(
						lte(instructorCalendarBlocks.startDatetime, startDate),
						gte(instructorCalendarBlocks.endDatetime, endDate)
					)
				)
			)
		});

		// Generate slots for each day
		const availability: DayAvailability[] = [];
		const currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			const dayOfWeek = currentDate.getDay(); // 0 = Sunday
			const dateStr = currentDate.toISOString().split('T')[0];

			// Find working hours for this day
			const dayWorkingHours = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

			if (!dayWorkingHours) {
				// Not a working day
				availability.push({
					date: dateStr,
					dayOfWeek,
					isWorkingDay: false,
					slots: []
				});
				currentDate.setDate(currentDate.getDate() + 1);
				continue;
			}

			// Check seasonal availability
			if (dayWorkingHours.seasonStart && dayWorkingHours.seasonEnd) {
				const currentYear = currentDate.getFullYear();
				const seasonStart = new Date(`${currentYear}-${dayWorkingHours.seasonStart}`);
				const seasonEnd = new Date(`${currentYear}-${dayWorkingHours.seasonEnd}`);

				if (currentDate < seasonStart || currentDate > seasonEnd) {
					// Outside season
					availability.push({
						date: dateStr,
						dayOfWeek,
						isWorkingDay: false,
						slots: []
					});
					currentDate.setDate(currentDate.getDate() + 1);
					continue;
				}
			}

			// Generate slots for this day
			const daySlots = this.generateSlotsForDay(
				currentDate,
				dayWorkingHours.startTime,
				dayWorkingHours.endTime,
				slotDurationMinutes,
				blocks
			);

			availability.push({
				date: dateStr,
				dayOfWeek,
				isWorkingDay: true,
				slots: daySlots
			});

			currentDate.setDate(currentDate.getDate() + 1);
		}

		return availability;
	}

	/**
	 * Generate slots for a specific day
	 */
	private generateSlotsForDay(
		date: Date,
		startTime: string,
		endTime: string,
		slotDurationMinutes: number,
		blocks: any[]
	): TimeSlot[] {
		const slots: TimeSlot[] = [];
		const dateStr = date.toISOString().split('T')[0];

		// Parse start and end times
		const [startHour, startMinute] = startTime.split(':').map(Number);
		const [endHour, endMinute] = endTime.split(':').map(Number);

		let currentHour = startHour;
		let currentMinute = startMinute;

		while (
			currentHour < endHour ||
			(currentHour === endHour && currentMinute < endMinute)
		) {
			const slotStartTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

			// Calculate end time
			let slotEndMinute = currentMinute + slotDurationMinutes;
			let slotEndHour = currentHour;

			if (slotEndMinute >= 60) {
				slotEndHour += Math.floor(slotEndMinute / 60);
				slotEndMinute = slotEndMinute % 60;
			}

			const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;

			// Check if slot is blocked
			const slotStart = new Date(`${dateStr}T${slotStartTime}`);
			const slotEnd = new Date(`${dateStr}T${slotEndTime}`);

			const blockingEvent = this.findBlockingEvent(slotStart, slotEnd, blocks);

			if (blockingEvent) {
				slots.push({
					date: dateStr,
					startTime: slotStartTime,
					endTime: slotEndTime,
					status: this.getStatusFromSource(blockingEvent.source),
					blockSource: blockingEvent.source,
					bookingId: blockingEvent.bookingRequestId
				});
			} else {
				slots.push({
					date: dateStr,
					startTime: slotStartTime,
					endTime: slotEndTime,
					status: 'available'
				});
			}

			// Move to next slot
			currentMinute += slotDurationMinutes;
			if (currentMinute >= 60) {
				currentHour += Math.floor(currentMinute / 60);
				currentMinute = currentMinute % 60;
			}
		}

		return slots;
	}

	/**
	 * Find if any block overlaps with the slot
	 */
	private findBlockingEvent(slotStart: Date, slotEnd: Date, blocks: any[]) {
		return blocks.find((block) => {
			const blockStart = new Date(block.startDatetime);
			const blockEnd = new Date(block.endDatetime);

			// Check for overlap
			return blockStart < slotEnd && blockEnd > slotStart;
		});
	}

	/**
	 * Map block source to slot status
	 */
	private getStatusFromSource(
		source: string
	): 'blocked' | 'pending' | 'booked' {
		switch (source) {
			case 'google_calendar':
			case 'manual':
				return 'blocked';
			case 'booking_pending':
				return 'pending';
			case 'booking_confirmed':
				return 'booked';
			default:
				return 'blocked';
		}
	}

	/**
	 * Check if specific date/time slots are available
	 */
	async checkSlotsAvailable(
		instructorId: number,
		date: string,
		startTime: string,
		endTime: string
	): Promise<{ available: boolean; reason?: string }> {
		const dateObj = new Date(date);
		const dayOfWeek = dateObj.getDay();

		// Check working hours
		const workingHours = await db.query.instructorWorkingHours.findFirst({
			where: and(
				eq(instructorWorkingHours.instructorId, instructorId),
				eq(instructorWorkingHours.dayOfWeek, dayOfWeek),
				eq(instructorWorkingHours.isActive, true)
			)
		});

		if (!workingHours) {
			return { available: false, reason: 'Not a working day' };
		}

		// Check if within working hours
		if (startTime < workingHours.startTime || endTime > workingHours.endTime) {
			return { available: false, reason: 'Outside working hours' };
		}

		// Check for blocks
		const startDatetime = new Date(`${date}T${startTime}`);
		const endDatetime = new Date(`${date}T${endTime}`);

		const conflictingBlocks = await db.query.instructorCalendarBlocks.findMany({
			where: and(
				eq(instructorCalendarBlocks.instructorId, instructorId),
				or(
					// Block starts during requested time
					and(
						gte(instructorCalendarBlocks.startDatetime, startDatetime),
						lte(instructorCalendarBlocks.startDatetime, endDatetime)
					),
					// Block ends during requested time
					and(
						gte(instructorCalendarBlocks.endDatetime, startDatetime),
						lte(instructorCalendarBlocks.endDatetime, endDatetime)
					),
					// Block spans entire requested time
					and(
						lte(instructorCalendarBlocks.startDatetime, startDatetime),
						gte(instructorCalendarBlocks.endDatetime, endDatetime)
					)
				)
			)
		});

		if (conflictingBlocks.length > 0) {
			const blockSource = conflictingBlocks[0].source;
			return {
				available: false,
				reason:
					blockSource === 'booking_pending'
						? 'Tentatively booked'
						: blockSource === 'booking_confirmed'
							? 'Already booked'
							: 'Time slot blocked'
			};
		}

		return { available: true };
	}
}