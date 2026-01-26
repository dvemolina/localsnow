import { adminUserService } from '$src/features/Admin/lib/adminUserService';
import { roleTransitionService } from '$src/features/Admin/lib/roleTransitionService';
import { adminAuditService } from '$src/features/Admin/lib/adminAuditService';
import { fail, redirect } from '@sveltejs/kit';
import { hasRole, hasInstructorRole } from '$src/lib/utils/roles';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users, schools, userRoles } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = parseInt(params.id);

	if (!locals.user || !hasRole(locals.user, 'admin')) {
		throw redirect(302, '/admin');
	}

	// Get user details
	const userResult = await adminUserService.getUserById(userId);

	if (!userResult) {
		throw redirect(302, '/admin/users?error=user_not_found');
	}
	const { user } = userResult;

	// Get audit logs
	const auditLogs = await adminAuditService.getRecentLogs(userId, 20);

	// Get restorable transitions
	const restorableTransitions = await roleTransitionService.getRestorableTransitions(userId);

	// Get role-specific data
	let roleData = null;

	if (hasInstructorRole(user)) {
		// Get instructor-specific data
		const instructorSports = await db.query.instructorSports.findMany({
			where: (instructorSports, { eq }) => eq(instructorSports.instructorId, userId),
			with: {
				sport: true
			}
		});

		const instructorResorts = await db.query.instructorResorts.findMany({
			where: (instructorResorts, { eq }) => eq(instructorResorts.instructorId, userId),
			with: {
				resort: true
			}
		});

		roleData = {
			type: 'instructor',
			sports: instructorSports.map(is => is.sport),
			resorts: instructorResorts.map(ir => ir.resort)
		};
	} else if (hasRole(user, 'school-admin')) {
		// Get school data
		const school = await db.query.schools.findFirst({
			where: eq(schools.ownerUserId, userId)
		});

		if (school) {
			const schoolInstructors = await db.query.schoolInstructors.findMany({
				where: (schoolInstructors, { eq }) => eq(schoolInstructors.schoolId, school.id)
			});

			const schoolAdmins = await db.query.schoolAdmins.findMany({
				where: (schoolAdmins, { eq }) => eq(schoolAdmins.schoolId, school.id)
			});

			roleData = {
				type: 'school',
				school,
				instructorCount: schoolInstructors.length,
				adminCount: schoolAdmins.length
			};
		}
	}

	// Get potential school transfer targets (other users who could become school owners)
	let potentialSchoolOwners = [];
	if (hasRole(user, 'school-admin') && roleData?.school) {
		const ownerCandidates = await db
			.select({ userId: userRoles.userId })
			.from(userRoles)
			.where(inArray(userRoles.role, ['school-admin', 'admin']));

		const candidateIds = ownerCandidates.map(row => row.userId).filter(id => id !== userId);
		if (candidateIds.length > 0) {
			potentialSchoolOwners = await db.query.users.findMany({
				where: (users) => inArray(users.id, candidateIds),
				columns: {
					id: true,
					name: true,
					lastName: true,
					email: true,
					role: true
				}
			});
		}
	}

	return {
		user,
		auditLogs,
		restorableTransitions,
		roleData,
		potentialSchoolOwners
	};
};

export const actions: Actions = {
	addRole: async (event) => {
		const { request, params, locals } = event;
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const role = formData.get('role') as string;
		const userId = parseInt(params.id);

		if (!role) {
			return fail(400, { error: 'Role is required' });
		}

		const result = await adminUserService.addUserRole(userId, role, locals.user.id, event);

		if (!result.success) {
			return fail(400, { error: result.error || 'Failed to add role' });
		}

		return {
			success: true,
			message: 'Role added successfully'
		};
	},
	removeRole: async (event) => {
		const { request, params, locals } = event;
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const role = formData.get('role') as string;
		const userId = parseInt(params.id);

		if (!role) {
			return fail(400, { error: 'Role is required' });
		}

		const result = await adminUserService.removeUserRole(userId, role, locals.user.id, event);

		if (!result.success) {
			return fail(400, { error: result.error || 'Failed to remove role' });
		}

		return {
			success: true,
			message: 'Role removed successfully'
		};
	},
	/**
	 * Preview what will happen if role is changed
	 */
	previewRoleChange: async ({ request, params, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const newRole = formData.get('newRole') as any;

		const userId = parseInt(params.id);

		try {
			const validation = await roleTransitionService.validateTransition(userId, newRole);
			const preview = await roleTransitionService.previewTransition(userId, newRole);

			return {
				success: true,
				preview: {
					...preview,
					validation
				}
			};
		} catch (error) {
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to preview role change'
			});
		}
	},

	/**
	 * Execute role change
	 */
	changeRole: async ({ request, params, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const newRole = formData.get('newRole') as any;
		const reason = formData.get('reason') as string;
		const transferSchoolToStr = formData.get('transferSchoolTo') as string;
		const transferSchoolTo = transferSchoolToStr ? parseInt(transferSchoolToStr) : undefined;

		const userId = parseInt(params.id);

		try {
			const result = await roleTransitionService.executeTransition({
				userId,
				newRole,
				adminId: locals.user.id,
				reason,
				transferSchoolTo,
				event: { request } as any
			});

			if (result.success) {
				return {
					success: true,
					message: 'Role changed successfully',
					archiveId: result.archiveId
				};
			} else {
				return fail(400, { error: result.error || 'Failed to change role' });
			}
		} catch (error) {
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to change role'
			});
		}
	},

	/**
	 * Restore previous role
	 */
	restoreRole: async ({ request, params, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const archiveId = parseInt(formData.get('archiveId') as string);

		try {
			await roleTransitionService.restoreRole(archiveId, locals.user.id);

			return {
				success: true,
				message: 'Role restored successfully'
			};
		} catch (error) {
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to restore role'
			});
		}
	},

	/**
	 * Transfer school ownership
	 */
	transferSchool: async ({ request, params, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const schoolId = parseInt(formData.get('schoolId') as string);
		const newOwnerId = parseInt(formData.get('newOwnerId') as string);

		try {
			await roleTransitionService.transferSchoolOwnership(schoolId, newOwnerId, locals.user.id);

			return {
				success: true,
				message: 'School ownership transferred successfully'
			};
		} catch (error) {
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to transfer school'
			});
		}
	},

	/**
	 * Suspend user
	 */
	suspend: async ({ request, params, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const reason = formData.get('reason') as string;
		const userId = parseInt(params.id);

		try {
			await adminUserService.suspendUser(userId, locals.user.id, reason);

			return {
				success: true,
				message: 'User suspended successfully'
			};
		} catch (error) {
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to suspend user'
			});
		}
	},

	/**
	 * Unsuspend user
	 */
	unsuspend: async ({ request, params, locals }) => {
		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const userId = parseInt(params.id);

		try {
			await adminUserService.unsuspendUser(userId, locals.user.id);

			return {
				success: true,
				message: 'User unsuspended successfully'
			};
		} catch (error) {
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to unsuspend user'
			});
		}
	}
};
