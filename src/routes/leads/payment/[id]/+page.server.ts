// src/routes/leads/payment/[id]/+page.server.ts
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { LeadPaymentService } from '$src/features/Bookings/lib/leadPaymentService';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';

const bookingService = new BookingRequestService();
const paymentService = new LeadPaymentService();
const instructorService = new InstructorService();

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
    }
};