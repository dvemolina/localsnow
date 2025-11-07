import { redirect } from '@sveltejs/kit';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';
import { ClientDepositService } from '$src/features/Bookings/lib/clientDepositService';
import { ClientDepositRepository } from '$src/features/Bookings/lib/clientDepositRepository';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { sendBookingNotificationToInstructor, sendBookingConfirmationToClient } from '$src/lib/server/webhooks/n8n/email-n8n';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover'
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
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        if (session.payment_status !== 'paid') {
            throw redirect(303, '/booking/booking-error?reason=payment_failed');
        }

        const metadata = (session.payment_intent as Stripe.PaymentIntent)?.metadata;
        const bookingRequestId = parseInt(metadata?.bookingRequestId || '0');

        if (!bookingRequestId) {
            throw redirect(303, '/booking/booking-error?reason=invalid_session');
        }

        // ✅ Get booking data from database (not metadata)
        const booking = await bookingService.getBookingRequestById(bookingRequestId);

        if (!booking) {
            throw redirect(303, '/booking/booking-error?reason=booking_not_found');
        }

        // Get time slots from database
        const timeSlots = booking.timeSlots ? JSON.parse(booking.timeSlots) : [];

        // ✅ Create deposit record using repository directly (since repository is private)
        const depositRepo = new ClientDepositRepository();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        const deposit = await depositRepo.createDeposit({
            bookingRequestId: booking.id,
            clientEmail: booking.clientEmail,
            amount: '15',
            currency: 'eur',
            expiresAt
        });

        await depositRepo.updateDepositStatus(deposit.id, 'held', {
            stripePaymentIntentId: (session.payment_intent as Stripe.PaymentIntent).id
        });

        // ✅ Create tentative blocks with race condition protection
        try {
            await tentativeService.createTentativeBlock(booking.id, timeSlots);
        } catch (tentativeError) {
            console.error('Race condition detected:', tentativeError);
            
            // Refund deposit immediately
            await depositService.refundDeposit(deposit.id, 'slots_no_longer_available');
            
            // Mark booking as expired
            await bookingService.updateBookingStatus(booking.id, 'expired');
            
            throw redirect(303, '/booking/booking-error?reason=slots_taken');
        }

        // ✅ Send notification emails using booking data from database
        const instructorData = await instructorService.getInstructorWithLessons(booking.instructorId);
        
        if (instructorData?.instructor?.email) {
            const baseUrl = url.origin;
            sendBookingNotificationToInstructor({
                instructorEmail: instructorData.instructor.email,
                instructorName: instructorData.instructor.name,
                bookingRequestId: booking.id,
                clientName: booking.clientName,
                numberOfStudents: booking.numberOfStudents,
                startDate: booking.startDate.toISOString(),
                endDate: booking.endDate?.toISOString(),
                hoursPerDay: Number(booking.hoursPerDay),
                estimatedPrice: booking.estimatedPrice || undefined,
                currency: booking.currency || undefined,
                leadPrice: 5,
                paymentUrl: `${baseUrl}/leads/payment/${booking.id}`
            }).catch(err => console.error('Email error:', err));
        }

        sendBookingConfirmationToClient({
            clientEmail: booking.clientEmail,
            clientName: booking.clientName,
            instructorName: instructorData?.instructor?.name || 'Your instructor',
            numberOfStudents: booking.numberOfStudents,
            startDate: booking.startDate.toISOString(),
            endDate: booking.endDate?.toISOString(),
            hoursPerDay: Number(booking.hoursPerDay),
            estimatedPrice: booking.estimatedPrice || undefined,
            currency: booking.currency || undefined
        }).catch(err => console.error('Email error:', err));

        // ✅ Redirect to success
        throw redirect(303, `/booking/booking-success?bookingId=${booking.id}`);
    } catch (error) {
        console.error('Error in deposit webhook:', error);
        
        // Re-throw redirects
        if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
            throw error;
        }
        
        throw redirect(303, '/booking/booking-error?reason=processing_error');
    }
};