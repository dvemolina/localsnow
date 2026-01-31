import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { BookingRequestService } from "$src/features/Bookings/lib/bookingRequestService";
import { LessonService } from "$src/features/Lessons/lib/lessonService";
import { requireDashboardRole } from "$src/lib/utils/dashboardAuth";

const bookingService = new BookingRequestService();
const lessonService = new LessonService();

export const load: PageServerLoad = async (event) => {
    const user = requireDashboardRole(
        event,
        ['instructor-independent', 'instructor-school'],
        'Login to access bookings'
    );

    const statusFilter = event.url.searchParams.get('status') || 'all';
    const sourceFilter = event.url.searchParams.get('source') || 'all';

    try {
        // Delegate to service layer
        const bookings = await bookingService.getBookingsWithDetailsForInstructor(user.id, statusFilter);

        // Filter by source if specified
        const filteredBookings = sourceFilter === 'all'
            ? bookings
            : bookings.filter(b => b.source === sourceFilter);

        // Load instructor's lessons for manual booking dialog
        const instructorLessons = await lessonService.listLessonsByInstructor(user.id);

        return {
            bookings: filteredBookings,
            instructorLessons,
            currentFilter: statusFilter,
            sourceFilter
        };
    } catch (error) {
        console.error('Error loading bookings:', error);
        return {
            bookings: [],
            instructorLessons: [],
            currentFilter: statusFilter,
            sourceFilter
        };
    }
};

export const actions: Actions = {
    acceptBooking: async (event) => {
        const user = requireDashboardRole(
            event,
            ['instructor-independent', 'instructor-school'],
            'Session expired. Please login again.'
        );
        
        const formData = await event.request.formData();
        const bookingId = parseInt(formData.get('bookingId') as string);
        
        if (isNaN(bookingId)) {
            return fail(400, { message: 'Invalid booking ID' });
        }
        
        try {
            await bookingService.updateRequestStatus(bookingId, 'accepted');
            return { success: true, message: 'Booking accepted!' };
        } catch (error) {
            console.error('Error accepting booking:', error);
            return fail(500, { message: 'Failed to accept booking' });
        }
    },
    
    rejectBooking: async (event) => {
        const user = requireDashboardRole(
            event,
            ['instructor-independent', 'instructor-school'],
            'Session expired. Please login again.'
        );

        const formData = await event.request.formData();
        const bookingId = parseInt(formData.get('bookingId') as string);

        if (isNaN(bookingId)) {
            return fail(400, { message: 'Invalid booking ID' });
        }

        try {
            // Verify ownership
            const booking = await bookingService.getBookingRequestById(bookingId);

            if (!booking || booking.instructorId !== user.id) {
                return fail(404, { message: 'Booking not found' });
            }

            // Reject booking and release tentative blocks (handled by updateBookingStatus)
            await bookingService.updateBookingStatus(bookingId, 'rejected');

            // No deposit refund needed - platform is 100% free

            return { success: true, message: 'Booking rejected' };
        } catch (error) {
            console.error('Error rejecting booking:', error);
            return fail(500, { message: 'Failed to reject booking' });
        }
    }
};
