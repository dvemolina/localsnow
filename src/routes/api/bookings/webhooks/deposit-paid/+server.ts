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
    apiVersion: '2025-10-29.clover'
});

const bookingService = new BookingRequestService();
const tentativeService = new TentativeBookingService();
const depositService = new ClientDepositService();
const instructorService = new InstructorService();

export const GET: RequestHandler = async ({ url }) => {
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        redirect(303, '/booking/booking-error?reason=no_session');
    }

    let session: Stripe.Checkout.Session;
    let booking: any;
    let deposit: any;

    // ✅ Retrieve and validate Stripe session
    try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        if (session.payment_status !== 'paid') {
            redirect(303, '/booking/booking-error?reason=payment_failed');
        }

        const metadata = (session.payment_intent as Stripe.PaymentIntent)?.metadata;
        const bookingRequestId = parseInt(metadata?.bookingRequestId || '0');

        if (!bookingRequestId) {
            redirect(303, '/booking/booking-error?reason=invalid_session');
        }

        // ✅ Get booking data from database
        booking = await bookingService.getBookingRequestById(bookingRequestId);

        if (!booking) {
            redirect(303, '/booking/booking-error?reason=booking_not_found');
        }
    } catch (error) {
        // ⚠️ CRITICAL: Re-throw redirects, don't catch them!
        if (error instanceof Response) {
            throw error;
        }
        console.error('Error retrieving session or booking:', error);
        redirect(303, '/booking/booking-error?reason=processing_error');
    }

    // ✅ Create deposit record
    try {
        deposit = await depositService.createHeldDeposit(
            booking.id,
            booking.clientEmail,
            (session.payment_intent as Stripe.PaymentIntent).id
        );
    } catch (error) {
        // ⚠️ Re-throw redirects
        if (error instanceof Response) {
            throw error;
        }
        console.error('Error creating deposit:', error);
        redirect(303, '/booking/booking-error?reason=processing_error');
    }

    // ✅ Create tentative blocks with race condition protection
    const timeSlots = booking.timeSlots ? JSON.parse(booking.timeSlots) : [];
    
    try {
        await tentativeService.createTentativeBlock(booking.id, timeSlots);
    } catch (tentativeError) {
        // ⚠️ Re-throw redirects
        if (tentativeError instanceof Response) {
            throw tentativeError;
        }
        console.error('Race condition detected:', tentativeError);
        
        // Cleanup: refund deposit and mark booking as expired
        try {
            await depositService.refundDeposit(deposit.id, 'slots_no_longer_available');
            await bookingService.updateBookingStatus(booking.id, 'expired');
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
        
        redirect(303, '/booking/booking-error?reason=slots_taken');
    }

    // ✅ Send notification emails (fire and forget - don't block on email errors)
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

    // ✅ Success - redirect (not in try-catch)
    redirect(303, `/booking/booking-success?bookingId=${booking.id}`);
};