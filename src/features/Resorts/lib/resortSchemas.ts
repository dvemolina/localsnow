import { z } from "zod";

export const heroResortSearchSchema = z.object({
    resort: z.number().optional(),
    sport: z.string().optional()
})

export const resortRequestSchema = z.object({
    resortName: z.string().min(2, 'Resort name must be at least 2 characters').max(100, 'Resort name is too long'),
    countryId: z.number({ required_error: 'Please select a country' }).int().positive(),
    regionId: z.number().int().positive().optional().nullable(),
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    additionalInfo: z.string().max(500, 'Additional information is too long').optional()
})