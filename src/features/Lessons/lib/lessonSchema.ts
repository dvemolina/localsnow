import { z } from "zod";

export const lessonSchema = z.object({
    sports: z.array(z.number()),
    basePrice: z.number(),
    currency: z.string(),
});

export type LessonSchema = typeof lessonSchema