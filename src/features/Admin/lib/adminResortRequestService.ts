// src/features/Admin/lib/adminResortRequestService.ts
import { db } from '$lib/server/db';
import { resortRequests, resorts, countries, regions, users } from '$lib/server/db/schema';
import { eq, desc, count, and } from 'drizzle-orm';
import { adminAuditService } from './adminAuditService';
import { EmailService } from '$lib/server/email/service';
import slugify from 'slugify';

const emailService = new EmailService();

interface ResortRequestFilters {
	status?: 'pending' | 'approved' | 'rejected';
}

export const adminResortRequestService = {
	/**
	 * Get all resort requests with pagination and filters
	 */
	async getAllResortRequests(
		filters: ResortRequestFilters = {},
		page: number = 1,
		pageSize: number = 50
	) {
		const offset = (page - 1) * pageSize;

		// Build where conditions
		const conditions: any[] = [];

		if (filters.status) {
			conditions.push(eq(resortRequests.status, filters.status));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Get paginated requests
		const requests = await db.query.resortRequests.findMany({
			where: whereClause,
			with: {
				requester: true,
				country: true,
				region: true,
				reviewedByAdmin: true,
				createdResort: true
			},
			orderBy: [desc(resortRequests.createdAt)],
			limit: pageSize,
			offset
		});

		// Get total count for pagination
		const [{ value: totalCount }] = await db
			.select({ value: count() })
			.from(resortRequests)
			.where(whereClause);

		return {
			requests,
			pagination: {
				page,
				pageSize,
				total: totalCount,
				totalPages: Math.ceil(totalCount / pageSize)
			}
		};
	},

	/**
	 * Get single resort request by ID
	 */
	async getResortRequestById(requestId: number) {
		const request = await db.query.resortRequests.findFirst({
			where: eq(resortRequests.id, requestId),
			with: {
				requester: true,
				country: true,
				region: true,
				reviewedByAdmin: true,
				createdResort: true
			}
		});

		return request;
	},

	/**
	 * Approve resort request and create the resort
	 */
	async approveResortRequest(requestId: number, adminId: number, event?: any) {
		// Get the resort request
		const request = await db.query.resortRequests.findFirst({
			where: eq(resortRequests.id, requestId),
			with: {
				requester: true,
				country: true,
				region: true
			}
		});

		if (!request) {
			throw new Error('Resort request not found');
		}

		if (request.status !== 'pending') {
			throw new Error('Resort request is not pending');
		}

		// Create the resort
		const resortSlug = slugify(request.resortName, { lower: true, strict: true });

		// Check if resort with this slug already exists
		const existingResort = await db.query.resorts.findFirst({
			where: eq(resorts.slug, resortSlug)
		});

		let createdResort;
		if (existingResort) {
			// Resort already exists, just link it
			createdResort = existingResort;
		} else {
			// Create new resort
			[createdResort] = await db
				.insert(resorts)
				.values({
					name: request.resortName,
					slug: resortSlug,
					countryId: request.countryId!,
					regionId: request.regionId,
					website: request.website,
					description: request.additionalInfo
				})
				.returning();
		}

		// Update resort request status
		await db
			.update(resortRequests)
			.set({
				status: 'approved',
				reviewedByAdminId: adminId,
				reviewedAt: new Date(),
				createdResortId: createdResort.id
			})
			.where(eq(resortRequests.id, requestId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'approve_resort_request',
			targetType: 'resort_request',
			targetId: requestId,
			details: {
				resortName: request.resortName,
				resortId: createdResort.id,
				resortSlug: createdResort.slug
			},
			event
		});

		// Send email notification to requester
		try {
			await emailService.send({
				to: request.requesterEmail,
				subject: `Your resort request for "${request.resortName}" has been approved`,
				html: `
					<h2>Resort Request Approved!</h2>
					<p>Hi ${request.requesterName},</p>
					<p>Great news! Your request to add <strong>${request.resortName}</strong> has been approved and is now available in Local Snow.</p>
					<p>You can now select this resort when editing your instructor profile.</p>
					<p>Thank you for helping us expand our resort database!</p>
					<p>Best regards,<br/>The Local Snow Team</p>
				`
			});
		} catch (emailError) {
			console.error('Failed to send resort request approval email:', emailError);
			// Don't fail the request if email fails
		}

		return { success: true, resort: createdResort };
	},

	/**
	 * Reject resort request
	 */
	async rejectResortRequest(
		requestId: number,
		adminId: number,
		reason: string,
		event?: any
	) {
		// Get the resort request
		const request = await db.query.resortRequests.findFirst({
			where: eq(resortRequests.id, requestId),
			with: {
				requester: true
			}
		});

		if (!request) {
			throw new Error('Resort request not found');
		}

		if (request.status !== 'pending') {
			throw new Error('Resort request is not pending');
		}

		// Update resort request status
		await db
			.update(resortRequests)
			.set({
				status: 'rejected',
				reviewedByAdminId: adminId,
				reviewedAt: new Date(),
				rejectionReason: reason
			})
			.where(eq(resortRequests.id, requestId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'reject_resort_request',
			targetType: 'resort_request',
			targetId: requestId,
			details: {
				resortName: request.resortName,
				reason
			},
			event
		});

		// Send email notification to requester
		try {
			await emailService.send({
				to: request.requesterEmail,
				subject: `Update on your resort request for "${request.resortName}"`,
				html: `
					<h2>Resort Request Update</h2>
					<p>Hi ${request.requesterName},</p>
					<p>Thank you for your request to add <strong>${request.resortName}</strong> to Local Snow.</p>
					<p>Unfortunately, we're unable to add this resort at this time for the following reason:</p>
					<blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0;">
						${reason}
					</blockquote>
					<p>If you have any questions or would like to provide additional information, please reply to this email.</p>
					<p>Best regards,<br/>The Local Snow Team</p>
				`
			});
		} catch (emailError) {
			console.error('Failed to send resort request rejection email:', emailError);
			// Don't fail the request if email fails
		}

		return { success: true };
	},

	/**
	 * Get statistics about resort requests
	 */
	async getResortRequestStats() {
		const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
			db
				.select({ count: count() })
				.from(resortRequests)
				.where(eq(resortRequests.status, 'pending')),
			db
				.select({ count: count() })
				.from(resortRequests)
				.where(eq(resortRequests.status, 'approved')),
			db
				.select({ count: count() })
				.from(resortRequests)
				.where(eq(resortRequests.status, 'rejected'))
		]);

		return {
			pending: pendingCount[0]?.count || 0,
			approved: approvedCount[0]?.count || 0,
			rejected: rejectedCount[0]?.count || 0,
			total: (pendingCount[0]?.count || 0) + (approvedCount[0]?.count || 0) + (rejectedCount[0]?.count || 0)
		};
	}
};
