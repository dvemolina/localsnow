// src/features/Admin/lib/adminInstructorService.ts
import { db } from '$lib/server/db';
import { users, instructorResorts, instructorSports, bookingRequests, instructorReviews } from '$lib/server/db/schema';
import { eq, and, or, like, sql, count, avg } from 'drizzle-orm';
import { adminAuditService } from './adminAuditService';

interface InstructorFilters {
	search?: string;
	resortId?: number;
	sportId?: number;
	isVerified?: boolean;
	isSuspended?: boolean;
}

export const adminInstructorService = {
	/**
	 * Get all instructors with filters and pagination
	 */
	async getAllInstructors(filters: InstructorFilters = {}, page: number = 1, pageSize: number = 50) {
		const offset = (page - 1) * pageSize;

		// Build where conditions
		const conditions: any[] = [
			or(
				eq(users.role, 'instructor-independent'),
				eq(users.role, 'instructor-school')
			)
		];

		if (filters.search) {
			conditions.push(
				or(
					like(users.name, `%${filters.search}%`),
					like(users.lastName, `%${filters.search}%`),
					like(users.email, `%${filters.search}%`)
				)
			);
		}

		if (filters.isVerified !== undefined) {
			conditions.push(eq(users.isVerified, filters.isVerified));
		}

		if (filters.isSuspended !== undefined) {
			conditions.push(eq(users.isSuspended, filters.isSuspended));
		}

		const instructors = await db.query.users.findMany({
			where: and(...conditions),
			limit: pageSize,
			offset,
			orderBy: (users, { desc }) => [desc(users.createdAt)],
			with: {
				resorts: {
					with: {
						resort: true
					}
				},
				sports: {
					with: {
						sport: true
					}
				}
			}
		});

		// Get total count for pagination
		const totalResult = await db
			.select({ count: count() })
			.from(users)
			.where(and(...conditions));

		const total = totalResult[0]?.count || 0;

		// Get booking and review stats for each instructor
		const instructorsWithStats = await Promise.all(
			instructors.map(async (instructor) => {
				const [bookingStats, reviewStats] = await Promise.all([
					db
						.select({ count: count() })
						.from(bookingRequests)
						.where(eq(bookingRequests.instructorId, instructor.id)),
					db
						.select({
							count: count(),
							avgRating: avg(instructorReviews.rating)
						})
						.from(instructorReviews)
						.where(eq(instructorReviews.instructorId, instructor.id))
				]);

				return {
					...instructor,
					stats: {
						totalBookings: bookingStats[0]?.count || 0,
						totalReviews: reviewStats[0]?.count || 0,
						avgRating: reviewStats[0]?.avgRating || 0
					}
				};
			})
		);

		return {
			instructors: instructorsWithStats,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize)
			}
		};
	},

	/**
	 * Get single instructor details
	 */
	async getInstructorById(instructorId: number) {
		const instructor = await db.query.users.findFirst({
			where: eq(users.id, instructorId),
			with: {
				resorts: {
					with: {
						resort: {
							with: {
								region: true,
								country: true
							}
						}
					}
				},
				sports: {
					with: {
						sport: true
					}
				},
				lessons: true
			}
		});

		if (!instructor) {
			return null;
		}

		// Get bookings
		const bookings = await db.query.bookingRequests.findMany({
			where: eq(bookingRequests.instructorId, instructorId),
			orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
			limit: 20
		});

		// Get reviews
		const reviews = await db.query.instructorReviews.findMany({
			where: eq(instructorReviews.instructorId, instructorId),
			orderBy: (reviews, { desc }) => [desc(reviews.createdAt)]
		});

		// Get audit logs for this instructor
		const auditLogs = await adminAuditService.getLogsByTarget('instructor', instructorId, 20);

		return {
			instructor,
			bookings,
			reviews,
			auditLogs
		};
	},

	/**
	 * Verify an instructor
	 */
	async verifyInstructor(instructorId: number, adminId: number, event?: any) {
		await db
			.update(users)
			.set({
				isVerified: true,
				updatedAt: new Date()
			})
			.where(eq(users.id, instructorId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'verify_instructor',
			targetType: 'instructor',
			targetId: instructorId,
			details: { action: 'verified' },
			event
		});

		return { success: true };
	},

	/**
	 * Reject instructor verification
	 */
	async rejectInstructor(instructorId: number, adminId: number, reason: string, event?: any) {
		await db
			.update(users)
			.set({
				isVerified: false,
				qualificationUrl: null, // Clear the qualification URL so they can re-upload
				updatedAt: new Date()
			})
			.where(eq(users.id, instructorId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'reject_instructor_verification',
			targetType: 'instructor',
			targetId: instructorId,
			details: { reason },
			event
		});

		return { success: true };
	},

	/**
	 * Suspend an instructor
	 */
	async suspendInstructor(instructorId: number, adminId: number, reason: string, event?: any) {
		await db
			.update(users)
			.set({
				isSuspended: true,
				suspensionReason: reason,
				suspendedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(users.id, instructorId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'suspend_instructor',
			targetType: 'instructor',
			targetId: instructorId,
			details: { reason },
			event
		});

		return { success: true };
	},

	/**
	 * Unsuspend an instructor
	 */
	async unsuspendInstructor(instructorId: number, adminId: number, event?: any) {
		await db
			.update(users)
			.set({
				isSuspended: false,
				suspensionReason: null,
				suspendedAt: null,
				updatedAt: new Date()
			})
			.where(eq(users.id, instructorId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'unsuspend_instructor',
			targetType: 'instructor',
			targetId: instructorId,
			event
		});

		return { success: true };
	},

	/**
	 * Delete an instructor (soft delete)
	 */
	async deleteInstructor(instructorId: number, adminId: number, event?: any) {
		await db
			.update(users)
			.set({
				deletedAt: new Date()
			})
			.where(eq(users.id, instructorId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'delete_instructor',
			targetType: 'instructor',
			targetId: instructorId,
			event
		});

		return { success: true };
	}
};
