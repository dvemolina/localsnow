/**
 * Zod schemas for booking-related emails
 * These schemas validate data at runtime before rendering templates
 */

import { z } from 'zod';

/**
 * Booking notification sent to instructor when new booking is created
 */
export const bookingNotificationInstructorSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	bookingRequestId: z.number().int().positive(),
	clientName: z.string().min(1),
	numberOfStudents: z.number().int().positive(),
	startDate: z.string(), // ISO string or formatted date
	endDate: z.string().optional().nullable(),
	hoursPerDay: z.number().positive(),
	estimatedPrice: z.number().optional().nullable(),
	currency: z.string().optional().nullable(),
	dashboardUrl: z.string().optional()
});

export type BookingNotificationInstructorData = z.infer<
	typeof bookingNotificationInstructorSchema
>;

/**
 * Booking confirmation sent to client after booking is created
 */
export const bookingConfirmationClientSchema = z.object({
	clientEmail: z.string().email(),
	clientName: z.string().min(1),
	instructorName: z.string().min(1),
	numberOfStudents: z.number().int().positive(),
	startDate: z.string(),
	endDate: z.string().optional().nullable(),
	hoursPerDay: z.number().positive(),
	estimatedPrice: z.number().optional().nullable(),
	currency: z.string().optional().nullable()
});

export type BookingConfirmationClientData = z.infer<typeof bookingConfirmationClientSchema>;

/**
 * Contact info sent to instructor after booking is confirmed
 * Includes full contact details for the client
 */
export const bookingContactInfoSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	clientName: z.string().min(1),
	clientEmail: z.string().email(),
	clientPhone: z.string().min(1),
	clientCountryCode: z.string().min(1),
	numberOfStudents: z.number().int().positive(),
	startDate: z.string(),
	endDate: z.string().optional().nullable(),
	hoursPerDay: z.number().positive(),
	sports: z.array(z.string()),
	skillLevel: z.string().min(1),
	message: z.string().optional().nullable(),
	estimatedPrice: z.number().optional().nullable(),
	currency: z.string().optional().nullable()
});

export type BookingContactInfoData = z.infer<typeof bookingContactInfoSchema>;

/**
 * Cancellation notification sent to instructor
 */
export const bookingCancellationInstructorSchema = z.object({
	instructorEmail: z.string().email(),
	instructorName: z.string().min(1),
	bookingRequestId: z.number().int().positive(),
	clientName: z.string().min(1),
	startDate: z.string(),
	endDate: z.string().optional().nullable(),
	numberOfStudents: z.number().int().positive(),
	hoursPerDay: z.number().positive(),
	dashboardUrl: z.string().optional()
});

export type BookingCancellationInstructorData = z.infer<
	typeof bookingCancellationInstructorSchema
>;

/**
 * Cancellation confirmation sent to client
 */
export const bookingCancellationClientSchema = z.object({
	clientEmail: z.string().email(),
	clientName: z.string().min(1),
	instructorName: z.string().min(1),
	bookingRequestId: z.number().int().positive(),
	startDate: z.string(),
	endDate: z.string().optional().nullable()
});

export type BookingCancellationClientData = z.infer<typeof bookingCancellationClientSchema>;
