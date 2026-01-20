import { db } from "$lib/server/db/index";
import {
	schoolClaims,
	schools,
	users,
	type SchoolClaim,
	type InsertSchoolClaim,
	type School,
	type User
} from "$src/lib/server/db/schema";
import { eq, and, or } from "drizzle-orm";

export interface SchoolClaimWithDetails extends SchoolClaim {
	school?: School;
	claimant?: User;
	currentOwner?: User;
}

export class SchoolClaimRepository {
	/**
	 * Create a new school claim request
	 */
	async createClaim(
		schoolId: number,
		claimantUserId: number,
		currentOwnerUserId: number,
		message?: string
	): Promise<SchoolClaim> {
		const result = await db
			.insert(schoolClaims)
			.values({
				schoolId,
				claimantUserId,
				currentOwnerUserId,
				message,
				status: 'pending'
			})
			.returning();

		return result[0];
	}

	/**
	 * Get claim by ID with full details
	 */
	async getClaimById(claimId: number): Promise<SchoolClaimWithDetails | null> {
		const result = await db
			.select({
				claim: schoolClaims,
				school: schools,
				claimant: users,
				currentOwner: users
			})
			.from(schoolClaims)
			.leftJoin(schools, eq(schoolClaims.schoolId, schools.id))
			.leftJoin(users, eq(schoolClaims.claimantUserId, users.id))
			.leftJoin(users, eq(schoolClaims.currentOwnerUserId, users.id))
			.where(eq(schoolClaims.id, claimId))
			.limit(1);

		if (!result[0]) return null;

		return {
			...result[0].claim,
			school: result[0].school || undefined,
			claimant: result[0].claimant || undefined,
			currentOwner: result[0].currentOwner || undefined
		};
	}

	/**
	 * Get pending claims for a school owner
	 */
	async getPendingClaimsForOwner(ownerUserId: number): Promise<SchoolClaimWithDetails[]> {
		const result = await db
			.select({
				claim: schoolClaims,
				school: schools,
				claimant: users
			})
			.from(schoolClaims)
			.leftJoin(schools, eq(schoolClaims.schoolId, schools.id))
			.leftJoin(users, eq(schoolClaims.claimantUserId, users.id))
			.where(
				and(
					eq(schoolClaims.currentOwnerUserId, ownerUserId),
					eq(schoolClaims.status, 'pending')
				)
			)
			.orderBy(schoolClaims.createdAt);

		return result.map(r => ({
			...r.claim,
			school: r.school || undefined,
			claimant: r.claimant || undefined
		}));
	}

	/**
	 * Get pending claims submitted by a user
	 */
	async getPendingClaimsByClaimant(claimantUserId: number): Promise<SchoolClaimWithDetails[]> {
		const result = await db
			.select({
				claim: schoolClaims,
				school: schools,
				currentOwner: users
			})
			.from(schoolClaims)
			.leftJoin(schools, eq(schoolClaims.schoolId, schools.id))
			.leftJoin(users, eq(schoolClaims.currentOwnerUserId, users.id))
			.where(
				and(
					eq(schoolClaims.claimantUserId, claimantUserId),
					eq(schoolClaims.status, 'pending')
				)
			)
			.orderBy(schoolClaims.createdAt);

		return result.map(r => ({
			...r.claim,
			school: r.school || undefined,
			currentOwner: r.currentOwner || undefined
		}));
	}

	/**
	 * Check if there's already a pending claim for this school by this user
	 */
	async hasPendingClaim(schoolId: number, claimantUserId: number): Promise<boolean> {
		const result = await db
			.select({ id: schoolClaims.id })
			.from(schoolClaims)
			.where(
				and(
					eq(schoolClaims.schoolId, schoolId),
					eq(schoolClaims.claimantUserId, claimantUserId),
					eq(schoolClaims.status, 'pending')
				)
			)
			.limit(1);

		return result.length > 0;
	}

	/**
	 * Approve a claim and transfer ownership
	 */
	async approveClaim(
		claimId: number,
		responseMessage?: string
	): Promise<{ claim: SchoolClaim; school: School } | null> {
		return await db.transaction(async (tx) => {
			// Update claim status
			const [claim] = await tx
				.update(schoolClaims)
				.set({
					status: 'approved',
					responseMessage,
					reviewedAt: new Date(),
					updatedAt: new Date()
				})
				.where(eq(schoolClaims.id, claimId))
				.returning();

			if (!claim) return null;

			// Transfer school ownership
			const [school] = await tx
				.update(schools)
				.set({
					ownerUserId: claim.claimantUserId,
					updatedAt: new Date()
				})
				.where(eq(schools.id, claim.schoolId))
				.returning();

			// Update claimant's role to school-admin if not already
			await tx
				.update(users)
				.set({
					role: 'school-admin',
					updatedAt: new Date()
				})
				.where(eq(users.id, claim.claimantUserId));

			return { claim, school };
		});
	}

	/**
	 * Reject a claim
	 */
	async rejectClaim(claimId: number, responseMessage?: string): Promise<SchoolClaim | null> {
		const [result] = await db
			.update(schoolClaims)
			.set({
				status: 'rejected',
				responseMessage,
				reviewedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(schoolClaims.id, claimId))
			.returning();

		return result || null;
	}

	/**
	 * Get all claims for a specific school
	 */
	async getClaimsBySchool(schoolId: number): Promise<SchoolClaimWithDetails[]> {
		const result = await db
			.select({
				claim: schoolClaims,
				claimant: users,
				currentOwner: users
			})
			.from(schoolClaims)
			.leftJoin(users, eq(schoolClaims.claimantUserId, users.id))
			.leftJoin(users, eq(schoolClaims.currentOwnerUserId, users.id))
			.where(eq(schoolClaims.schoolId, schoolId))
			.orderBy(schoolClaims.createdAt);

		return result.map(r => ({
			...r.claim,
			claimant: r.claimant || undefined,
			currentOwner: r.currentOwner || undefined
		}));
	}

	/**
	 * Delete a pending claim (can be done by claimant before it's reviewed)
	 */
	async deleteClaim(claimId: number, claimantUserId: number): Promise<boolean> {
		const result = await db
			.delete(schoolClaims)
			.where(
				and(
					eq(schoolClaims.id, claimId),
					eq(schoolClaims.claimantUserId, claimantUserId),
					eq(schoolClaims.status, 'pending')
				)
			)
			.returning();

		return result.length > 0;
	}
}
