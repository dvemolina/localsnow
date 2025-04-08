import { z } from "zod";

export const userSignupSchema = z.object({
    name: z.string().nonempty('Insert your First Name'),
    lastName: z.string().nonempty('Insert you Last Name'),
    email: z.string().nonempty('Insert your Email'),
    password: z.string().nonempty('Insert a Password'),
    phone: z.string().nullable(),
    acceptedTerms: z.boolean().default(false)
});

export const userLoginSchema = z.object({
    name: z.string().nonempty('Insert your First Name'),
    lastName: z.string().nonempty('Insert you Last Name'),
    email: z.string().nonempty('Insert your Email'),
    password: z.string().nonempty('Insert a Password'),
    phone: z.string().nullable()
});

export type UserSignupSchema = typeof userSignupSchema
export type UserLoginSchema = typeof userLoginSchema