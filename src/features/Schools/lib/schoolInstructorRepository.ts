import { db } from "$lib/server/db/index";
import {
	schoolInstructors,
	schoolInstructorHistory,
	schools,
	users,
	instructorResorts,
	instructorSports,
	sports,
	resorts,
	type SchoolInstructor,
	type InsertSchoolInstructor,
	type InsertSchoolInstructorHistory,
	type User,
	type School
} from "$src/lib/server/db/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";

export interface InstructorWithDetails extends User {
	sports?: Array<{ sportId: number; sport: string }>;
	resorts?: Array<{ resortId: number; resort: string }>;
}

export interface SchoolInstructorWithDetails extends SchoolInstructor {
	instructor?: InstructorWithDetails;
}

export class SchoolInstructorRepository {
	/**
	 * School invites an instructor
	 */
	async inviteInstructor(schoolId: number, instructorId: number): Promise<SchoolInstructor> {
		const result = await db
			.insert(schoolInstructors)
			.values({
				schoolId,
				instructorId,
				requestedBy: 'school',
				isAcceptedBySchool: false, // Pending invitation
				isActive: false
			})
			.returning();

		return result[0];
	}

	/**
	 * Instructor applies to school
	 */
	async applyToSchool(instructorId: number, schoolId: number): Promise<SchoolInstructor> {
		const result = await db
			.insert(schoolInstructors)
			.values({
				schoolId,
				instructorId,
				requestedBy: 'instructor',
				isAcceptedBySchool: false, // Pending application
				isActive: false
			})
			.returning();

		return result[0];
	}

	/**
	 * Get pending instructor requests for a school (applications from instructors)
	 */
	async getPendingInstructors(schoolId: number): Promise<SchoolInstructorWithDetails[]> {
		const result = await db
			.select({
				schoolInstructor: schoolInstructors,
				instructor: users
			})
			.from(schoolInstructors)
			.innerJoin(users, eq(schoolInstructors.instructorId, users.id))
			.where(
				and(
					eq(schoolInstructors.schoolId, schoolId),
					eq(schoolInstructors.isAcceptedBySchool, false),
					isNull(schoolInstructors.rejectedAt)
				)
			)
			.orderBy(schoolInstructors.requestedAt);

		return result.map(r => ({
			...r.schoolInstructor,
			instructor: r.instructor
		}));
	}

	/**
	 * Get pending invitations for an instructor (invites from schools)
	 */
	async getPendingInvitations(instructorId: number): Promise<Array<SchoolInstructor & { school: School }>> {
		const result = await db
			.select({
				schoolInstructor: schoolInstructors,
				school: schools
			})
			.from(schoolInstructors)
			.innerJoin(schools, eq(schoolInstructors.schoolId, schools.id))
			.where(
				and(
					eq(schoolInstructors.instructorId, instructorId),
					eq(schoolInstructors.requestedBy, 'school'),
					eq(schoolInstructors.isAcceptedBySchool, false),
					isNull(schoolInstructors.rejectedAt)
				)
			)
			.orderBy(schoolInstructors.requestedAt);

		return result.map(r => ({
			...r.schoolInstructor,
			school: r.school
		}));
	}

	/**
	 * Get pending applications for an instructor (applications to schools)
	 */
	async getPendingApplications(instructorId: number): Promise<Array<SchoolInstructor & { school: School }>> {
		const result = await db
			.select({
				schoolInstructor: schoolInstructors,
				school: schools
			})
			.from(schoolInstructors)
			.innerJoin(schools, eq(schoolInstructors.schoolId, schools.id))
			.where(
				and(
					eq(schoolInstructors.instructorId, instructorId),
					eq(schoolInstructors.requestedBy, 'instructor'),
					eq(schoolInstructors.isAcceptedBySchool, false),
					isNull(schoolInstructors.rejectedAt)
				)
			)
			.orderBy(schoolInstructors.requestedAt);

		return result.map(r => ({
			...r.schoolInstructor,
			school: r.school
		}));
	}

	/**
	 * School accepts an instructor (either from application or after invite acceptance)
	 */
	async acceptInstructor(schoolId: number, instructorId: number): Promise<SchoolInstructor | null> {
		return await db.transaction(async (tx) => {
			// Update the relationship
			const result = await tx
				.update(schoolInstructors)
				.set({
					isAcceptedBySchool: true,
					isActive: true,
					acceptedAt: new Date(),
					updatedAt: new Date()
				})
				.where(
					and(
						eq(schoolInstructors.schoolId, schoolId),
						eq(schoolInstructors.instructorId, instructorId)
					)
				)
				.returning();

			if (!result[0]) {
				throw new Error('School-Instructor relationship not found');
			}

			// Update instructor role to instructor-school
			await tx
				.update(users)
				.set({
					role: 'instructor-school',
					updatedAt: new Date()
				})
				.where(eq(users.id, instructorId));

			// Create history record
			await tx.insert(schoolInstructorHistory).values({
				instructorId,
				schoolId,
				startDate: new Date(),
				endDate: null, // Still active
				contractType: 'school',
				isIndependent: false
			});

			return result[0];
		});
	}

	/**
	 * School rejects an instructor
	 */
	async rejectInstructor(schoolId: number, instructorId: number): Promise<SchoolInstructor | null> {
		const result = await db
			.update(schoolInstructors)
			.set({
				rejectedAt: new Date(),
				updatedAt: new Date()
			})
			.where(
				and(
					eq(schoolInstructors.schoolId, schoolId),
					eq(schoolInstructors.instructorId, instructorId)
				)
			)
			.returning();

		return result[0] ?? null;
	}

	/**
	 * Instructor accepts school invitation
	 */
	async acceptInvitation(instructorId: number, schoolId: number): Promise<SchoolInstructor | null> {
		return await db.transaction(async (tx) => {
			// Update the relationship
			const result = await tx
				.update(schoolInstructors)
				.set({
					isAcceptedBySchool: true,
					isActive: true,
					acceptedAt: new Date(),
					updatedAt: new Date()
				})
				.where(
					and(
						eq(schoolInstructors.schoolId, schoolId),
						eq(schoolInstructors.instructorId, instructorId),
						eq(schoolInstructors.requestedBy, 'school')
					)
				)
				.returning();

			if (!result[0]) {
				throw new Error('School invitation not found');
			}

			// Update instructor role to instructor-school
			await tx
				.update(users)
				.set({
					role: 'instructor-school',
					updatedAt: new Date()
				})
				.where(eq(users.id, instructorId));

			// Create history record
			await tx.insert(schoolInstructorHistory).values({
				instructorId,
				schoolId,
				startDate: new Date(),
				endDate: null,
				contractType: 'school',
				isIndependent: false
			});

			return result[0];
		});
	}

	/**
	 * Instructor rejects school invitation
	 */
	async rejectInvitation(instructorId: number, schoolId: number): Promise<SchoolInstructor | null> {
		const result = await db
			.update(schoolInstructors)
			.set({
				rejectedAt: new Date(),
				updatedAt: new Date()
			})
			.where(
				and(
					eq(schoolInstructors.schoolId, schoolId),
					eq(schoolInstructors.instructorId, instructorId),
					eq(schoolInstructors.requestedBy, 'school')
				)
			)
			.returning();

		return result[0] ?? null;
	}

	/**
	 * Get active instructors for a school
	 */
	async getActiveInstructors(schoolId: number): Promise<InstructorWithDetails[]> {
		const result = await db
			.select({
				instructor: users,
				sport: sports,
				resort: resorts
			})
			.from(schoolInstructors)
			.innerJoin(users, eq(schoolInstructors.instructorId, users.id))
			.leftJoin(instructorSports, eq(users.id, instructorSports.instructorId))
			.leftJoin(sports, eq(instructorSports.sportId, sports.id))
			.leftJoin(instructorResorts, eq(users.id, instructorResorts.instructorId))
			.leftJoin(resorts, eq(instructorResorts.resortId, resorts.id))
			.where(
				and(
					eq(schoolInstructors.schoolId, schoolId),
					eq(schoolInstructors.isAcceptedBySchool, true),
					eq(schoolInstructors.isActive, true)
				)
			);

		// Group by instructor and aggregate sports/resorts
		const instructorMap = new Map<number, InstructorWithDetails>();

		for (const row of result) {
			if (!instructorMap.has(row.instructor.id)) {
				instructorMap.set(row.instructor.id, {
					...row.instructor,
					sports: [],
					resorts: []
				});
			}

			const instructor = instructorMap.get(row.instructor.id)!;

			if (row.sport && !instructor.sports?.some(s => s.sportId === row.sport.id)) {
				instructor.sports?.push({
					sportId: row.sport.id,
					sport: row.sport.sport
				});
			}

			if (row.resort && !instructor.resorts?.some(r => r.resortId === row.resort.id)) {
				instructor.resorts?.push({
					resortId: row.resort.id,
					resort: row.resort.name
				});
			}
		}

		return Array.from(instructorMap.values());
	}

	/**
	 * Deactivate instructor from school (remove from roster)
	 */
	async deactivateInstructor(schoolId: number, instructorId: number): Promise<SchoolInstructor | null> {
		return await db.transaction(async (tx) => {
			// Update relationship to inactive
			const result = await tx
				.update(schoolInstructors)
				.set({
					isActive: false,
					updatedAt: new Date()
				})
				.where(
					and(
						eq(schoolInstructors.schoolId, schoolId),
						eq(schoolInstructors.instructorId, instructorId)
					)
				)
				.returning();

			if (!result[0]) {
				return null;
			}

			// Update history record to set end date
			await tx
				.update(schoolInstructorHistory)
				.set({
					endDate: new Date()
				})
				.where(
					and(
						eq(schoolInstructorHistory.schoolId, schoolId),
						eq(schoolInstructorHistory.instructorId, instructorId),
						isNull(schoolInstructorHistory.endDate)
					)
				);

			// Update instructor role back to instructor-independent
			await tx
				.update(users)
				.set({
					role: 'instructor-independent',
					updatedAt: new Date()
				})
				.where(eq(users.id, instructorId));

			return result[0];
		});
	}

	/**
	 * Reactivate instructor (if previously deactivated)
	 */
	async reactivateInstructor(schoolId: number, instructorId: number): Promise<SchoolInstructor | null> {
		return await db.transaction(async (tx) => {
			const result = await tx
				.update(schoolInstructors)
				.set({
					isActive: true,
					updatedAt: new Date()
				})
				.where(
					and(
						eq(schoolInstructors.schoolId, schoolId),
						eq(schoolInstructors.instructorId, instructorId)
					)
				)
				.returning();

			if (!result[0]) {
				return null;
			}

			// Create new history record
			await tx.insert(schoolInstructorHistory).values({
				instructorId,
				schoolId,
				startDate: new Date(),
				endDate: null,
				contractType: 'school',
				isIndependent: false
			});

			// Update instructor role to instructor-school
			await tx
				.update(users)
				.set({
					role: 'instructor-school',
					updatedAt: new Date()
				})
				.where(eq(users.id, instructorId));

			return result[0];
		});
	}

	/**
	 * Get instructor's current active school (if any)
	 */
	async getInstructorSchool(instructorId: number): Promise<School | null> {
		const result = await db
			.select({ school: schools })
			.from(schoolInstructors)
			.innerJoin(schools, eq(schoolInstructors.schoolId, schools.id))
			.where(
				and(
					eq(schoolInstructors.instructorId, instructorId),
					eq(schoolInstructors.isAcceptedBySchool, true),
					eq(schoolInstructors.isActive, true)
				)
			)
			.limit(1);

		return result[0]?.school ?? null;
	}

	/**
	 * Check if instructor is available to join a school
	 * (not currently in another school)
	 */
	async checkInstructorAvailability(instructorId: number): Promise<boolean> {
		const existing = await db
			.select({ id: schoolInstructors.schoolId })
			.from(schoolInstructors)
			.where(
				and(
					eq(schoolInstructors.instructorId, instructorId),
					eq(schoolInstructors.isAcceptedBySchool, true),
					eq(schoolInstructors.isActive, true)
				)
			);

		return existing.length === 0;
	}

	/**
	 * Check if there's already a pending request between school and instructor
	 */
	async checkPendingRequest(schoolId: number, instructorId: number): Promise<boolean> {
		const existing = await db
			.select({ id: schoolInstructors.schoolId })
			.from(schoolInstructors)
			.where(
				and(
					eq(schoolInstructors.schoolId, schoolId),
					eq(schoolInstructors.instructorId, instructorId),
					eq(schoolInstructors.isAcceptedBySchool, false),
					isNull(schoolInstructors.rejectedAt)
				)
			);

		return existing.length > 0;
	}

	/**
	 * Get all instructors count for a school
	 */
	async getSchoolInstructorCount(schoolId: number): Promise<number> {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(schoolInstructors)
			.where(
				and(
					eq(schoolInstructors.schoolId, schoolId),
					eq(schoolInstructors.isAcceptedBySchool, true),
					eq(schoolInstructors.isActive, true)
				)
			);

		return Number(result[0]?.count ?? 0);
	}

	/**
	 * Get pending requests count for a school
	 */
	async getPendingRequestsCount(schoolId: number): Promise<number> {
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(schoolInstructors)
			.where(
				and(
					eq(schoolInstructors.schoolId, schoolId),
					eq(schoolInstructors.isAcceptedBySchool, false),
					isNull(schoolInstructors.rejectedAt)
				)
			);

		return Number(result[0]?.count ?? 0);
	}
}
