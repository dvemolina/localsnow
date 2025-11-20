import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SlotGenerationService } from '$src/features/Availability/lib/slotGenerationService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { LaunchCodeService } from '$src/features/LaunchCodes/lib/launchCodeService';
import { sendBookingNotificationToInstructor, sendBookingConfirmationToClient } from '$lib/server/webhooks/n8n/email-n8n';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover'
});

const launchCodeService = new LaunchCodeService();
const tentativeService = new TentativeBookingService();

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

        // ✅ VALIDATE LAUNCH CODE (if provided)
        const launchCode = data.launchCode?.trim();
        let isUsingLaunchCode = false;

        if (launchCode) {
            const validation = await launchCodeService.validateCode(launchCode);

            if (!validation.valid) {
                // Launch code provided but invalid - return error to user
                throw error(400, validation.error || 'Invalid launch code');
            }

            // Code is valid - will bypass payment
            isUsingLaunchCode = true;
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

        // ✅ BETA ACCESS PATH: Skip payment if using valid launch code
        if (isUsingLaunchCode && launchCode) {
            // Record code usage
            await launchCodeService.recordUsage(launchCode);

            // Update booking to track beta access
            await bookingService.updateBookingStatus(bookingRequest.id, 'pending');

            // Mark the booking as using a launch code (for analytics)
            const { db } = await import('$lib/server/db');
            const { bookingRequests } = await import('$lib/server/db/schema');
            const { eq } = await import('drizzle-orm');
            await db.update(bookingRequests)
                .set({ usedLaunchCode: launchCode.toUpperCase() })
                .where(eq(bookingRequests.id, bookingRequest.id));

            // Create tentative blocks (same as paid flow)
            try {
                await tentativeService.createTentativeBlock(bookingRequest.id, data.timeSlots);
            } catch (tentativeError) {
                // If slots were taken in race condition, mark booking as expired
                console.error('Failed to create tentative blocks:', tentativeError);
                await bookingService.updateBookingStatus(bookingRequest.id, 'expired');
                throw error(409, 'The selected time slots were just booked by another client. Please select different times.');
            }

            // Send notification emails (fire and forget - same as paid flow)
            const instructorService = (await import('$src/features/Instructors/lib/instructorService')).InstructorService;
            const instructor = await new instructorService().getInstructorById(instructorId);

            sendBookingNotificationToInstructor({
                instructorEmail: instructor?.email || '',
                instructorName: instructor?.name || '',
                bookingRequestId: bookingRequest.id,
                clientName: data.clientName,
                numberOfStudents: Number(data.numberOfStudents),
                startDate: startDate.toISOString(),
                endDate: endDate?.toISOString() || null,
                hoursPerDay: Number(data.hoursPerDay),
                estimatedPrice: data.estimatedPrice || 0,
                currency: data.currency || 'EUR',
                leadPrice: 5,
                paymentUrl: `/leads/payment/${bookingRequest.id}`,
                dashboardUrl: '/dashboard/bookings'
            }).catch(err => console.error('Email error:', err));

            sendBookingConfirmationToClient({
                clientEmail: data.clientEmail,
                clientName: data.clientName,
                instructorName: instructor?.name || '',
                numberOfStudents: Number(data.numberOfStudents),
                startDate: startDate.toISOString(),
                endDate: endDate?.toISOString() || null,
                hoursPerDay: Number(data.hoursPerDay),
                estimatedPrice: data.estimatedPrice || 0,
                currency: data.currency || 'EUR'
            }).catch(err => console.error('Email error:', err));

            // Return success without Stripe checkout
            return json({
                success: true,
                usedLaunchCode: true,
                bookingId: bookingRequest.id,
                message: 'Booking request created successfully with beta access!',
                redirectUrl: `/booking/booking-success?bookingId=${bookingRequest.id}`
            });
        }

        // ✅ NORMAL PAYMENT PATH: Create Stripe session
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