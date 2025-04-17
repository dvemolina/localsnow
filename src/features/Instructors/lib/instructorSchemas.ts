import { z } from "zod";

export const instructorSignupSchema = z.object({
    name: z.string().nonempty('Insert your First Name'),
    profileImage: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().nonempty("Insert School's Contact Email"),
    resort: z.number()
});

export type InstructorSignupSchema = typeof instructorSignupSchema