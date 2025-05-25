import { z } from "zod";

export const heroResortSearchSchema = z.object({
    resort: z.string(),
    sport: z.string()
})