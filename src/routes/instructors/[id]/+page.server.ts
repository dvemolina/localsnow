// src/routes/instructors/[id]/+page.server.ts
import { error, fail, json } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { PricingService } from '$src/features/Pricing/lib/pricingService';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { trackProfileVisit } from '$src/features/Dashboard/lib/utils';
import { getClientIP } from '$src/lib/utils/auth';
import { sendBookingNotificationToInstructor, sendBookingConfirmationToClient } from '$src/lib/server/webhooks/n8n/email-n8n';

const instructorService = new InstructorService();
const pricingService = new PricingService();
const bookingRequestService = new BookingRequestService();

const LEAD_PRICE = 5; // €5 per lead

export const load: PageServerLoad = async (event) => {
    const instructorId = Number(event.params.id);
    
    if (isNaN(instructorId)) {
        throw error(404, 'Instructor not found');
    }

    try {
        // Get instructor with relations AND base lesson
        const instructorData = await instructorService.getInstructorWithLessons(instructorId);
        
        if (!instructorData || !instructorData.instructor) {
            throw error(404, 'Instructor not found');
        }

        // Verify the user has an instructor role
        if (!instructorData.instructor.role?.includes('instructor')) {
            throw error(404, 'Instructor not found');
        }

        // Get sports and resorts
        const [sports, resorts] = await Promise.all([
            instructorService.getInstructorSports(instructorId),
            instructorService.getInstructorResorts(instructorId)
        ]);

        // ✅ Load pricing data if base lesson exists
        let groupTiers = [];
        let durationPackages = [];
        let promoCodes = [];
        
        if (instructorData.baseLesson) {
            const pricingData = await pricingService.getLessonPricingData(instructorData.baseLesson.id);
            groupTiers = pricingData.groupTiers;
            durationPackages = pricingData.durationPackages;
            promoCodes = pricingData.promoCodes;
        }

        // Track profile visit (async, don't wait)
        const visitorIP = getClientIP(event);
        if (visitorIP) {
            trackProfileVisit(instructorId, visitorIP).catch(err => 
                console.error('Failed to track visit:', err)
            );
        }

        return {
            instructor: instructorData.instructor,
            baseLesson: instructorData.baseLesson,
            groupTiers,
            durationPackages,
            promoCodes,
            sports,
            resorts,
            user: event.locals.user ?? null
        };
    } catch (err) {
        console.error('Error loading instructor profile:', err);
        throw error(500, 'Failed to load instructor profile');
    }
};

export const actions: Actions = {
    default: async ({ request, params, url }) => {
        const instructorId = Number(params.id);
        
        if (isNaN(instructorId)) {
            return fail(400, { message: 'Invalid instructor ID' });
        }

        try {
            const data = await request.json();
            
            // Validate required fields
            if (!data.clientName || !data.clientEmail || !data.startDate || !data.skillLevel || !data.numberOfStudents || !data.hoursPerDay) {
                return fail(400, { message: 'Missing required fields' });
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
                clientCountryCode: data.clientCountryCode,
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
                // Build payment URL
                const baseUrl = url.origin;
                const paymentUrl = `${baseUrl}/leads/payment/${bookingRequest.id}`;

                // Send notification to instructor (with payment link)
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

            // Send confirmation to client
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
            return fail(500, { message: 'Failed to submit booking request' });
        }
    }

};