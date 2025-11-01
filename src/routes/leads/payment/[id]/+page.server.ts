// src/routes/leads/payment/[id]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
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
        throw redirect(302, `/auth/login?redirect=/leads/payment/${params.id}`);
    }

    const bookingRequestId = Number(params.id);
    
    if (isNaN(bookingRequestId)) {
        throw error(404, 'Booking request not found');
    }

    try {
        // Get booking request (without contact info)
        const bookingRequest = await bookingService.getBookingRequestById(bookingRequestId);
        
        if (!bookingRequest) {
            throw error(404, 'Booking request not found');
        }

        // Verify user is the instructor for this booking
        if (bookingRequest.instructorId !== user.id) {
            throw error(403, 'Unauthorized');
        }

        // Check if already paid
        const hasPaid = await paymentService.hasInstructorPaidForLead(bookingRequestId, user.id);
        
        if (hasPaid) {
            // Redirect to the success page if already paid
            throw redirect(302, `/leads/payment/${bookingRequestId}/success`);
        }

        // Get instructor details
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
            leadPrice: 5 // €5 per lead
        };
    } catch (err) {
        if (err instanceof Response) throw err;
        console.error('Error loading payment page:', err);
        throw error(500, 'Failed to load payment information');
    }
};

export const actions: Actions = {
    createCheckout: async ({ params, locals, url }) => {
        const user = locals.user;
        
        if (!user) {
            throw redirect(302, `/auth/login?redirect=/leads/payment/${params.id}`);
        }

        const bookingRequestId = Number(params.id);
        
        try {
            const baseUrl = url.origin;
            const successUrl = `${baseUrl}/leads/payment/${bookingRequestId}/success`;
            const cancelUrl = `${baseUrl}/leads/payment/${bookingRequestId}`;

            const session = await paymentService.createCheckoutSession(
                bookingRequestId,
                user.id,
                successUrl,
                cancelUrl
            );

            if (session.url) {
                throw redirect(303, session.url);
            }

            throw error(500, 'Failed to create checkout session');
        } catch (err) {
            if (err instanceof Response) throw err;
            console.error('Error creating checkout:', err);
            throw error(500, 'Failed to initiate payment');
        }
    }
};