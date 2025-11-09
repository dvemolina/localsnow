import { z } from 'zod';

// File size constants (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

// Helper function to validate image files
const imageFileSchema = z
	.instanceof(File)
	.optional()
	.refine(
		(file) => {
			if (!file) return true;
			return file.size <= MAX_IMAGE_SIZE;
		},
		{ message: `Image must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB` }
	)
	.refine(
		(file) => {
			if (!file) return true;
			return ALLOWED_IMAGE_TYPES.includes(file.type);
		},
		{ message: 'Only JPEG, PNG, and WebP images are allowed' }
	);

// Helper function to validate document files
const documentFileSchema = z
	.instanceof(File)
	.optional()
	.refine(
		(file) => {
			if (!file) return true;
			return file.size <= MAX_DOCUMENT_SIZE;
		},
		{ message: `Document must be less than ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB` }
	)
	.refine(
		(file) => {
			if (!file) return true;
			return ALLOWED_DOCUMENT_TYPES.includes(file.type);
		},
		{ message: 'Only PDF documents are allowed' }
	);

// Instructor signup schema
export const instructorSignupSchema = z.object({
	resort: z.coerce.number().min(1, "Choose the Resort where you teach"),
	instructorType: z.enum(['instructor-independent', 'instructor-school']),
	profileImage: imageFileSchema,
	qualification: documentFileSchema,
	professionalCountryCode: z.coerce.number().min(1, 'Choose Country Phone Prefix'),
	professionalPhone: z.string().nonempty("Insert Professional Contact Phone"),
	bio: z.string().optional(),
	sports: z.array(z.number()).min(1, 'Select at least one sport'),
	basePrice: z.coerce.number().min(0, 'Base price must be positive'),
	currency: z.string().min(1, 'Select currency')
});

// Instructor profile update schema (removed instructorType)
export const instructorProfileSchema = z.object({
	bio: z.string().optional(),
	professionalCountryCode: z.coerce.number().min(1, 'Choose Country Phone Prefix'),
	professionalPhone: z.string().nonempty("Insert Professional Contact Phone"),
	resort: z.coerce.number().min(1, "Choose the Resort where you teach"),
	sports: z.array(z.number()).min(1, 'Select at least one sport'),
	profileImage: imageFileSchema,
	qualification: documentFileSchema
});

export type InstructorSignupSchema = typeof instructorSignupSchema;
export type InstructorProfileSchema = typeof instructorProfileSchema;

// Form submission data types
export interface InstructorSignupData {
	userId: number;
	resort: number;
	instructorType: 'instructor-independent' | 'instructor-school';
	profileImageUrl?: string | null;
	qualificationUrl?: string | null;
	professionalCountryCode: number;
	professionalPhone: string;
	bio?: string;
	sports: number[];
	basePrice: number;
	currency: string;
}

export interface InstructorProfileData {
	bio?: string;
	professionalCountryCode: number;
	professionalPhone: string;
	resort: number;
	sports: number[];
	profileImageUrl?: string | null;
	qualificationUrl?: string | null;
}