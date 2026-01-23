/**
 * Zod schemas for school-related emails
 * These schemas validate data at runtime before rendering templates
 */

import { z } from 'zod';

/**
 * School invites an instructor to join
 */
export const schoolInstructorInvitationSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	schoolName: z.string().min(1),
	schoolSlug: z.string().min(1),
	invitationUrl: z.string().url()
});

export type SchoolInstructorInvitationData = z.infer<typeof schoolInstructorInvitationSchema>;

/**
 * Instructor applies to school (notification to school admin)
 */
export const schoolApplicationSchema = z.object({
	schoolAdminEmail: z.string().email(),
	schoolName: z.string().min(1),
	instructorName: z.string().min(1),
	instructorId: z.number().int().positive(),
	reviewUrl: z.string().url()
});

export type SchoolApplicationData = z.infer<typeof schoolApplicationSchema>;

/**
 * School accepts instructor's application
 */
export const schoolInstructorAcceptedSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	schoolName: z.string().min(1),
	schoolSlug: z.string().min(1),
	dashboardUrl: z.string().url()
});

export type SchoolInstructorAcceptedData = z.infer<typeof schoolInstructorAcceptedSchema>;

/**
 * School rejects instructor's application
 */
export const schoolInstructorRejectedSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	schoolName: z.string().min(1)
});

export type SchoolInstructorRejectedData = z.infer<typeof schoolInstructorRejectedSchema>;

/**
 * Instructor accepts school invitation (notification to school admin)
 */
export const schoolInvitationAcceptedSchema = z.object({
	schoolAdminEmail: z.string().email(),
	schoolName: z.string().min(1),
	instructorName: z.string().min(1),
	instructorId: z.number().int().positive()
});

export type SchoolInvitationAcceptedData = z.infer<typeof schoolInvitationAcceptedSchema>;

/**
 * School deactivates instructor
 */
export const schoolInstructorDeactivatedSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	schoolName: z.string().min(1)
});

export type SchoolInstructorDeactivatedData = z.infer<typeof schoolInstructorDeactivatedSchema>;
