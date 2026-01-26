// src/features/Admin/lib/adminUserService.ts
import { db } from '$lib/server/db';
import { users, userRoles } from '$lib/server/db/schema';
import { eq, and, or, like, count, inArray } from 'drizzle-orm';
import { adminAuditService } from './adminAuditService';

interface UserFilters {
	search?: string;
	role?: string;
	isSuspended?: boolean;
}

export const adminUserService = {
	/**
	 * Get all users with filters and pagination
	 */
	async getAllUsers(filters: UserFilters = {}, page: number = 1, pageSize: number = 50) {
		const offset = (page - 1) * pageSize;

		// Build where conditions
		const conditions: any[] = [];

		if (filters.search) {
			conditions.push(
				or(
					like(users.name, `%${filters.search}%`),
					like(users.lastName, `%${filters.search}%`),
					like(users.email, `%${filters.search}%`)
				)
			);
		}

		if (filters.role) {
			const roleUserIds = await db
				.select({ userId: userRoles.userId })
				.from(userRoles)
				.where(eq(userRoles.role, filters.role as any));

			const ids = roleUserIds.map(row => row.userId);
			if (ids.length === 0) {
				return {
					users: [],
					pagination: {
						page,
						pageSize,
						total: 0,
						totalPages: 0
					}
				};
			}

			conditions.push(inArray(users.id, ids));
		}

		if (filters.isSuspended !== undefined) {
			conditions.push(eq(users.isSuspended, filters.isSuspended));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const allUsers = await db.query.users.findMany({
			where: whereClause,
			limit: pageSize,
			offset,
			orderBy: (users, { desc }) => [desc(users.createdAt)],
			columns: {
				passwordHash: false // Don't expose password hash
			}
		});

		const userIds = allUsers.map(user => user.id);
		const rolesByUserId = new Map<number, string[]>();
		if (userIds.length > 0) {
			const roles = await db
				.select({ userId: userRoles.userId, role: userRoles.role })
				.from(userRoles)
				.where(inArray(userRoles.userId, userIds));

			for (const row of roles) {
				const current = rolesByUserId.get(row.userId) || [];
				current.push(row.role);
				rolesByUserId.set(row.userId, current);
			}
		}

		const usersWithRoles = allUsers.map(user => ({
			...user,
			roles: rolesByUserId.get(user.id) || []
		}));

		// Get total count
		const totalResult = await db
			.select({ count: count() })
			.from(users)
			.where(whereClause);

		const total = totalResult[0]?.count || 0;

		return {
			users: usersWithRoles,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize)
			}
		};
	},

	/**
	 * Get single user details
	 */
	async getUserById(userId: number) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				passwordHash: false
			}
		});

		if (!user) {
			return null;
		}

		const roles = await db
			.select({ role: userRoles.role })
			.from(userRoles)
			.where(eq(userRoles.userId, userId));

		// Get audit logs for this user
		const auditLogs = await adminAuditService.getLogsByTarget('user', userId, 20);

		return {
			user: { ...user, roles: roles.map(r => r.role) },
			auditLogs
		};
	},

	/**
	 * Change user role
	 */
	async changeUserRole(
		userId: number,
		newRole: string,
		adminId: number,
		event?: any
	) {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId)
		});

		if (!user) {
			return { success: false, error: 'User not found' };
		}

		const oldRole = user.role;

		await db
			.update(users)
			.set({
				role: newRole as any,
				updatedAt: new Date()
			})
			.where(eq(users.id, userId));

		await db.insert(userRoles).values({ userId, role: newRole as any }).onConflictDoNothing();

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'change_user_role',
			targetType: 'user',
			targetId: userId,
			details: {
				oldRole,
				newRole
			},
			event
		});

		return { success: true };
	},

	/**
	 * Add a role to a user
	 */
	async addUserRole(userId: number, role: string, adminId: number, event?: any) {
		const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
		if (!user) return { success: false, error: 'User not found' };

		await db.insert(userRoles).values({
			userId,
			role: role as any
		}).onConflictDoNothing();

		if (!user.role) {
			await db.update(users).set({ role: role as any, updatedAt: new Date() }).where(eq(users.id, userId));
		}

		await adminAuditService.logAction({
			adminId,
			action: 'add_user_role',
			targetType: 'user',
			targetId: userId,
			details: { role },
			event
		});

		return { success: true };
	},

	/**
	 * Remove a role from a user
	 */
	async removeUserRole(userId: number, role: string, adminId: number, event?: any) {
		const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
		if (!user) return { success: false, error: 'User not found' };

		await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.role, role as any)));

		if (user.role === role) {
			const remainingRoles = await db
				.select({ role: userRoles.role })
				.from(userRoles)
				.where(eq(userRoles.userId, userId));

			const nextPrimary = remainingRoles[0]?.role ?? null;
			await db.update(users)
				.set({ role: nextPrimary as any, updatedAt: new Date() })
				.where(eq(users.id, userId));
		}

		await adminAuditService.logAction({
			adminId,
			action: 'remove_user_role',
			targetType: 'user',
			targetId: userId,
			details: { role },
			event
		});

		return { success: true };
	},

	/**
	 * Suspend a user
	 */
	async suspendUser(userId: number, adminId: number, reason: string, event?: any) {
		await db
			.update(users)
			.set({
				isSuspended: true,
				suspensionReason: reason,
				suspendedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(users.id, userId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'suspend_user',
			targetType: 'user',
			targetId: userId,
			details: { reason },
			event
		});

		return { success: true };
	},

	/**
	 * Unsuspend a user
	 */
	async unsuspendUser(userId: number, adminId: number, event?: any) {
		await db
			.update(users)
			.set({
				isSuspended: false,
				suspensionReason: null,
				suspendedAt: null,
				updatedAt: new Date()
			})
			.where(eq(users.id, userId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'unsuspend_user',
			targetType: 'user',
			targetId: userId,
			event
		});

		return { success: true };
	},

	/**
	 * Delete a user (soft delete)
	 */
	async deleteUser(userId: number, adminId: number, event?: any) {
		await db
			.update(users)
			.set({
				deletedAt: new Date()
			})
			.where(eq(users.id, userId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'delete_user',
			targetType: 'user',
			targetId: userId,
			event
		});

		return { success: true };
	}
};
