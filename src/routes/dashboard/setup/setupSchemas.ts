import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const imageFileSchema = z
	.instanceof(File)
	.optional()
	.refine((f) => !f || f.size <= MAX_IMAGE_SIZE, { message: 'Image must be less than 5MB' })
	.refine((f) => !f || ALLOWED_IMAGE_TYPES.includes(f.type), {
		message: 'Only JPEG, PNG, and WebP images are allowed'
	});

/** Step 1 — contact info + optional photo/bio */
export const setupBasicsSchema = z.object({
	professionalCountryCode: z.coerce.number().min(1, 'Choose Country Phone Prefix'),
	professionalPhone: z.string().min(1, 'Phone number is required'),
	bio: z.string().optional(),
	profileImage: imageFileSchema
});

/** Step 2 — resort + sports */
export const setupTeachingSchema = z.object({
	resort: z.coerce.number().optional(),
	sports: z.array(z.number()).min(1, 'Select at least one sport')
});

/** Step 3 — base hourly rate (independent instructors only) */
export const setupRateSchema = z.object({
	basePrice: z.coerce.number().int().nonnegative('Price must be 0 or higher'),
	currency: z.string().min(1, 'Select currency')
});

export type SetupBasicsSchema = typeof setupBasicsSchema;
export type SetupTeachingSchema = typeof setupTeachingSchema;
export type SetupRateSchema = typeof setupRateSchema;
