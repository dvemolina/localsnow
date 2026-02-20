/**
 * Zod schemas for user-related emails
 * These schemas validate data at runtime before rendering templates
 */

import { z } from 'zod';

/**
 * Welcome email sent after signup
 * Based on actual call: sendSignupEmail(name, email)
 */
export const signupWelcomeSchema = z.object({
	name: z.string().min(1),
	email: z.string().email()
});

export type SignupWelcomeData = z.infer<typeof signupWelcomeSchema>;

/**
 * Contact form submission (someone contacts instructor via form)
 */
export const instructorContactFormSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	clientName: z.string().min(1),
	clientEmail: z.string().email(),
	clientPhone: z.string().optional(),
	message: z.string().min(1),
	instructorProfileUrl: z.string().url()
});

export type InstructorContactFormData = z.infer<typeof instructorContactFormSchema>;

/**
 * Admin verifies an instructor's qualification
 */
export const instructorVerifiedSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	dashboardUrl: z.string().url()
});

export type InstructorVerifiedData = z.infer<typeof instructorVerifiedSchema>;

/**
 * Admin rejects an instructor's qualification
 */
export const instructorRejectedSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	reason: z.string().min(1),
	dashboardUrl: z.string().url()
});

export type InstructorRejectedData = z.infer<typeof instructorRejectedSchema>;
