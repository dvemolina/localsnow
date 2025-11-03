import { requireAuth } from "$src/lib/utils/auth";
import { redirect, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { bookingRequests, leadPayments, bookingRequestSports, sports } from "$lib/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { BookingRequestService } from "$src/features/Bookings/lib/bookingRequestService";

const bookingService = new BookingRequestService();

export const load: PageServerLoad = async (event) => {
    const user = requireAuth(event, 'Login to access bookings');
    
    // Only instructors can access
    if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
        redirect(302, '/dashboard');
    }
    
    const statusFilter = event.url.searchParams.get('status') || 'all';
    
    try {
        // Get all booking requests for this instructor with payment info
        const bookingsQuery = await db
            .select({
                id: bookingRequests.id,
                clientName: bookingRequests.clientName,
                clientEmail: bookingRequests.clientEmail,
                clientPhone: bookingRequests.clientPhone,
                clientCountryCode: bookingRequests.clientCountryCode,
                numberOfStudents: bookingRequests.numberOfStudents,
                startDate: bookingRequests.startDate,
                endDate: bookingRequests.endDate,
                hoursPerDay: bookingRequests.hoursPerDay,
                skillLevel: bookingRequests.skillLevel,
                message: bookingRequests.message,
                estimatedPrice: bookingRequests.estimatedPrice,
                currency: bookingRequests.currency,
                status: bookingRequests.status,
                contactInfoUnlocked: bookingRequests.contactInfoUnlocked,
                createdAt: bookingRequests.createdAt,
                paymentStatus: leadPayments.status,
                paymentId: leadPayments.id
            })
            .from(bookingRequests)
            .leftJoin(leadPayments, eq(bookingRequests.id, leadPayments.bookingRequestId))
            .where(eq(bookingRequests.instructorId, user.id))
            .orderBy(desc(bookingRequests.createdAt));
        
        // Get sports for each booking
        const bookingsWithSports = await Promise.all(
            bookingsQuery.map(async (booking) => {
                const bookingSports = await db
                    .select({
                        sportId: sports.id,
                        sportName: sports.sport
                    })
                    .from(bookingRequestSports)
                    .innerJoin(sports, eq(bookingRequestSports.sportId, sports.id))
                    .where(eq(bookingRequestSports.bookingRequestId, booking.id));
                
                return {
                    ...booking,
                    sports: bookingSports
                };
            })
        );
        
        // Filter based on status
        let filteredBookings = bookingsWithSports;
        if (statusFilter === 'pending') {
            filteredBookings = bookingsWithSports.filter(b => !b.contactInfoUnlocked && b.status === 'pending');
        } else if (statusFilter === 'unlocked') {
            filteredBookings = bookingsWithSports.filter(b => b.contactInfoUnlocked);
        } else if (statusFilter === 'rejected') {
            filteredBookings = bookingsWithSports.filter(b => b.status === 'rejected');
        }
        
        return {
            bookings: filteredBookings,
            currentFilter: statusFilter
        };
    } catch (error) {
        console.error('Error loading bookings:', error);
        return {
            bookings: [],
            currentFilter: statusFilter
        };
    }
};

export const actions: Actions = {
    acceptBooking: async (event) => {
        const user = requireAuth(event, 'Session expired. Please login again.');
        
        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Not authorized' });
        }
        
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
        const user = requireAuth(event, 'Session expired. Please login again.');
        
        if (user.role !== 'instructor-independent' && user.role !== 'instructor-school') {
            return fail(403, { message: 'Not authorized' });
        }
        
        const formData = await event.request.formData();
        const bookingId = parseInt(formData.get('bookingId') as string);
        
        if (isNaN(bookingId)) {
            return fail(400, { message: 'Invalid booking ID' });
        }
        
        try {
            await bookingService.updateRequestStatus(bookingId, 'rejected');
            return { success: true, message: 'Booking rejected' };
        } catch (error) {
            console.error('Error rejecting booking:', error);
            return fail(500, { message: 'Failed to reject booking' });
        }
    }
};