import { z } from "zod";

export const userSignupSchema = z.object({
    name: z.string().nonempty('Insert your First Name'),
    lastName: z.string().nonempty('Insert you Last Name'),
    email: z.string().nonempty('Insert your Email'),
    password: z.string().nonempty('Insert a Password'),
    phone: z.string().optional(),
    acceptedTerms: z.boolean().default(false)
});

export const userLoginSchema = z.object({
    email: z.string().nonempty('Insert your Email'),
    password: z.string().nonempty('Insert a Password'),
});


export type UserSignupSchema = typeof userSignupSchema
export type UserLoginSchema = typeof userLoginSchema

export type UserSignupData = {
    name: string;
    lastName: string;
    email: string;
    password?: string;
    passwordHash?: string;
    phone?: string
    acceptedTerms: boolean;
};

export type UserGoogleData = {
        googleId: string;
        name: string;
        lastName: string;
        username: string;
        email: string;
        profileImage: string;
}