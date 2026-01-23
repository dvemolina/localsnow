/**
 * Zod schemas for user-related emails
 * These schemas validate data at runtime before rendering templates
 */

import { z } from 'zod';

/**
 * Welcome email sent after signup
 * Based on actual call: sendSignupEmail(name, email, betaCode)
 * Also sends: { name, email, betaCode, isBetaLaunch: true, betaValidUntil: '2025-03-31' }
 */
export const signupWelcomeSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	betaCode: z.string().default('BETA2025'),
	isBetaLaunch: z.boolean().default(true),
	betaValidUntil: z.string().default('2025-03-31')
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
