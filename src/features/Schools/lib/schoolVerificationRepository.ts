import { db } from "$lib/server/db/index";
import {
	schoolVerificationRequests,
	schools,
	users,
	resorts,
	type SchoolVerificationRequest,
	type InsertSchoolVerificationRequest,
	type School,
	type User
} from "$src/lib/server/db/schema";
import { eq, and, or } from "drizzle-orm";

export interface SchoolVerificationRequestWithDetails extends SchoolVerificationRequest {
	school?: School;
	requester?: User;
	resort?: { id: number; name: string };
	reviewer?: User;
}

export class SchoolVerificationRepository {
	/**
	 * Create a new verification request
	 */
	async createRequest(data: {
		requesterId: number;
		schoolId?: number;
		schoolName: string;
		schoolEmail?: string;
		schoolPhone?: string;
		resortId?: number;
		countryCode?: string;
		message?: string;
		proofDocument?: string;
	}): Promise<SchoolVerificationRequest> {
		const result = await db
			.insert(schoolVerificationRequests)
			.values({
				requesterId: data.requesterId,
				schoolId: data.schoolId || null,
				schoolName: data.schoolName,
				schoolEmail: data.schoolEmail || null,
				schoolPhone: data.schoolPhone || null,
				resortId: data.resortId || null,
				countryCode: data.countryCode || null,
				message: data.message || null,
				proofDocument: data.proofDocument || null,
				status: 'pending'
			})
			.returning();

		return result[0];
	}

	/**
	 * Get all pending requests for admin review
	 */
	async getPendingRequests(): Promise<SchoolVerificationRequestWithDetails[]> {
		const result = await db
			.select({
				request: schoolVerificationRequests,
				school: schools,
				requester: users,
				resort: resorts
			})
			.from(schoolVerificationRequests)
			.leftJoin(schools, eq(schoolVerificationRequests.schoolId, schools.id))
			.leftJoin(users, eq(schoolVerificationRequests.requesterId, users.id))
			.leftJoin(resorts, eq(schoolVerificationRequests.resortId, resorts.id))
			.where(eq(schoolVerificationRequests.status, 'pending'))
			.orderBy(schoolVerificationRequests.createdAt);

		return result.map(r => ({
			...r.request,
			school: r.school || undefined,
			requester: r.requester || undefined,
			resort: r.resort ? { id: r.resort.id, name: r.resort.name } : undefined
		}));
	}

	/**
	 * Get request by ID with full details
	 */
	async getRequestById(requestId: number): Promise<SchoolVerificationRequestWithDetails | null> {
		const result = await db
			.select({
				request: schoolVerificationRequests,
				school: schools,
				requester: users,
				resort: resorts
			})
			.from(schoolVerificationRequests)
			.leftJoin(schools, eq(schoolVerificationRequests.schoolId, schools.id))
			.leftJoin(users, eq(schoolVerificationRequests.requesterId, users.id))
			.leftJoin(resorts, eq(schoolVerificationRequests.resortId, resorts.id))
			.where(eq(schoolVerificationRequests.id, requestId))
			.limit(1);

		if (!result[0]) return null;

		return {
			...result[0].request,
			school: result[0].school || undefined,
			requester: result[0].requester || undefined,
			resort: result[0].resort ? { id: result[0].resort.id, name: result[0].resort.name } : undefined
		};
	}

	/**
	 * Get requests by user
	 */
	async getRequestsByUser(userId: number): Promise<SchoolVerificationRequestWithDetails[]> {
		const result = await db
			.select({
				request: schoolVerificationRequests,
				school: schools,
				resort: resorts
			})
			.from(schoolVerificationRequests)
			.leftJoin(schools, eq(schoolVerificationRequests.schoolId, schools.id))
			.leftJoin(resorts, eq(schoolVerificationRequests.resortId, resorts.id))
			.where(eq(schoolVerificationRequests.requesterId, userId))
			.orderBy(schoolVerificationRequests.createdAt);

		return result.map(r => ({
			...r.request,
			school: r.school || undefined,
			resort: r.resort ? { id: r.resort.id, name: r.resort.name } : undefined
		}));
	}

	/**
	 * Check if user already has a pending request for a school
	 */
	async hasPendingRequest(userId: number, schoolId?: number): Promise<boolean> {
		const conditions = [
			eq(schoolVerificationRequests.requesterId, userId),
			eq(schoolVerificationRequests.status, 'pending')
		];

		if (schoolId) {
			conditions.push(eq(schoolVerificationRequests.schoolId, schoolId));
		}

		const result = await db
			.select({ id: schoolVerificationRequests.id })
			.from(schoolVerificationRequests)
			.where(and(...conditions))
			.limit(1);

		return result.length > 0;
	}

	/**
	 * Approve request and grant access
	 */
	async approveRequest(
		requestId: number,
		adminId: number,
		adminNotes?: string
	): Promise<SchoolVerificationRequest | null> {
		const [result] = await db
			.update(schoolVerificationRequests)
			.set({
				status: 'approved',
				reviewedBy: adminId,
				adminNotes,
				reviewedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(schoolVerificationRequests.id, requestId))
			.returning();

		return result || null;
	}

	/**
	 * Reject request
	 */
	async rejectRequest(
		requestId: number,
		adminId: number,
		adminNotes?: string
	): Promise<SchoolVerificationRequest | null> {
		const [result] = await db
			.update(schoolVerificationRequests)
			.set({
				status: 'rejected',
				reviewedBy: adminId,
				adminNotes,
				reviewedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(schoolVerificationRequests.id, requestId))
			.returning();

		return result || null;
	}

	/**
	 * Delete a pending request (user can cancel their own)
	 */
	async deleteRequest(requestId: number, userId: number): Promise<boolean> {
		const result = await db
			.delete(schoolVerificationRequests)
			.where(
				and(
					eq(schoolVerificationRequests.id, requestId),
					eq(schoolVerificationRequests.requesterId, userId),
					eq(schoolVerificationRequests.status, 'pending')
				)
			)
			.returning();

		return result.length > 0;
	}
}
