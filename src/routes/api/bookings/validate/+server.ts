import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BookingRequestService } from '$src/features/Bookings/lib/bookingRequestService';

const bookingService = new BookingRequestService();

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { instructorId, clientEmail } = await request.json();

        if (!instructorId || !clientEmail) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get authenticated user ID if available (preferred for security and performance)
        const clientUserId = locals.user?.id || null;

        const validation = await bookingService.validateBookingRequest(
            Number(instructorId),
            clientUserId,
            clientEmail
        );

        return json(validation);
    } catch (error) {
        console.error('Error validating booking request:', error);
        return json({ error: 'Validation failed' }, { status: 500 });
    }
};