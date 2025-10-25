// src/routes/instructors/[id]/+page.server.ts
import { error, fail, json } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { InstructorService } from '$src/features/Instructors/lib/instructorService';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';
import { trackProfileVisit } from '$src/features/Dashboard/lib/utils';
import { getClientIP } from '$src/lib/utils/auth';

const instructorService = new InstructorService();
const bookingRequestService = new BookingRequestService();

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
    default: async ({ request, params }) => {
        const instructorId = Number(params.id);
        
        if (isNaN(instructorId)) {
            return fail(400, { message: 'Invalid instructor ID' });
        }

        try {
            const data = await request.json();
            
            // Validate required fields
            if (!data.clientName || !data.clientEmail || !data.preferredDate || !data.skillLevel) {
                return fail(400, { message: 'Missing required fields' });
            }

            // Create booking request
            await bookingRequestService.createBookingRequest({
                instructorId,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone || null,
                preferredDate: new Date(data.preferredDate),
                lessonType: data.lessonType,
                numberOfPeople: Number(data.numberOfPeople) || 1,
                skillLevel: data.skillLevel,
                message: data.message || null
            });

            return json({ success: true });
        } catch (err) {
            console.error('Error creating booking request:', err);
            return fail(500, { message: 'Failed to submit booking request' });
        }
    }
};