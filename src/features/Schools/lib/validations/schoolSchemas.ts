import { z } from "zod";

export const schoolSignupSchema = z.object({
    name: z.string().nonempty("Insert School's Name"),
    logo: z.instanceof(File, {
        message: 'Please upload School Logo Image. You can always change it later',
        }).optional()
        .refine((file) => file.size <= 5 * 1024 * 1024, 'Max 5MB upload size.')
        .refine(
        (file) =>
            ['image/jpeg', 'image/png'].includes(file.type),
        'Only JPEG or PNG images are allowed.'
        ),
    bio: z.string().optional(),
    countryCode: z.number().min(1, 'Choose Country Phone Prefix'),
    schoolPhone: z.string().nonempty("Insert School's Contact Phone"),
    schoolEmail: z.string().nonempty("Insert School's Contact Email"),
    resort: z.string()
});

export type SchoolSignupSchema = typeof schoolSignupSchema