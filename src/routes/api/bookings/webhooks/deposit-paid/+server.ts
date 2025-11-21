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
    let sessionError: string | null = null;
    let depositError = false;
    let tentativeError = false;

    // ✅ Retrieve and validate Stripe session
    try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        // For manual capture, check if session is complete AND has payment_intent
        const paymentIntent = session.payment_intent as Stripe.PaymentIntent;

        if (session.status !== 'complete' || !paymentIntent) {
            sessionError = 'payment_failed';
        } else if (paymentIntent.status !== 'requires_capture' && paymentIntent.status !== 'succeeded') {
            sessionError = 'payment_failed';
        } else {
            const metadata = paymentIntent.metadata;
            const bookingRequestId = parseInt(metadata?.bookingRequestId || '0');

            if (!bookingRequestId) {
                sessionError = 'invalid_session';
            } else {
                // ✅ Get booking data from database
                booking = await bookingService.getBookingRequestById(bookingRequestId);

                if (!booking) {
                    sessionError = 'booking_not_found';
                }
            }
        }
    } catch (error) {
        console.error('Error retrieving session or booking:', error);
        sessionError = 'processing_error';
    }

    // Redirect OUTSIDE try-catch if session validation failed
    if (sessionError) {
        redirect(303, `/booking/booking-error?reason=${sessionError}`);
    }

    // ✅ Create deposit record
    try {
        deposit = await depositService.createHeldDeposit(
            booking.id,
            booking.clientEmail,
            (session.payment_intent as Stripe.PaymentIntent).id
        );
    } catch (error) {
        console.error('Error creating deposit:', error);
        depositError = true;
    }

    // Redirect OUTSIDE try-catch if deposit creation failed
    if (depositError) {
        redirect(303, '/booking/booking-error?reason=processing_error');
    }

    // ✅ Create tentative blocks with race condition protection
    const timeSlots = booking.timeSlots ? JSON.parse(booking.timeSlots) : [];

    try {
        await tentativeService.createTentativeBlock(booking.id, timeSlots);
    } catch (tentativeError) {
        console.error('Race condition detected:', tentativeError);

        // Cleanup: refund deposit and mark booking as expired
        try {
            await depositService.refundDeposit(deposit.id, 'slots_no_longer_available');
            await bookingService.updateBookingStatus(booking.id, 'expired');
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }

        tentativeError = true;
    }

    // Redirect OUTSIDE try-catch if tentative booking failed
    if (tentativeError) {
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

    // ✅ Success - redirect OUTSIDE try-catch
    redirect(303, `/booking/booking-success?bookingId=${booking.id}`);
};