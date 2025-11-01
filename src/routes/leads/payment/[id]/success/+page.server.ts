import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { LeadPaymentService } from '$src/features/Bookings/lib/leadPaymentService';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { sendContactInfoToInstructor } from '$src/lib/server/webhooks/n8n/email-n8n';

const bookingService = new BookingRequestService();
const paymentService = new LeadPaymentService();
const instructorService = new InstructorService();

const sportNames: Record<number, string> = {
    1: 'Ski',
    2: 'Snowboard',
    3: 'Telemark'
};

export const load: PageServerLoad = async ({ params, locals, url }) => {
    const user = locals.user;
    
    if (!user) {
        throw redirect(302, `/auth/login?redirect=/leads/payment/${params.id}/success`);
    }

    const bookingRequestId = Number(params.id);
    
    if (isNaN(bookingRequestId)) {
        throw error(404, 'Booking request not found');
    }

    try {
        // Check if payment was made
        const hasPaid = await paymentService.hasInstructorPaidForLead(bookingRequestId, user.id);
        
        if (!hasPaid) {
            // If not paid, redirect back to payment page
            throw redirect(302, `/leads/payment/${bookingRequestId}`);
        }

        // Get full booking request with contact info
        const bookingRequest = await bookingService.getBookingRequestById(bookingRequestId);
        
        if (!bookingRequest) {
            throw error(404, 'Booking request not found');
        }

        // Verify user is the instructor for this booking
        if (bookingRequest.instructorId !== user.id) {
            throw error(403, 'Unauthorized');
        }

        // Get instructor details
        const instructorData = await instructorService.getInstructorWithLessons(user.id);

        // Get sports names
        const sports = await bookingService.getBookingRequestSports(bookingRequestId);
        const sportsNames = sports.map(id => sportNames[id] || 'Unknown');

        // Send contact info email to instructor (if not already sent)
        const sessionId = url.searchParams.get('session_id');
        if (sessionId && instructorData?.instructor?.email) {
            sendContactInfoToInstructor({
                instructorEmail: instructorData.instructor.email,
                instructorName: instructorData.instructor.name,
                clientName: bookingRequest.clientName,
                clientEmail: bookingRequest.clientEmail,
                clientPhone: bookingRequest.clientPhone || 'Not provided',
                clientCountryCode: bookingRequest.clientCountryCode,
                numberOfStudents: bookingRequest.numberOfStudents,
                startDate: bookingRequest.startDate.toISOString(),
                endDate: bookingRequest.endDate?.toISOString(),
                hoursPerDay: parseFloat(bookingRequest.hoursPerDay),
                sports: sportsNames,
                skillLevel: bookingRequest.skillLevel,
                message: bookingRequest.message || undefined,
                estimatedPrice: bookingRequest.estimatedPrice || undefined,
                currency: bookingRequest.currency || undefined
            }).catch(err => console.error('Failed to send contact info email:', err));
        }

        return {
            bookingRequest: {
                id: bookingRequest.id,
                clientName: bookingRequest.clientName,
                clientEmail: bookingRequest.clientEmail,
                clientPhone: bookingRequest.clientPhone,
                clientCountryCode: bookingRequest.clientCountryCode,
                numberOfStudents: bookingRequest.numberOfStudents,
                startDate: bookingRequest.startDate,
                endDate: bookingRequest.endDate,
                hoursPerDay: bookingRequest.hoursPerDay,
                skillLevel: bookingRequest.skillLevel,
                estimatedPrice: bookingRequest.estimatedPrice,
                currency: bookingRequest.currency,
                message: bookingRequest.message,
                sports: sportsNames
            }
        };
    } catch (err) {
        if (err instanceof Response) throw err;
        console.error('Error loading success page:', err);
        throw error(500, 'Failed to load booking information');
    }
};