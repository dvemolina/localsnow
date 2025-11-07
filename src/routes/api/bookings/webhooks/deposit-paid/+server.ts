import { redirect } from '@sveltejs/kit';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { sendBookingNotificationToInstructor, sendBookingConfirmationToClient } from '$src/lib/server/webhooks/n8n/email-n8n';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia'
});

const bookingService = new BookingRequestService();
const tentativeService = new TentativeBookingService();
const depositService = new ClientDepositService();
const instructorService = new InstructorService();

export const GET: RequestHandler = async ({ url }) => {
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        throw redirect(303, '/booking/booking-error?reason=no_session');
    }

    try {
        // Retrieve Stripe session
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        if (session.payment_status !== 'paid') {
            throw redirect(303, '/booking/booking-error?reason=payment_failed');
        }

        const metadata = (session.payment_intent as Stripe.PaymentIntent)?.metadata;
        if (!metadata || metadata.type !== 'client_deposit') {
            throw redirect(303, '/booking/booking-error?reason=invalid_session');
        }

        // ✅ Parse booking data from metadata
        const bookingData = {
            instructorId: parseInt(metadata.instructorId),
            clientName: metadata.clientName,
            clientEmail: metadata.clientEmail,
            clientPhone: metadata.clientPhone || null,
            clientCountryCode: metadata.clientCountryCode,
            numberOfStudents: parseInt(metadata.numberOfStudents),
            startDate: new Date(metadata.startDate),
            endDate: metadata.endDate ? new Date(metadata.endDate) : null,
            hoursPerDay: parseFloat(metadata.hoursPerDay),
            skillLevel: metadata.skillLevel,
            message: metadata.message || null,
            promoCode: metadata.promoCode || null,
            estimatedPrice: parseFloat(metadata.estimatedPrice) || null,
            currency: metadata.currency || null,
            sports: JSON.parse(metadata.sports || '[]')
        };

        const timeSlots = JSON.parse(metadata.timeSlots || '[]');

        // ✅ NOW create booking in database
        const bookingRequest = await bookingService.createBookingRequest(bookingData);

        // ✅ Create deposit record
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        const deposit = await depositService.repository.createDeposit({
            bookingRequestId: bookingRequest.id,
            clientEmail: metadata.clientEmail,
            amount: '15',
            currency: 'eur',
            expiresAt
        });

        // Update with payment intent ID
        await depositService.repository.updateDepositStatus(deposit.id, 'held', {
            stripePaymentIntentId: (session.payment_intent as Stripe.PaymentIntent).id
        });

        // ✅ Create tentative blocks (with race condition protection)
        try {
            await tentativeService.createTentativeBlock(bookingRequest.id, timeSlots);
        } catch (tentativeError) {
            console.error('Race condition: Slots taken between payment and block creation', tentativeError);
            
            // Refund deposit immediately
            await depositService.refundDeposit(deposit.id, 'slots_no_longer_available');
            
            // Mark booking as expired
            await bookingService.updateBookingStatus(bookingRequest.id, 'expired');
            
            throw redirect(303, '/booking/booking-error?reason=slots_taken');
        }

        // ✅ Send notification emails
        const instructorData = await instructorService.getInstructorWithLessons(bookingData.instructorId);
        
        if (instructorData?.instructor?.email) {
            const baseUrl = url.origin;
            sendBookingNotificationToInstructor({
                instructorEmail: instructorData.instructor.email,
                instructorName: instructorData.instructor.name,
                bookingRequestId: bookingRequest.id,
                clientName: metadata.clientName,
                numberOfStudents: parseInt(metadata.numberOfStudents),
                startDate: metadata.startDate,
                leadPrice: 5,
                paymentUrl: `${baseUrl}/leads/payment/${bookingRequest.id}`
            }).catch(err => console.error('Email error:', err));
        }

        sendBookingConfirmationToClient({
            clientEmail: metadata.clientEmail,
            clientName: metadata.clientName,
            instructorName: instructorData?.instructor?.name || 'Your instructor',
            numberOfStudents: parseInt(metadata.numberOfStudents),
            startDate: metadata.startDate,
            endDate: metadata.endDate || undefined,
            hoursPerDay: parseFloat(metadata.hoursPerDay),
            estimatedPrice: parseFloat(metadata.estimatedPrice) || undefined,
            currency: metadata.currency || undefined
        }).catch(err => console.error('Email error:', err));

        // ✅ Redirect to success
        throw redirect(303, `/booking/booking-success?bookingId=${bookingRequest.id}`);
    } catch (error) {
        console.error('Error in deposit webhook:', error);
        
        // Re-throw redirects
        if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
            throw error;
        }
        
        throw redirect(303, '/booking/booking-error?reason=processing_error');
    }
};