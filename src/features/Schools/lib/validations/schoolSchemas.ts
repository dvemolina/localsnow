import { z } from "zod";

export const schoolSignupSchema = z.object({
    name: z.string().nonempty('Insert your First Name'),
    logo: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().nonempty("Insert School's Contact Email"),
    resort: z.string()
});

export type SchoolSignupSchema = typeof schoolSignupSchema