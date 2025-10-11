
import { z } from "zod";

// Create Lesson Schema
export const lessonSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1),
    basePrice: z.number().int().nonnegative(),
    currency: z.string().min(1).max(50),
    duration: z.string().min(1).max(50), // e.g., '2h', 'half-day'
    sportId: z.number().int().positive(),
    instructorId: z.number().int().positive().nullable().optional(),
    schoolId: z.number().int().positive().nullable().optional(),
    isPublished: z.boolean().optional(),
    isBaseLesson: z.boolean().optional(),
});

// Update Lesson Schema (partial version for patch requests)
export const lessonUpdateSchema = lessonSchema.partial();

// Infer TypeScript types (optional if already using interfaces)
export type LessonSchema = z.infer<typeof lessonSchema>;
export type LessonUpdateData = z.infer<typeof lessonUpdateSchema>;