import { z } from 'zod';

export const submitReviewSchema = z.object({
	bookingRequestId: z.number().int().positive(),
	rating: z.number().int().min(1).max(5),
	comment: z.string().max(1000).optional(),
	clientEmail: z.string().email()
});

export const reviewQuerySchema = z.object({
	instructorId: z.number().int().positive().optional(),
	bookingRequestId: z.number().int().positive().optional(),
	limit: z.number().int().min(1).max(100).default(10).optional(),
	offset: z.number().int().min(0).default(0).optional()
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
