import { z } from "zod";

export const instructorSignupSchema = z.object({
    profileImage: z.string().optional(),
    qualification: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().nonempty("Insert School's Contact Email"),
    resort: z.number(),
    sports: z.boolean().array()
});

export type InstructorSignupSchema = typeof instructorSignupSchema