import { z } from 'zod';

// File size constants (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Helper function to validate image files
const imageFileSchema = z
	.instanceof(File)
	.optional()
	.refine(
		(file) => {
			if (!file) return true; // Allow undefined/null
			return file.size <= MAX_IMAGE_SIZE;
		},
		{ message: `Image must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB` }
	)
	.refine(
		(file) => {
			if (!file) return true; // Allow undefined/null
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
			if (!file) return true; // Allow undefined/null
			return file.size <= MAX_DOCUMENT_SIZE;
		},
		{ message: `Document must be less than ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB` }
	)
	.refine(
		(file) => {
			if (!file) return true; // Allow undefined/null
			return ALLOWED_DOCUMENT_TYPES.includes(file.type);
		},
		{ message: 'Only PDF and Word documents are allowed' }
	);

// Instructor profile schema
export const instructorProfileSchema = z.object({
	firstName: z.string().min(2, 'First name must be at least 2 characters'),
	lastName: z.string().min(2, 'Last name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	phone: z.string().min(10, 'Phone number must be at least 10 digits'),
	bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must not exceed 1000 characters'),
	profileImage: imageFileSchema,
	specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
	yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be 0 or greater'),
	certifications: z.array(z.string()).optional(),
	languages: z.array(z.string()).min(1, 'Select at least one language')
});

export type InstructorProfileFormData = z.infer<typeof instructorProfileSchema>;

// Instructor certification schema
export const instructorCertificationSchema = z.object({
	certificationName: z.string().min(2, 'Certification name is required'),
	issuingOrganization: z.string().min(2, 'Issuing organization is required'),
	issueDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
	expiryDate: z
		.string()
		.optional()
		.refine((date) => !date || !isNaN(Date.parse(date)), 'Invalid date'),
	certificationNumber: z.string().optional(),
	certificationDocument: documentFileSchema
});

export type InstructorCertificationFormData = z.infer<typeof instructorCertificationSchema>;

// Instructor availability schema
export const instructorAvailabilitySchema = z.object({
	dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
	startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
	endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
	isRecurring: z.boolean().default(true)
});

export type InstructorAvailabilityFormData = z.infer<typeof instructorAvailabilitySchema>;

// Instructor lesson rate schema
export const instructorLessonRateSchema = z.object({
	lessonType: z.enum(['private', 'group', 'kids', 'advanced']),
	duration: z.coerce.number().min(30, 'Duration must be at least 30 minutes').max(480, 'Duration cannot exceed 8 hours'),
	rate: z.coerce.number().min(1, 'Rate must be greater than 0'),
	currency: z.string().default('USD'),
	maxStudents: z.coerce.number().optional()
});

export type InstructorLessonRateFormData = z.infer<typeof instructorLessonRateSchema>;

// Instructor equipment schema
export const instructorEquipmentSchema = z.object({
	equipmentType: z.string().min(2, 'Equipment type is required'),
	brand: z.string().optional(),
	model: z.string().optional(),
	size: z.string().optional(),
	condition: z.enum(['new', 'excellent', 'good', 'fair']),
	availableForRental: z.boolean().default(false),
	rentalRate: z.coerce.number().optional(),
	notes: z.string().optional()
});

export type InstructorEquipmentFormData = z.infer<typeof instructorEquipmentSchema>;

// Settings schema
export const instructorSettingsSchema = z.object({
	emailNotifications: z.boolean().default(true),
	smsNotifications: z.boolean().default(false),
	bookingReminders: z.boolean().default(true),
	marketingEmails: z.boolean().default(false),
	autoAcceptBookings: z.boolean().default(false),
	bookingLeadTime: z.coerce.number().min(0, 'Lead time must be 0 or greater'),
	cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']),
	maxDailyLessons: z.coerce.number().min(1, 'Must allow at least 1 lesson per day').max(20, 'Cannot exceed 20 lessons per day')
});

export type InstructorSettingsFormData = z.infer<typeof instructorSettingsSchema>;

// Stripe onboarding schema
export const stripeOnboardingSchema = z.object({
	hasCompletedOnboarding: z.boolean(),
	stripeAccountId: z.string().optional(),
	onboardingUrl: z.string().url().optional()
});

export type StripeOnboardingFormData = z.infer<typeof stripeOnboardingSchema>;