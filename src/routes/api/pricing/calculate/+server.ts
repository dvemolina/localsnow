import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BookingPriceCalculator } from '$src/features/Pricing/lib/bookingPriceCalculator';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        
        const calculator = new BookingPriceCalculator();
        
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
        
        const result = await calculator.calculateBookingPrice({
            lessonId: data.lessonId,
            basePrice: data.basePrice,
            currency: data.currency,
            numberOfStudents: data.numberOfStudents,
            startDate: startDate,
            endDate: endDate,
            hoursPerDay: data.hoursPerDay,
            promoCode: data.promoCode
        });

        return json(result);
    } catch (error) {
        console.error('Error calculating price:', error);
        return json({ error: 'Failed to calculate price' }, { status: 500 });
    }
};