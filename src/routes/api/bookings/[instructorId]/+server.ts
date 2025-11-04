import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { TentativeBookingService } from '$src/features/Availability/lib/tentativeBookingService';
import { sendBookingNotificationToInstructor, sendBookingConfirmationToClient } from '$src/lib/server/webhooks/n8n/email-n8n';

const instructorService = new InstructorService();
const bookingRequestService = new BookingRequestService();
const tentativeBookingService = new TentativeBookingService();
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

        // Validate time slots
        if (!data.timeSlots || !Array.isArray(data.timeSlots) || data.timeSlots.length === 0) {
            throw error(400, 'Please select at least one time slot');
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

        // Create tentative booking blocks for each day and time slot
        try {
            await tentativeBookingService.createTentativeBlock(bookingRequest.id);
        } catch (tentativeError) {
            // If slots are no longer available, update booking status and notify
            await bookingRequestService.updateBookingStatus(bookingRequest.id, 'expired');
            
            throw error(409, 
                tentativeError instanceof Error && tentativeError.message.includes('no longer available')
                    ? 'Sorry, those time slots were just booked by another client. Please select different dates.'
                    : 'Failed to reserve time slots. Please try again.'
            );
        }

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

        return json({ 
            success: true,
            bookingId: bookingRequest.id,
            message: 'Booking request created successfully. Time slots are tentatively reserved for 48 hours.'
        });
    } catch (err) {
        console.error('Error creating booking request:', err);
        
        // Re-throw http errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        
        throw error(500, 'Failed to submit booking request');
    }
};