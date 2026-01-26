import { db } from '$lib/server/db';
import { users, userRoles, roleTransitionArchive, roleTransitionBlocks, bookingRequests, schools, schoolInstructors, instructorSports, instructorResorts, schoolAdmins } from '$lib/server/db/schema';
import { eq, and, inArray, isNull, or } from 'drizzle-orm';
import { adminAuditService } from './adminAuditService';
import type { RequestEvent } from '@sveltejs/kit';

export type Role = 'admin' | 'instructor-independent' | 'instructor-school' | 'school-admin' | 'client' | null;

export interface TransitionBlock {
	type: 'active_bookings' | 'school_has_instructors' | 'school_has_admins' | 'school_not_found';
	severity: 'hard' | 'soft';
	message: string;
	data: any;
	resolution: string;
}

export interface TransitionWarning {
	message: string;
	data: any;
}

export interface ValidationResult {
	canProceed: boolean;
	blocks: TransitionBlock[];
	warnings: TransitionWarning[];
}

export interface TransitionPreview {
	willArchive: string[];
	willDelete: string[];
	willCreate: string[];
	affectedRecords: {
		bookings?: number;
		reviews?: number;
		lessons?: number;
		school?: { id: number; name: string };
		sports?: number;
		resorts?: number;
	};
}

export interface TransitionParams {
	userId: number;
	newRole: Role;
	adminId: number;
	reason?: string;
	transferSchoolTo?: number;
	event?: RequestEvent;
}

export interface TransitionResult {
	success: boolean;
	error?: string;
	archiveId?: number;
}

export interface RestorableTransition {
	archiveId: number;
	fromRole: Role;
	toRole: Role;
	transitionDate: Date;
	expiresAt: Date;
	canRestore: boolean;
}

export const roleTransitionService = {
	/**
	 * Validate if a role transition is possible
	 */
	async validateTransition(userId: number, newRole: Role): Promise<ValidationResult> {
		const blocks: TransitionBlock[] = [];
		const warnings: TransitionWarning[] = [];

		// Get user and current state
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId)
		});

		if (!user) {
			blocks.push({
				type: 'school_not_found' as const,
				severity: 'hard',
				message: 'User not found',
				data: {},
				resolution: 'Ensure the user exists'
			});
			return { canProceed: false, blocks, warnings };
		}

		// If user has instructor role, check for active bookings
		if (user.role?.includes('instructor') && newRole !== user.role) {
			const activeBookings = await db.query.bookingRequests.findMany({
				where: and(
					eq(bookingRequests.instructorId, userId),
					inArray(bookingRequests.status, ['pending', 'accepted'])
				)
			});

			if (activeBookings.length > 0) {
				blocks.push({
					type: 'active_bookings',
					severity: 'hard',
					message: `User has ${activeBookings.length} active booking(s) that must be completed or cancelled first`,
					data: { bookingIds: activeBookings.map(b => b.id), count: activeBookings.length },
					resolution: 'Wait for bookings to complete or manually cancel them'
				});
			}
		}

		// If user is school-admin, check school constraints
		if (user.role === 'school-admin' && newRole !== 'school-admin') {
			const school = await db.query.schools.findFirst({
				where: eq(schools.ownerUserId, userId)
			});

			if (school) {
				// Check for active instructors
				const activeInstructors = await db.query.schoolInstructors.findMany({
					where: and(
						eq(schoolInstructors.schoolId, school.id),
						eq(schoolInstructors.isActive, true)
					)
				});

				if (activeInstructors.length > 0) {
					blocks.push({
						type: 'school_has_instructors',
						severity: 'hard',
						message: `School "${school.name}" has ${activeInstructors.length} active instructor(s)`,
						data: { schoolId: school.id, instructorCount: activeInstructors.length },
						resolution: 'Remove instructors from school or transfer school ownership'
					});
				}

				// Check for other admins
				const otherAdmins = await db.query.schoolAdmins.findMany({
					where: and(
						eq(schoolAdmins.schoolId, school.id),
						eq(schoolAdmins.isAccepted, true)
					)
				});

				if (otherAdmins.length > 1) {
					warnings.push({
						message: `School "${school.name}" has ${otherAdmins.length - 1} other admin(s) who will need reassignment`,
						data: { schoolId: school.id, adminCount: otherAdmins.length - 1 }
					});
				}
			}
		}

		return {
			canProceed: blocks.length === 0,
			blocks,
			warnings
		};
	},

	/**
	 * Get blocking conditions for a user
	 */
	async getBlockingConditions(userId: number, newRole: Role): Promise<TransitionBlock[]> {
		const validation = await this.validateTransition(userId, newRole);
		return validation.blocks;
	},

	/**
	 * Preview what will happen during a role transition
	 */
	async previewTransition(userId: number, newRole: Role): Promise<TransitionPreview> {
		const willArchive: string[] = [];
		const willDelete: string[] = [];
		const willCreate: string[] = [];
		const affectedRecords: any = {};

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId)
		});

		if (!user) {
			return { willArchive, willDelete, willCreate, affectedRecords };
		}

		const currentRole = user.role;

		// Preview instructor -> any role transition
		if (currentRole?.includes('instructor')) {
			willArchive.push('Instructor profile data (bio, qualifications, phone)');

			// Check sports
			const sports = await db.query.instructorSports.findMany({
				where: eq(instructorSports.instructorId, userId)
			});
			if (sports.length > 0) {
				affectedRecords.sports = sports.length;
				willDelete.push(`${sports.length} sport association(s)`);
			}

			// Check resorts
			const resorts = await db.query.instructorResorts.findMany({
				where: eq(instructorResorts.instructorId, userId)
			});
			if (resorts.length > 0) {
				affectedRecords.resorts = resorts.length;
				willDelete.push(`${resorts.length} resort association(s)`);
			}

			// Check bookings
			const bookings = await db.query.bookingRequests.findMany({
				where: eq(bookingRequests.instructorId, userId)
			});
			affectedRecords.bookings = bookings.length;
			if (bookings.length > 0) {
				willArchive.push(`${bookings.length} booking record(s) (will remain accessible via archive)`);
			}

			// Check reviews
			const reviews = await db.select({ count: bookingRequests.id })
				.from(bookingRequests)
				.where(eq(bookingRequests.instructorId, userId));
			if (reviews.length > 0) {
				affectedRecords.reviews = reviews.length;
				willArchive.push(`Review history (will remain accessible)`);
			}
		}

		// Preview school-admin -> any role transition
		if (currentRole === 'school-admin') {
			const school = await db.query.schools.findFirst({
				where: eq(schools.ownerUserId, userId)
			});

			if (school) {
				affectedRecords.school = { id: school.id, name: school.name };
				willArchive.push(`School ownership of "${school.name}"`);
				willDelete.push('School admin status');
			}
		}

		// Preview transition TO instructor
		if (newRole?.includes('instructor') && !currentRole?.includes('instructor')) {
			willCreate.push('New instructor profile (user will need to complete setup)');
			willCreate.push('Ability to receive bookings');
		}

		// Preview transition TO school-admin
		if (newRole === 'school-admin' && currentRole !== 'school-admin') {
			willCreate.push('School admin capabilities');
		}

		// Preview transition TO client
		if (newRole === 'client' && currentRole !== 'client') {
			willCreate.push('Client profile with booking capabilities');
		}

		return { willArchive, willDelete, willCreate, affectedRecords };
	},

	/**
	 * Execute a role transition with all safety checks and archiving
	 */
	async executeTransition(params: TransitionParams): Promise<TransitionResult> {
		const { userId, newRole, adminId, reason, transferSchoolTo, event } = params;

		try {
			// Validate transition
			const validation = await this.validateTransition(userId, newRole);
			if (!validation.canProceed) {
				return {
					success: false,
					error: `Cannot proceed: ${validation.blocks.map(b => b.message).join(', ')}`
				};
			}

			// Execute in transaction
			const result = await db.transaction(async (tx) => {
				// Get current user state
				const user = await tx.query.users.findFirst({
					where: eq(users.id, userId)
				});

				if (!user) {
					throw new Error('User not found');
				}

				const oldRole = user.role;

				// Archive current state
				const archiveData: any = {
					userId,
					adminId,
					fromRole: oldRole,
					toRole: newRole,
					archivedUserData: JSON.stringify(user),
					transitionReason: reason,
					canRestore: true,
					expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
				};

				// Archive role-specific data
				if (oldRole?.includes('instructor')) {
					// Get sports
					const sports = await tx.query.instructorSports.findMany({
						where: eq(instructorSports.instructorId, userId)
					});
					archiveData.archivedSports = sports.map(s => s.sportId);

					// Get resorts
					const resorts = await tx.query.instructorResorts.findMany({
						where: eq(instructorResorts.instructorId, userId)
					});
					archiveData.archivedResorts = resorts.map(r => r.resortId);

					// Delete instructor relationships
					await tx.delete(instructorSports).where(eq(instructorSports.instructorId, userId));
					await tx.delete(instructorResorts).where(eq(instructorResorts.instructorId, userId));
				}

				if (oldRole === 'school-admin') {
					const school = await tx.query.schools.findFirst({
						where: eq(schools.ownerUserId, userId)
					});

					if (school) {
						archiveData.archivedSchoolId = school.id;

						// Handle school transfer if specified
						if (transferSchoolTo) {
							await tx.update(schools)
								.set({ ownerUserId: transferSchoolTo })
								.where(eq(schools.id, school.id));

							// Update school admins
							await tx.update(schoolAdmins)
								.set({ isOwner: false })
								.where(and(
									eq(schoolAdmins.schoolId, school.id),
									eq(schoolAdmins.userId, userId)
								));

							await tx.update(schoolAdmins)
								.set({ isOwner: true })
								.where(and(
									eq(schoolAdmins.schoolId, school.id),
									eq(schoolAdmins.userId, transferSchoolTo)
								));

							// Ensure new owner has school-admin role
							await tx.update(users)
								.set({ role: 'school-admin' })
								.where(eq(users.id, transferSchoolTo));
						}
					}
				}

				// Create archive record
				const [archive] = await tx.insert(roleTransitionArchive)
					.values(archiveData)
					.returning();

				// Update user role and metadata
				await tx.update(users)
					.set({
						role: newRole,
						lastRoleChange: new Date(),
						roleChangeCount: (user.roleChangeCount || 0) + 1,
						// Clear instructor-specific fields if moving away from instructor
						...(!newRole?.includes('instructor') && oldRole?.includes('instructor') ? {
							bio: null,
							qualificationUrl: null,
							professionalCountryCode: null,
							professionalPhone: null,
							spokenLanguages: null,
							isVerified: false,
							isPublished: false
						} : {})
					})
					.where(eq(users.id, userId));

				if (newRole) {
					await tx.insert(userRoles)
						.values({ userId, role: newRole })
						.onConflictDoNothing();
				}

				if (oldRole && oldRole !== newRole) {
					await tx.delete(userRoles)
						.where(and(eq(userRoles.userId, userId), eq(userRoles.role, oldRole)));
				}

				// Log the action
				await adminAuditService.logAction({
					adminId,
					action: 'change_user_role',
					targetType: 'user',
					targetId: userId,
					details: {
						oldRole,
						newRole,
						reason,
						archiveId: archive.id,
						transferredSchoolTo: transferSchoolTo
					},
					event
				});

				return { success: true, archiveId: archive.id };
			});

			return result;
		} catch (error) {
			console.error('Role transition failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	},

	/**
	 * Get restorable transitions for a user (within 90 days)
	 */
	async getRestorableTransitions(userId: number): Promise<RestorableTransition[]> {
		const archives = await db.query.roleTransitionArchive.findMany({
			where: and(
				eq(roleTransitionArchive.userId, userId),
				eq(roleTransitionArchive.canRestore, true),
				isNull(roleTransitionArchive.restoredAt)
			),
			orderBy: (archive, { desc }) => [desc(archive.createdAt)]
		});

		return archives
			.filter(a => a.expiresAt && a.expiresAt > new Date())
			.map(a => ({
				archiveId: a.id,
				fromRole: a.fromRole,
				toRole: a.toRole,
				transitionDate: a.createdAt,
				expiresAt: a.expiresAt!,
				canRestore: true
			}));
	},

	/**
	 * Restore a user's role from an archive
	 */
	async restoreRole(archiveId: number, adminId: number): Promise<void> {
		await db.transaction(async (tx) => {
			// Get archive record
			const archive = await tx.query.roleTransitionArchive.findFirst({
				where: eq(roleTransitionArchive.id, archiveId)
			});

			if (!archive) {
				throw new Error('Archive not found');
			}

			if (!archive.canRestore || archive.restoredAt) {
				throw new Error('This transition cannot be restored');
			}

			if (archive.expiresAt && archive.expiresAt < new Date()) {
				throw new Error('Archive has expired');
			}

			// Parse archived user data
			const archivedUser = JSON.parse(archive.archivedUserData);

			// Restore user role and profile data
			await tx.update(users)
				.set({
					role: archive.fromRole,
					bio: archivedUser.bio,
					qualificationUrl: archivedUser.qualificationUrl,
					professionalCountryCode: archivedUser.professionalCountryCode,
					professionalPhone: archivedUser.professionalPhone,
					spokenLanguages: archivedUser.spokenLanguages,
					isVerified: archivedUser.isVerified,
					isPublished: archivedUser.isPublished,
					lastRoleChange: new Date(),
					roleChangeCount: (archivedUser.roleChangeCount || 0) + 1
				})
				.where(eq(users.id, archive.userId));

			if (archive.fromRole) {
				await tx.insert(userRoles)
					.values({ userId: archive.userId, role: archive.fromRole })
					.onConflictDoNothing();
			}

			if (archive.toRole) {
				await tx.delete(userRoles)
					.where(and(eq(userRoles.userId, archive.userId), eq(userRoles.role, archive.toRole)));
			}

			// Restore instructor relationships if applicable
			if (archive.fromRole?.includes('instructor')) {
				if (archive.archivedSports && archive.archivedSports.length > 0) {
					await tx.insert(instructorSports)
						.values(
							archive.archivedSports.map(sportId => ({
								instructorId: archive.userId,
								sportId
							}))
						);
				}

				if (archive.archivedResorts && archive.archivedResorts.length > 0) {
					await tx.insert(instructorResorts)
						.values(
							archive.archivedResorts.map(resortId => ({
								instructorId: archive.userId,
								resortId
							}))
						);
				}
			}

			// Mark archive as restored
			await tx.update(roleTransitionArchive)
				.set({ restoredAt: new Date(), canRestore: false })
				.where(eq(roleTransitionArchive.id, archiveId));

			// Log the action
			await adminAuditService.logAction({
				adminId,
				action: 'restore_user_role',
				targetType: 'user',
				targetId: archive.userId,
				details: {
					archiveId,
					restoredRole: archive.fromRole,
					previousRole: archive.toRole
				}
			});
		});
	},

	/**
	 * Transfer school ownership to another user
	 */
	async transferSchoolOwnership(schoolId: number, newOwnerId: number, adminId: number): Promise<void> {
		await db.transaction(async (tx) => {
			// Get school
			const school = await tx.query.schools.findFirst({
				where: eq(schools.id, schoolId)
			});

			if (!school) {
				throw new Error('School not found');
			}

			const oldOwnerId = school.ownerUserId;

			// Update school ownership
			await tx.update(schools)
				.set({ ownerUserId: newOwnerId })
				.where(eq(schools.id, schoolId));

			// Update old owner's school admin status
			await tx.update(schoolAdmins)
				.set({ isOwner: false })
				.where(and(
					eq(schoolAdmins.schoolId, schoolId),
					eq(schoolAdmins.userId, oldOwnerId)
				));

			// Check if new owner is already a school admin
			const existingAdmin = await tx.query.schoolAdmins.findFirst({
				where: and(
					eq(schoolAdmins.schoolId, schoolId),
					eq(schoolAdmins.userId, newOwnerId)
				)
			});

			if (existingAdmin) {
				// Update existing record
				await tx.update(schoolAdmins)
					.set({ isOwner: true, isAccepted: true })
					.where(and(
						eq(schoolAdmins.schoolId, schoolId),
						eq(schoolAdmins.userId, newOwnerId)
					));
			} else {
				// Create new school admin record
				await tx.insert(schoolAdmins)
					.values({
						schoolId,
						userId: newOwnerId,
						isOwner: true,
						isAccepted: true
					});
			}

			// Ensure new owner has school-admin role
			await tx.update(users)
				.set({ role: 'school-admin' })
				.where(eq(users.id, newOwnerId));

			await tx.insert(userRoles)
				.values({ userId: newOwnerId, role: 'school-admin' })
				.onConflictDoNothing();

			// Log the action
			await adminAuditService.logAction({
				adminId,
				action: 'transfer_school_ownership',
				targetType: 'school',
				targetId: schoolId,
				details: {
					oldOwnerId,
					newOwnerId,
					schoolName: school.name
				}
			});
		});
	}
};
