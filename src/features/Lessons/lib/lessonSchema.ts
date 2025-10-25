import { z } from "zod";

// Simplified pricing structure for MVP
export const lessonSchema = z.object({
    // Base hourly rate (for 1-2 people by default)
    basePrice: z.coerce.number().int().nonnegative(),
    currency: z.string().min(1).max(50),
    
    // Sports taught
    sports: z.array(z.number().int().positive()).min(1, "Select at least one sport"),
    
    // Optional fields
    instructorId: z.number().int().positive().nullable().optional(),
    schoolId: z.number().int().positive().nullable().optional(),
    isPublished: z.boolean().optional(),
    isBaseLesson: z.boolean().optional(),
});

// Group pricing tier schema - for discounts based on group size
export const groupPricingTierSchema = z.object({
    minStudents: z.coerce.number().int().min(1),
    maxStudents: z.coerce.number().int().min(1),
    pricePerHour: z.coerce.number().int().nonnegative(),
});

// Duration package schema (for half-day/full-day pricing)
export const durationPackageSchema = z.object({
    name: z.string(), // e.g., "Half Day", "Full Day"
    hours: z.coerce.number().min(1),
    price: z.coerce.number().int().nonnegative(),
    description: z.string().optional(),
});

// Promo code schema - simplified
export const promoCodeSchema = z.object({
    code: z.string().min(3).max(50),
    discountPercent: z.coerce.number().min(1).max(100),
    validUntil: z.string().optional(), // ISO date string
    maxUses: z.coerce.number().int().optional(),
});

// Update Lesson Schema
export const lessonUpdateSchema = lessonSchema.partial();

// Infer TypeScript types
export type LessonSchema = z.infer<typeof lessonSchema>;
export type GroupPricingTier = z.infer<typeof groupPricingTierSchema>;
export type DurationPackage = z.infer<typeof durationPackageSchema>;
export type PromoCode = z.infer<typeof promoCodeSchema>;
export type LessonUpdateData = z.infer<typeof lessonUpdateSchema>;

// Type for lesson data to be saved
export type LessonData = Omit<LessonSchema, 'sports'>;

// Type for lesson with full pricing loaded from database
export type LessonWithPricing = LessonData & {
    id: number;
    sports: number[];
    groupTiers?: GroupPricingTier[];
    durationPackages?: DurationPackage[];
    promoCodes?: PromoCode[];
};