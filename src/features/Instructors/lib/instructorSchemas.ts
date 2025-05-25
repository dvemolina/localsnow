import { z } from "zod";

export const instructorSignupSchema = z.object({
    profileImage: z
        .instanceof(File, {
        message: 'Please upload a Profile Image. You can always change it later',
        })
        .refine((file) => file.size <= 5 * 1024 * 1024, 'Max 5MB upload size.')
        .refine(
        (file) =>
            ['image/jpeg', 'image/png'].includes(file.type),
        'Only JPEG or PNG images are allowed.'
        ),

    qualification: z
        .instanceof(File, {
        message: 'Please upload a Qualification File to verify you are a professional',
        })
        .refine((file) => file.size <= 1 * 1024 * 1024, 'Max 1MB upload size.')
        .refine((f) => f.type === 'application/pdf', 'The file has to be in PDF format'),
    bio: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().nonempty("Insert School's Contact Email"),
    resort: z.number(),
    sports: z.boolean().array(),
    basePrice: z.number(),
    currency: z.string()
});

export type InstructorSignupSchema = typeof instructorSignupSchema