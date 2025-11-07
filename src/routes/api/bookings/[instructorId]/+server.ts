import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SlotGenerationService } from '$src/features/Availability/lib/slotGenerationService';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia'
});

export const POST: RequestHandler = async ({ request, params, url }) => {
    const instructorId = Number(params.instructorId);
    
    if (isNaN(instructorId)) {
        throw error(400, 'Invalid instructor ID');
    }

    try {
        const data = await request.json();
        
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

        // ✅ Create Stripe Checkout Session (store booking data in metadata)
        const baseUrl = url.origin;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Booking Request Deposit',
                        description: '€15 refundable deposit - automatically refunded if no instructor accepts within 48h',
                    },
                    unit_amount: 1500, // €15
                },
                quantity: 1,
            }],
            mode: 'payment',
            payment_intent_data: {
                capture_method: 'manual', // Hold funds, don't capture yet
                metadata: {
                    type: 'client_deposit',
                    // Store ALL booking data
                    instructorId: instructorId.toString(),
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone || '',
                    clientCountryCode: String(data.clientCountryCode),
                    numberOfStudents: String(data.numberOfStudents),
                    startDate: startDate.toISOString(),
                    endDate: endDate?.toISOString() || '',
                    hoursPerDay: String(data.hoursPerDay),
                    timeSlots: JSON.stringify(data.timeSlots),
                    skillLevel: data.skillLevel,
                    message: data.message || '',
                    promoCode: data.promoCode || '',
                    estimatedPrice: String(data.estimatedPrice || 0),
                    currency: data.currency || 'EUR',
                    sports: JSON.stringify(data.sports || [])
                }
            },
            success_url: `${baseUrl}/api/bookings/webhooks/deposit-paid?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/booking-request-cancelled`,
            customer_email: data.clientEmail,
            metadata: {
                type: 'client_deposit',
                instructorId: instructorId.toString()
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