import { db } from '$lib/server/db';
import { instructorWorkingHours, type InsertInstructorWorkingHours } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export class WorkingHoursService {
	/**
	 * Get all working hours for an instructor
	 */
	async getInstructorWorkingHours(instructorId: number) {
		return await db.query.instructorWorkingHours.findMany({
			where: and(
				eq(instructorWorkingHours.instructorId, instructorId),
				eq(instructorWorkingHours.isActive, true)
			),
			orderBy: (hours, { asc }) => [asc(hours.dayOfWeek)]
		});
	}

	/**
	 * Create or update working hours for a specific day
	 */
	async upsertWorkingHours(data: InsertInstructorWorkingHours) {
		// Check if entry exists for this day
		const existing = await db.query.instructorWorkingHours.findFirst({
			where: and(
				eq(instructorWorkingHours.instructorId, data.instructorId),
				eq(instructorWorkingHours.dayOfWeek, data.dayOfWeek),
				eq(instructorWorkingHours.isActive, true)
			)
		});

		if (existing) {
			// Update existing
			return await db
				.update(instructorWorkingHours)
				.set({
					startTime: data.startTime,
					endTime: data.endTime,
					seasonStart: data.seasonStart,
					seasonEnd: data.seasonEnd,
					updatedAt: new Date()
				})
				.where(eq(instructorWorkingHours.id, existing.id))
				.returning();
		} else {
			// Insert new
			return await db.insert(instructorWorkingHours).values(data).returning();
		}
	}

	/**
	 * Bulk upsert working hours for all days of the week
	 */
	async bulkUpsertWorkingHours(
		instructorId: number,
		hoursData: Array<{
			dayOfWeek: number;
			startTime: string;
			endTime: string;
			seasonStart?: string;
			seasonEnd?: string;
		}>
	) {
		const results = [];

		for (const hours of hoursData) {
			const result = await this.upsertWorkingHours({
				instructorId,
				...hours,
				isActive: true
			});
			results.push(result[0]);
		}

		return results;
	}

	/**
	 * Delete working hours for a specific day
	 */
	async deleteWorkingHours(instructorId: number, dayOfWeek: number) {
		return await db
			.update(instructorWorkingHours)
			.set({
				isActive: false,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(instructorWorkingHours.instructorId, instructorId),
					eq(instructorWorkingHours.dayOfWeek, dayOfWeek)
				)
			)
			.returning();
	}

	/**
	 * Check if instructor has working hours configured
	 */
	async hasWorkingHours(instructorId: number): Promise<boolean> {
		const hours = await this.getInstructorWorkingHours(instructorId);
		return hours.length > 0;
	}
}