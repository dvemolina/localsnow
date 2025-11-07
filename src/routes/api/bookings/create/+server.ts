import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SlotGenerationService } from '$src/features/Availability/lib/slotGenerationService';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover'
});

export const POST: RequestHandler = async ({ request, url }) => {
    try {
        const data = await request.json();
        
        const instructorId = Number(data.instructorId);
        
        if (isNaN(instructorId)) {
            throw error(400, 'Invalid instructor ID');
        }
        
        // Validate required fields
        if (!data.clientName || !data.clientEmail || !data.startDate || 
            !data.skillLevel || !data.numberOfStudents || !data.hoursPerDay) {
            throw error(400, 'Missing required fields');
        }

        if (!data.timeSlots || !Array.isArray(data.timeSlots) || data.timeSlots.length === 0) {
            throw error(400, 'Please select at least one time slot');
        }

        // Parse dates
        const startDate = new Date(data.startDate);
        const endDate = data.endDate ? new Date(data.endDate) : null;

        // ✅ CRITICAL: Validate availability BEFORE creating payment session
        const slotService = new SlotGenerationService();
        const availability = await slotService.generateSlotsForDateRange(
            instructorId,
            startDate,
            endDate || startDate,
            60
        );

        // Check if all requested slots are available
        const currentDate = new Date(startDate);
        const finalDate = endDate || startDate;

        while (currentDate <= finalDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayAvailability = availability.find(a => a.date === dateStr);

            if (!dayAvailability || !dayAvailability.isWorkingDay) {
                throw error(409, 'Selected dates include non-working days');
            }

            for (const timeSlot of data.timeSlots) {
                const slot = dayAvailability.slots.find(
                    (s: any) => s.startTime === timeSlot && s.status === 'available'
                );
                
                if (!slot) {
                    throw error(409, `Time slot ${timeSlot} is no longer available on ${dateStr}`);
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // ✅ CREATE BOOKING FIRST (get booking ID)
        const bookingService = new BookingRequestService();
        const bookingRequest = await bookingService.createBookingRequest({
            instructorId,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone || null,
            clientCountryCode: String(data.clientCountryCode),
            numberOfStudents: Number(data.numberOfStudents),
            startDate,
            endDate,
            hoursPerDay: Number(data.hoursPerDay),
            timeSlots: data.timeSlots,
            skillLevel: data.skillLevel,
            message: data.message || null,
            promoCode: data.promoCode || null,
            estimatedPrice: data.estimatedPrice || null,
            currency: data.currency || null,
            sports: data.sports || []
        });

        // ✅ Create Stripe session with minimal metadata (just booking ID)
        const baseUrl = url.origin;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Booking Request Deposit',
                        description: '€15 refundable deposit',
                    },
                    unit_amount: 1500,
                },
                quantity: 1,
            }],
            mode: 'payment',
            payment_intent_data: {
                capture_method: 'manual',
                metadata: {
                    type: 'client_deposit',
                    bookingRequestId: bookingRequest.id.toString()
                }
            },
            success_url: `${baseUrl}/api/bookings/webhooks/deposit-paid?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/booking-request-cancelled?bookingId=${bookingRequest.id}`,
            customer_email: data.clientEmail,
            metadata: {
                type: 'client_deposit',
                bookingRequestId: bookingRequest.id.toString()
            }
        });

        return json({ 
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id,
            message: 'Redirecting to payment...'
        });
    } catch (err) {
        console.error('Error creating booking checkout:', err);
        
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        
        throw error(500, 'Failed to create booking checkout');
    }
};