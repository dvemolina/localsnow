import { z } from 'zod';

export const bookingRequestSchema = z.object({
    instructorId: z.number().int().positive(),
    clientName: z.string().min(1, "Name is required"),
    clientEmail: z.string().email("Valid email is required"),
    clientPhone: z.string().optional(),
    
    // Lesson details
    numberOfStudents: z.coerce.number().int().min(1).max(20),
    startDate: z.string().min(1, "Start date is required"), // ISO date string
    endDate: z.string().optional(), // ISO date string for multi-day bookings
    hoursPerDay: z.coerce.number().min(0.5).max(12),
    
    // Additional info
    sports: z.array(z.number().int().positive()).min(1, "Select at least one sport"),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    message: z.string().optional(),
    
    // Pricing
    promoCode: z.string().optional(),
});

export type BookingRequestSchema = z.infer<typeof bookingRequestSchema>;