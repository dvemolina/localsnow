import { z } from "zod";

export const heroResortSearchSchema = z.object({
    resort: z.number().optional(),
    sport: z.string().optional()
})