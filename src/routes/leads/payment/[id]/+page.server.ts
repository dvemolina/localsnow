// src/routes/leads/payment/[id]/+page.server.ts
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { LeadPaymentService } from '$src/features/Bookings/lib/leadPaymentService';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { PromoCodeService } from '$src/features/PromoCodes/lib/promoCodeService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';
import { sendContactInfoToInstructor } from '$lib/server/webhooks/n8n/email-n8n';
import { db } from '$lib/server/db';
import { bookingRequests, leadPayments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const bookingService = new BookingRequestService();
const paymentService = new LeadPaymentService();
const instructorService = new InstructorService();
const promoCodeService = new PromoCodeService();
const tentativeService = new TentativeBookingService();

export const load: PageServerLoad = async ({ params, locals }) => {
    const user = locals.user;
    
    if (!user) {
        redirect(302, `/auth/login?redirect=/leads/payment/${params.id}`);
    }

    const bookingRequestId = Number(params.id);
    
    if (isNaN(bookingRequestId)) {
        error(404, 'Booking request not found');
    }

    const bookingRequest = await bookingService.getBookingRequestById(bookingRequestId);
    
    if (!bookingRequest) {
        error(404, 'Booking request not found');
    }

    if (bookingRequest.instructorId !== user.id) {
        error(403, 'Unauthorized');
    }

    const hasPaid = await paymentService.hasInstructorPaidForLead(bookingRequestId, user.id);
    
    if (hasPaid) {
        redirect(302, `/leads/payment/${bookingRequestId}/success`);
    }

    const instructorData = await instructorService.getInstructorWithLessons(user.id);

    return {
        bookingRequest: {
            id: bookingRequest.id,
            clientName: bookingRequest.clientName,
            numberOfStudents: bookingRequest.numberOfStudents,
            startDate: bookingRequest.startDate,
            endDate: bookingRequest.endDate,
            hoursPerDay: bookingRequest.hoursPerDay,
            skillLevel: bookingRequest.skillLevel,
            estimatedPrice: bookingRequest.estimatedPrice,
            currency: bookingRequest.currency,
            message: bookingRequest.message
        },
        instructor: instructorData?.instructor,
        leadPrice: 5
    };
};

export const actions: Actions = {
    createCheckout: async ({ params, locals, url }) => {
        const user = locals.user;

        if (!user) {
            redirect(302, `/auth/login?redirect=/leads/payment/${params.id}`);
        }

        const bookingRequestId = Number(params.id);

        if (isNaN(bookingRequestId)) {
            return fail(400, { message: 'Invalid booking request ID' });
        }

        const baseUrl = url.origin;
        const successUrl = `${baseUrl}/leads/payment/${bookingRequestId}/success`;
        const cancelUrl = `${baseUrl}/leads/payment/${bookingRequestId}`;

        let session;

        try {
            session = await paymentService.createCheckoutSession(
                bookingRequestId,
                user.id,
                successUrl,
                cancelUrl
            );
        } catch (err) {
            console.error('Error creating Stripe checkout session:', err);
            return fail(500, {
                message: 'Payment system is temporarily unavailable. Please try again in a few moments.'
            });
        }

        if (!session?.url) {
            console.error('Stripe checkout session created but no URL returned');
            return fail(500, { message: 'Failed to create checkout session' });
        }

        // ✅ Call redirect OUTSIDE the try-catch block
        redirect(303, session.url);
    },

    usePromoCode: async ({ params, locals, request }) => {
        const user = locals.user;

        if (!user) {
            redirect(302, `/auth/login?redirect=/leads/payment/${params.id}`);
        }

        const bookingRequestId = Number(params.id);

        if (isNaN(bookingRequestId)) {
            return fail(400, { message: 'Invalid booking request ID' });
        }

        const formData = await request.formData();
        const promoCode = formData.get('promoCode')?.toString().trim();

        if (!promoCode) {
            return fail(400, { message: 'Please enter a promo code', field: 'promoCode' });
        }

        // Validate promo code (checks both launch codes and future promotions)
        const validation = await promoCodeService.validateCode(promoCode);

        if (!validation.valid) {
            return fail(400, {
                message: validation.error || 'Invalid promo code',
                field: 'promoCode'
            });
        }

        // Get booking request
        const bookingRequest = await bookingService.getBookingRequestById(bookingRequestId);

        if (!bookingRequest) {
            return fail(404, { message: 'Booking request not found' });
        }

        if (bookingRequest.instructorId !== user.id) {
            return fail(403, { message: 'Unauthorized' });
        }

        try {
            // Record code usage
            await promoCodeService.recordUsage(promoCode);

            // Create a lead payment record for tracking (status: paid, free with promo)
            await db.insert(leadPayments).values({
                bookingRequestId,
                instructorId: user.id,
                amount: '0.00',
                currency: 'EUR',
                status: 'paid', // Mark as paid since it's free
                usedLaunchCode: promoCode.toUpperCase(), // Still stored in usedLaunchCode field for compatibility
                paidAt: new Date()
            });

            // Unlock contact info
            await db.update(bookingRequests)
                .set({ contactInfoUnlocked: true })
                .where(eq(bookingRequests.id, bookingRequestId));

            // Auto-accept booking
            await bookingService.updateBookingStatus(bookingRequestId, 'accepted');

            // Convert tentative blocks to confirmed
            await tentativeService.convertTentativeToConfirmed(bookingRequestId);

            // Get instructor sports for email
            const sports = await bookingService.getBookingRequestSports(bookingRequestId);
            const sportNames = await Promise.all(
                sports.map(async (sportId) => {
                    const { sports: sportsTable } = await import('$lib/server/db/schema');
                    const result = await db.select().from(sportsTable).where(eq(sportsTable.id, sportId));
                    return result[0]?.sport || 'Unknown';
                })
            );

            // Send contact info email to instructor
            sendContactInfoToInstructor({
                instructorEmail: user.email,
                instructorName: user.name,
                clientName: bookingRequest.clientName,
                clientEmail: bookingRequest.clientEmail,
                clientPhone: bookingRequest.clientPhone || '',
                clientCountryCode: bookingRequest.clientCountryCode || '',
                numberOfStudents: bookingRequest.numberOfStudents,
                startDate: bookingRequest.startDate.toISOString(),
                endDate: bookingRequest.endDate?.toISOString() || null,
                hoursPerDay: Number(bookingRequest.hoursPerDay),
                sports: sportNames,
                skillLevel: bookingRequest.skillLevel || '',
                message: bookingRequest.message || '',
                estimatedPrice: bookingRequest.estimatedPrice || 0,
                currency: bookingRequest.currency || 'EUR'
            }).catch(err => console.error('Email error:', err));
        } catch (err) {
            console.error('Error using promo code:', err);
            return fail(500, {
                message: 'Failed to process promo code. Please try again.',
                field: 'promoCode'
            });
        }

        // Redirect OUTSIDE try-catch to avoid catching the redirect exception
        redirect(303, `/leads/payment/${bookingRequestId}/success?usedBetaCode=true`);
    }
};