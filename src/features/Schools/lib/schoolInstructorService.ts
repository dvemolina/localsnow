import { SchoolInstructorRepository } from './schoolInstructorRepository';
import type { SchoolInstructor, User, School } from '$src/lib/server/db/schema';
import {
	sendInstructorInvitation,
	sendSchoolApplication,
	sendInstructorAccepted,
	sendInstructorRejected,
	sendInvitationAccepted,
	sendInstructorDeactivated
} from '$lib/server/webhooks/n8n/email-n8n';

export class SchoolInstructorService {
	private repository: SchoolInstructorRepository;

	constructor() {
		this.repository = new SchoolInstructorRepository();
	}

	/**
	 * School invites an instructor
	 */
	async inviteInstructor(
		schoolId: number,
		schoolName: string,
		instructorId: number,
		instructorEmail: string,
		instructorName: string
	): Promise<SchoolInstructor> {
		try {
			// Check if instructor is already in another school
			const isAvailable = await this.repository.checkInstructorAvailability(instructorId);
			if (!isAvailable) {
				throw new Error('Instructor is already part of another school');
			}

			// Check if there's already a pending request
			const hasPending = await this.repository.checkPendingRequest(schoolId, instructorId);
			if (hasPending) {
				throw new Error('A pending request already exists between this school and instructor');
			}

			const result = await this.repository.inviteInstructor(schoolId, instructorId);

			// Send email notification to instructor
			try {
				await sendInstructorInvitation({
					instructorEmail,
					instructorName,
					schoolName,
					schoolSlug: schoolName.toLowerCase().replace(/\s+/g, '-'),
					invitationUrl: `https://localsnow.org/dashboard/invitations`
				});
			} catch (error) {
				console.error('Failed to send instructor invitation email:', error);
				// Don't throw - email failure shouldn't break the invitation
			}

			console.log(`[SCHOOL] Invitation sent to instructor ${instructorId} from school ${schoolId}`);

			return result;
		} catch (error) {
			console.error('Error inviting instructor:', error);
			throw error;
		}
	}

	/**
	 * Instructor applies to school
	 */
	async applyToSchool(
		instructorId: number,
		instructorName: string,
		instructorEmail: string,
		schoolId: number,
		schoolName: string,
		schoolAdminEmail: string
	): Promise<SchoolInstructor> {
		try {
			// Check if instructor is already in another school
			const isAvailable = await this.repository.checkInstructorAvailability(instructorId);
			if (!isAvailable) {
				throw new Error('You are already part of another school');
			}

			// Check if there's already a pending request
			const hasPending = await this.repository.checkPendingRequest(schoolId, instructorId);
			if (hasPending) {
				throw new Error('You have already applied to this school or have a pending invitation');
			}

			const result = await this.repository.applyToSchool(instructorId, schoolId);

			// Send email notification to school admin
			try {
				await sendSchoolApplication({
					schoolAdminEmail,
					schoolName,
					instructorName,
					instructorId,
					reviewUrl: `https://localsnow.org/dashboard/school/instructors/pending`
				});
			} catch (error) {
				console.error('Failed to send school application email:', error);
				// Don't throw - email failure shouldn't break the application
			}

			console.log(`[SCHOOL] Application sent to school ${schoolId} from instructor ${instructorId}`);

			return result;
		} catch (error) {
			console.error('Error applying to school:', error);
			throw error;
		}
	}

	/**
	 * School accepts an instructor
	 */
	async acceptInstructor(
		schoolId: number,
		schoolName: string,
		instructorId: number,
		instructorEmail: string,
		instructorName: string
	): Promise<SchoolInstructor | null> {
		try {
			const result = await this.repository.acceptInstructor(schoolId, instructorId);

			if (!result) {
				throw new Error('Failed to accept instructor');
			}

			// Send email notification to instructor
			try {
				await sendInstructorAccepted({
					instructorEmail,
					instructorName,
					schoolName,
					schoolSlug: schoolName.toLowerCase().replace(/\s+/g, '-'),
					dashboardUrl: `https://localsnow.org/dashboard`
				});
			} catch (error) {
				console.error('Failed to send instructor accepted email:', error);
				// Don't throw - email failure shouldn't break the acceptance
			}

			console.log(`[SCHOOL] Instructor ${instructorId} accepted by school ${schoolId}`);

			return result;
		} catch (error) {
			console.error('Error accepting instructor:', error);
			throw error;
		}
	}

	/**
	 * School rejects an instructor
	 */
	async rejectInstructor(
		schoolId: number,
		schoolName: string,
		instructorId: number,
		instructorEmail: string,
		instructorName: string
	): Promise<SchoolInstructor | null> {
		try {
			const result = await this.repository.rejectInstructor(schoolId, instructorId);

			if (!result) {
				throw new Error('Failed to reject instructor');
			}

			// Send email notification to instructor
			try {
				await sendInstructorRejected({
					instructorEmail,
					instructorName,
					schoolName
				});
			} catch (error) {
				console.error('Failed to send instructor rejected email:', error);
				// Don't throw - email failure shouldn't break the rejection
			}

			console.log(`[SCHOOL] Instructor ${instructorId} rejected by school ${schoolId}`);

			return result;
		} catch (error) {
			console.error('Error rejecting instructor:', error);
			throw error;
		}
	}

	/**
	 * Instructor accepts school invitation
	 */
	async acceptInvitation(
		instructorId: number,
		instructorName: string,
		schoolId: number,
		schoolName: string,
		schoolAdminEmail: string
	): Promise<SchoolInstructor | null> {
		try {
			const result = await this.repository.acceptInvitation(instructorId, schoolId);

			if (!result) {
				throw new Error('Failed to accept invitation');
			}

			// Send email notification to school admin
			try {
				await sendInvitationAccepted({
					schoolAdminEmail,
					schoolName,
					instructorName,
					instructorId
				});
			} catch (error) {
				console.error('Failed to send invitation accepted email:', error);
				// Don't throw - email failure shouldn't break the acceptance
			}

			console.log(`[SCHOOL] Invitation accepted by instructor ${instructorId} for school ${schoolId}`);

			return result;
		} catch (error) {
			console.error('Error accepting invitation:', error);
			throw error;
		}
	}

	/**
	 * Instructor rejects school invitation
	 */
	async rejectInvitation(
		instructorId: number,
		instructorName: string,
		schoolId: number,
		schoolName: string,
		schoolAdminEmail: string
	): Promise<SchoolInstructor | null> {
		try {
			const result = await this.repository.rejectInvitation(instructorId, schoolId);

			if (!result) {
				throw new Error('Failed to reject invitation');
			}

			// Send email notification to school admin (optional)
			console.log(`[SCHOOL] Invitation rejected by instructor ${instructorId} for school ${schoolId}`);

			return result;
		} catch (error) {
			console.error('Error rejecting invitation:', error);
			throw error;
		}
	}

	/**
	 * Get pending instructors for a school
	 */
	async getPendingInstructors(schoolId: number) {
		try {
			return await this.repository.getPendingInstructors(schoolId);
		} catch (error) {
			console.error('Error getting pending instructors:', error);
			throw new Error('Failed to fetch pending instructors');
		}
	}

	/**
	 * Get pending invitations for an instructor
	 */
	async getPendingInvitations(instructorId: number) {
		try {
			return await this.repository.getPendingInvitations(instructorId);
		} catch (error) {
			console.error('Error getting pending invitations:', error);
			throw new Error('Failed to fetch pending invitations');
		}
	}

	/**
	 * Get pending applications for an instructor
	 */
	async getPendingApplications(instructorId: number) {
		try {
			return await this.repository.getPendingApplications(instructorId);
		} catch (error) {
			console.error('Error getting pending applications:', error);
			throw new Error('Failed to fetch pending applications');
		}
	}

	/**
	 * Get active instructors for a school
	 */
	async getActiveInstructors(schoolId: number) {
		try {
			return await this.repository.getActiveInstructors(schoolId);
		} catch (error) {
			console.error('Error getting active instructors:', error);
			throw new Error('Failed to fetch active instructors');
		}
	}

	/**
	 * Deactivate instructor from school
	 */
	async deactivateInstructor(
		schoolId: number,
		schoolName: string,
		instructorId: number,
		instructorEmail: string,
		instructorName: string
	): Promise<SchoolInstructor | null> {
		try {
			const result = await this.repository.deactivateInstructor(schoolId, instructorId);

			if (!result) {
				throw new Error('Failed to deactivate instructor');
			}

			// Send email notification to instructor
			try {
				await sendInstructorDeactivated({
					instructorEmail,
					instructorName,
					schoolName
				});
			} catch (error) {
				console.error('Failed to send instructor deactivated email:', error);
				// Don't throw - email failure shouldn't break the deactivation
			}

			console.log(`[SCHOOL] Instructor ${instructorId} deactivated from school ${schoolId}`);

			return result;
		} catch (error) {
			console.error('Error deactivating instructor:', error);
			throw error;
		}
	}

	/**
	 * Reactivate instructor
	 */
	async reactivateInstructor(schoolId: number, instructorId: number): Promise<SchoolInstructor | null> {
		try {
			return await this.repository.reactivateInstructor(schoolId, instructorId);
		} catch (error) {
			console.error('Error reactivating instructor:', error);
			throw new Error('Failed to reactivate instructor');
		}
	}

	/**
	 * Get instructor's current school
	 */
	async getInstructorSchool(instructorId: number): Promise<School | null> {
		try {
			return await this.repository.getInstructorSchool(instructorId);
		} catch (error) {
			console.error('Error getting instructor school:', error);
			return null;
		}
	}

	/**
	 * Check if instructor can join a school
	 */
	async checkInstructorAvailability(instructorId: number): Promise<boolean> {
		try {
			return await this.repository.checkInstructorAvailability(instructorId);
		} catch (error) {
			console.error('Error checking instructor availability:', error);
			return false;
		}
	}

	/**
	 * Get school stats
	 */
	async getSchoolStats(schoolId: number) {
		try {
			const instructorCount = await this.repository.getSchoolInstructorCount(schoolId);
			const pendingCount = await this.repository.getPendingRequestsCount(schoolId);

			return {
				instructorCount,
				pendingCount
			};
		} catch (error) {
			console.error('Error getting school stats:', error);
			throw new Error('Failed to fetch school stats');
		}
	}
}
