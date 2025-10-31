import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BookingPriceCalculator } from '$src/features/Pricing/lib/bookingPriceCalculator';
import { PricingService } from '$src/features/Pricing/lib/pricingService';

const pricingService = new PricingService();

export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        
        // Convert date strings to Date objects
        const startDate = new Date(data.startDate);
        const endDate = data.endDate ? new Date(data.endDate) : undefined;
        
        // Validate dates
        if (isNaN(startDate.getTime())) {
            return json({ error: 'Invalid start date' }, { status: 400 });
        }
        
        if (endDate && isNaN(endDate.getTime())) {
            return json({ error: 'Invalid end date' }, { status: 400 });
        }

        // Calculate number of days
        const numDays = endDate 
            ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 1;

        // Fetch pricing data for the lesson
        const pricingData = await pricingService.getLessonPricingData(data.lessonId);
        
        // Find promo code if provided
        let promoCode = null;
        if (data.promoCode) {
            promoCode = pricingData.promoCodes.find(
                p => p.code.toUpperCase() === data.promoCode.toUpperCase()
            );
        }

        // Create calculator with proper input structure
        const calculator = new BookingPriceCalculator({
            baseHourlyRate: data.basePrice,
            numStudents: data.numberOfStudents,
            hoursPerDay: data.hoursPerDay,
            numDays: numDays,
            durationPackages: pricingData.durationPackages,
            groupPricingTiers: pricingData.groupTiers,
            promoCode: promoCode || undefined
        });
        
        const result = calculator.calculate();

        // Format response to match what the frontend expects
        return json({
            totalPrice: result.finalPrice,
            pricePerPerson: Math.round(result.finalPrice / data.numberOfStudents),
            currency: data.currency,
            numberOfDays: numDays,
            regularPricePerDay: result.baseRate / numDays,
            promoDiscount: result.promoDiscount,
            breakdown: result.breakdown.map((desc, index) => ({
                description: desc,
                amount: index === 0 ? result.baseRate : 
                        result.appliedPackage ? -result.packageDiscount :
                        result.appliedTier ? -result.groupDiscount : 0,
                isDiscount: index > 0
            }))
        });
    } catch (error) {
        console.error('Error calculating price:', error);
        return json({ error: 'Failed to calculate price' }, { status: 500 });
    }
};