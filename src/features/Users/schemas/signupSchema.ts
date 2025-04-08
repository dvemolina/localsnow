import { number, string, z } from "zod";

export const userSignupSchema = z.object({
    name: string().nonempty('Insert your First Name'),
    lastName: string().nonempty('Insert you Last Name'),
    email: string().nonempty('Insert your Email'),
    password: string().nonempty('Insert a Password'),
    countryCode: number().nullable(),
    phone: number().nullable()
});

export type UserSignupSchema = typeof userSignupSchema