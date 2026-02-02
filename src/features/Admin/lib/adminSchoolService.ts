// src/features/Admin/lib/adminSchoolService.ts
import { db } from '$lib/server/db';
import { schools, schoolResorts, schoolSports, schoolAdmins, schoolInstructors, users } from '$lib/server/db/schema';
import { eq, and, or, like, count } from 'drizzle-orm';
import { adminAuditService } from './adminAuditService';

interface SchoolFilters {
	search?: string;
	isVerified?: boolean;
	isSuspended?: boolean;
	isPublished?: boolean;
}

export const adminSchoolService = {
	/**
	 * Get all schools with filters and pagination
	 */
	async getAllSchools(filters: SchoolFilters = {}, page: number = 1, pageSize: number = 20) {
		const offset = (page - 1) * pageSize;

		// Build where conditions
		const conditions: any[] = [];

		if (filters.search) {
			conditions.push(
				or(
					like(schools.name, `%${filters.search}%`),
					like(schools.schoolEmail, `%${filters.search}%`)
				)
			);
		}

		if (filters.isVerified !== undefined) {
			conditions.push(eq(schools.isVerified, filters.isVerified));
		}

		if (filters.isSuspended !== undefined) {
			conditions.push(eq(schools.isSuspended, filters.isSuspended));
		}

		if (filters.isPublished !== undefined) {
			conditions.push(eq(schools.isPublished, filters.isPublished));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const schoolList = await db.query.schools.findMany({
			where: whereClause,
			limit: pageSize,
			offset,
			orderBy: (schools, { desc }) => [desc(schools.id)],
			with: {
				resorts: {
					with: {
						resort: true
					}
				},
				owner: {
					columns: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		});

		// Get total count for pagination
		const totalResult = await db
			.select({ count: count() })
			.from(schools)
			.where(whereClause);

		const total = totalResult[0]?.count || 0;

		// Get instructor count for each school
		const schoolsWithStats = await Promise.all(
			schoolList.map(async (school) => {
				const instructorCount = await db
					.select({ count: count() })
					.from(schoolInstructors)
					.where(and(
						eq(schoolInstructors.schoolId, school.id),
						eq(schoolInstructors.isActive, true)
					));

				return {
					...school,
					stats: {
						instructorCount: instructorCount[0]?.count || 0
					}
				};
			})
		);

		return {
			schools: schoolsWithStats,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize)
			}
		};
	},

	/**
	 * Get single school details
	 */
	async getSchoolById(schoolId: number) {
		const school = await db.query.schools.findFirst({
			where: eq(schools.id, schoolId),
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
				owner: {
					columns: {
						id: true,
						name: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		if (!school) {
			return null;
		}

		// Get school admins
		const admins = await db.query.schoolAdmins.findMany({
			where: eq(schoolAdmins.schoolId, schoolId),
			with: {
				user: {
					columns: {
						id: true,
						name: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		// Get school instructors
		const instructors = await db.query.schoolInstructors.findMany({
			where: eq(schoolInstructors.schoolId, schoolId),
			with: {
				instructor: {
					columns: {
						id: true,
						name: true,
						lastName: true,
						email: true,
						isVerified: true
					}
				}
			}
		});

		// Get audit logs for this school
		const auditLogs = await adminAuditService.getLogsByTarget('school', schoolId, 20);

		return {
			school,
			admins,
			instructors,
			auditLogs
		};
	},

	/**
	 * Verify a school
	 */
	async verifySchool(schoolId: number, adminId: number, event?: any) {
		await db
			.update(schools)
			.set({
				isVerified: true
			})
			.where(eq(schools.id, schoolId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'verify_school',
			targetType: 'school',
			targetId: schoolId,
			details: { action: 'verified' },
			event
		});

		return { success: true };
	},

	/**
	 * Reject school verification
	 */
	async rejectSchool(schoolId: number, adminId: number, reason: string, event?: any) {
		await db
			.update(schools)
			.set({
				isVerified: false
			})
			.where(eq(schools.id, schoolId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'reject_school_verification',
			targetType: 'school',
			targetId: schoolId,
			details: { reason },
			event
		});

		return { success: true };
	},

	/**
	 * Suspend a school
	 */
	async suspendSchool(schoolId: number, adminId: number, reason: string, event?: any) {
		await db
			.update(schools)
			.set({
				isSuspended: true,
				suspensionReason: reason,
				suspendedAt: new Date()
			})
			.where(eq(schools.id, schoolId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'suspend_school',
			targetType: 'school',
			targetId: schoolId,
			details: { reason },
			event
		});

		return { success: true };
	},

	/**
	 * Unsuspend a school
	 */
	async unsuspendSchool(schoolId: number, adminId: number, event?: any) {
		await db
			.update(schools)
			.set({
				isSuspended: false,
				suspensionReason: null,
				suspendedAt: null
			})
			.where(eq(schools.id, schoolId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'unsuspend_school',
			targetType: 'school',
			targetId: schoolId,
			event
		});

		return { success: true };
	},

	/**
	 * Publish a school
	 */
	async publishSchool(schoolId: number, adminId: number, event?: any) {
		await db
			.update(schools)
			.set({
				isPublished: true
			})
			.where(eq(schools.id, schoolId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'publish_school',
			targetType: 'school',
			targetId: schoolId,
			event
		});

		return { success: true };
	},

	/**
	 * Unpublish a school
	 */
	async unpublishSchool(schoolId: number, adminId: number, event?: any) {
		await db
			.update(schools)
			.set({
				isPublished: false
			})
			.where(eq(schools.id, schoolId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'unpublish_school',
			targetType: 'school',
			targetId: schoolId,
			event
		});

		return { success: true };
	}
};
