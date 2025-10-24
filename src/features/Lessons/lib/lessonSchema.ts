import { z } from "zod";

// Create Lesson Schema with multiple sports support
export const lessonSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).optional(),
    basePrice: z.number().int().nonnegative(),
    currency: z.string().min(1).max(50),
    duration: z.string().min(1).max(50).optional(), // e.g., '2h', 'half-day'
    sports: z.array(z.number().int().positive()).min(1, "Select at least one sport"), // Array of sport IDs
    instructorId: z.number().int().positive().nullable().optional(),
    schoolId: z.number().int().positive().nullable().optional(),
    isPublished: z.boolean().optional(),
    isBaseLesson: z.boolean().optional(),
});

// Update Lesson Schema (partial version for patch requests)
export const lessonUpdateSchema = lessonSchema.partial();

// Infer TypeScript types
export type LessonSchema = z.infer<typeof lessonSchema>;
export type LessonUpdateData = z.infer<typeof lessonUpdateSchema>;

// Type for lesson data to be saved (matches database structure)
export type LessonData = Omit<LessonSchema, 'sports'>;

// Type for lesson with sports loaded from database
export type LessonWithSports = LessonData & {
    id: number;
    sports: number[]; // Array of sport IDs
};