import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { sendBookingNotificationToInstructor, sendBookingConfirmationToClient } from '$src/lib/server/webhooks/n8n/email-n8n';

const instructorService = new InstructorService();
const bookingRequestService = new BookingRequestService();
const LEAD_PRICE = 5;

export const POST: RequestHandler = async ({ request, params, url }) => {
    const instructorId = Number(params.instructorId);
    
    if (isNaN(instructorId)) {
        throw error(400, 'Invalid instructor ID');
    }

    try {
        const data = await request.json();
        
        // Validate required fields
        if (!data.clientName || !data.clientEmail || !data.startDate || !data.skillLevel || !data.numberOfStudents || !data.hoursPerDay) {
            throw error(400, 'Missing required fields');
        }

        // Parse dates
        const startDate = new Date(data.startDate);
        const endDate = data.endDate ? new Date(data.endDate) : null;

        // Create booking request
        const bookingRequest = await bookingRequestService.createBookingRequest({
            instructorId,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone || null,
            clientCountryCode: String(data.clientCountryCode),
            numberOfStudents: Number(data.numberOfStudents),
            startDate,
            endDate,
            hoursPerDay: Number(data.hoursPerDay),
            skillLevel: data.skillLevel,
            message: data.message || null,
            promoCode: data.promoCode || null,
            estimatedPrice: data.estimatedPrice || null,
            currency: data.currency || null,
            sports: data.sports || []
        });

        // Get instructor details for email
        const instructorData = await instructorService.getInstructorWithLessons(instructorId);
        const instructor = instructorData?.instructor;

        if (instructor?.email) {
            const baseUrl = url.origin;
            const paymentUrl = `${baseUrl}/leads/payment/${bookingRequest.id}`;

            sendBookingNotificationToInstructor({
                instructorEmail: instructor.email,
                instructorName: instructor.name,
                bookingRequestId: bookingRequest.id,
                clientName: data.clientName,
                numberOfStudents: data.numberOfStudents,
                startDate: data.startDate,
                leadPrice: LEAD_PRICE,
                paymentUrl
            }).catch(err => console.error('Failed to send instructor notification:', err));
        }

        sendBookingConfirmationToClient({
            clientEmail: data.clientEmail,
            clientName: data.clientName,
            instructorName: instructor?.name || 'Your instructor',
            numberOfStudents: data.numberOfStudents,
            startDate: data.startDate,
            endDate: data.endDate,
            hoursPerDay: data.hoursPerDay,
            estimatedPrice: data.estimatedPrice,
            currency: data.currency
        }).catch(err => console.error('Failed to send client confirmation:', err));

        return json({ success: true });
    } catch (err) {
        console.error('Error creating booking request:', err);
        throw error(500, 'Failed to submit booking request');
    }
};