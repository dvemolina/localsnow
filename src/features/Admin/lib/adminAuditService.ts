// src/features/Admin/lib/adminAuditService.ts
import { db } from '$lib/server/db';
import { adminAuditLog, type InsertAdminAuditLog } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';

interface AuditLogInput {
	adminId: number;
	action: string;
	targetType?: string;
	targetId?: number;
	details?: Record<string, any>;
	event?: RequestEvent;
}

export const adminAuditService = {
	/**
	 * Log an admin action
	 */
	async logAction(input: AuditLogInput): Promise<void> {
		const logEntry: InsertAdminAuditLog = {
			adminId: input.adminId,
			action: input.action,
			targetType: input.targetType,
			targetId: input.targetId,
			details: input.details ? JSON.stringify(input.details) : null,
			ipAddress: input.event?.getClientAddress() || null,
			userAgent: input.event?.request.headers.get('user-agent') || null
		};

		await db.insert(adminAuditLog).values(logEntry);
	},

	/**
	 * Get recent audit logs with pagination
	 */
	async getRecentLogs(limit: number = 50, offset: number = 0) {
		return await db.query.adminAuditLog.findMany({
			limit,
			offset,
			orderBy: (logs, { desc }) => [desc(logs.createdAt)],
			with: {
				admin: {
					columns: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		});
	},

	/**
	 * Get audit logs for a specific admin
	 */
	async getLogsByAdmin(adminId: number, limit: number = 50) {
		return await db.query.adminAuditLog.findMany({
			where: (logs, { eq }) => eq(logs.adminId, adminId),
			limit,
			orderBy: (logs, { desc }) => [desc(logs.createdAt)]
		});
	},

	/**
	 * Get audit logs for a specific target
	 */
	async getLogsByTarget(targetType: string, targetId: number, limit: number = 50) {
		return await db.query.adminAuditLog.findMany({
			where: (logs, { and, eq }) =>
				and(
					eq(logs.targetType, targetType),
					eq(logs.targetId, targetId)
				),
			limit,
			orderBy: (logs, { desc }) => [desc(logs.createdAt)],
			with: {
				admin: {
					columns: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		});
	}
};
