import { z } from 'zod';

export const createLessonSchema = z.object({
	clientName: z.string().min(1).max(100).trim(),
	clientEmail: z.string().email().max(255),
	clientCountryCode: z.string().max(4).optional(),
	clientPhone: z.string().max(50).optional(),
	lessonDate: z.string().datetime(), // ISO string
	duration: z.number().min(0.5).max(12),
	numberOfStudents: z.number().int().min(1).max(20).default(1),
	sport: z.enum(['Ski', 'Snowboard', 'Telemark']).optional(),
	skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
	resortId: z.number().int().positive().optional(),
	resortName: z.string().max(100).optional(),
	instructorNotes: z.string().max(5000).optional()
});

export const updateLessonNotesSchema = z.object({
	notes: z.string().max(5000)
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonNotesInput = z.infer<typeof updateLessonNotesSchema>;
