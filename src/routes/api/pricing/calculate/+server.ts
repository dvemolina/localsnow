import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BookingPriceCalculator } from '$src/features/Pricing/lib/bookingPriceCalculator';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        
        const calculator = new BookingPriceCalculator();
        const priceBreakdown = await calculator.calculateBookingPrice({
            lessonId: data.lessonId,
            basePrice: data.basePrice,
            currency: data.currency,
            numberOfStudents: data.numberOfStudents,
            startDate: data.startDate,
            endDate: data.endDate,
            hoursPerDay: data.hoursPerDay,
            promoCode: data.promoCode
        });

        return json(priceBreakdown);
    } catch (error) {
        console.error('Error calculating price:', error);
        return json({ error: 'Failed to calculate price' }, { status: 500 });
    }
};