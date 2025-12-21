import { TentativeBookingService } from "$src/features/Availability/lib/tentativeBookingService";
import { BookingRequestRepository, type BookingRequestData } from "./bookingRequestRepository";
import {
    sendCancellationNotificationToInstructor,
    sendCancellationConfirmationToClient
} from "$lib/server/webhooks/n8n/email-n8n";
import { db } from "$lib/server/db";

const tentativeBookingService = new TentativeBookingService();

const MAX_FREE_REQUESTS = 3; // Free limit
const ADDITIONAL_REQUEST_FEE = 2; // €2 per additional request

export class BookingRequestService {
    
    private repository: BookingRequestRepository;

    constructor() {
        this.repository = new BookingRequestRepository();
    }

    async createBookingRequest(data: BookingRequestData) {
        return await this.repository.createBookingRequest(data);
    }

    async getBookingRequestsByInstructor(instructorId: number) {
        return await this.repository.getBookingRequestsByInstructor(instructorId);
    }

    async updateRequestStatus(id: number, status: string) {
        return await this.repository.updateRequestStatus(id, status);
    }

    async getBookingRequestById(bookingRequestId: number) {
        return await this.repository.getBookingRequestById(bookingRequestId)
    }

    async getBookingRequestSports(bookingRequestId: number): Promise<number[]> {
        return await this.repository.getBookingRequestSports(bookingRequestId);
    }

    async getBookingsWithDetailsForInstructor(instructorId: number, statusFilter: string = 'all') {
        const allBookings = await this.repository.getBookingsWithDetailsForInstructor(instructorId);
        
        // Apply filtering
        if (statusFilter === 'pending') {
            return allBookings.filter(b => !b.contactInfoUnlocked && b.status === 'pending');
        } else if (statusFilter === 'unlocked') {
            return allBookings.filter(b => b.contactInfoUnlocked);
        } else if (statusFilter === 'rejected') {
            return allBookings.filter(b => b.status === 'rejected');
        }
        
        return allBookings;
    }

    async updateBookingStatus(bookingRequestId: number, status: string) {
        const result = await this.repository.updateBookingStatus(bookingRequestId, status);

        // Clean up tentative blocks when booking is rejected, expired, or cancelled
        if (status === 'rejected' || status === 'expired' || status === 'cancelled') {
            await tentativeBookingService.deleteTentativeBlocksForBooking(bookingRequestId).catch(err => {
                console.error('Failed to cleanup tentative blocks:', err);
            });
        }

        return result;
    }


    async validateBookingRequest(instructorId: number, clientUserId?: number | null, clientEmail?: string | null): Promise<{
        allowed: boolean;
        reason?: string;
        requiresPayment?: boolean;
        activeCount?: number;
    }> {
        // Check if already requested from this instructor
        const existingRequest = await this.repository.checkExistingRequest(instructorId, clientUserId, clientEmail);
        if (existingRequest) {
            return {
                allowed: false,
                reason: 'You already have an active request with this instructor'
            };
        }

        // Get active count for analytics but don't enforce limits (free directory model)
        const activeCount = await this.repository.getActiveRequestCount(clientUserId, clientEmail);

        // Free directory model - unlimited requests allowed
        return { allowed: true, activeCount };
    }

    async markAsViewed(bookingRequestId: number) {
        return await this.repository.markAsViewed(bookingRequestId);
    }

    /**
     * Get booking requests for a client by user ID (preferred) or email (fallback)
     * @param clientUserId - Authenticated user ID (preferred)
     * @param clientEmail - Email address (fallback)
     */
    async getBookingRequestsByClient(clientUserId?: number | null, clientEmail?: string | null) {
        return await this.repository.getBookingRequestsByClient(clientUserId, clientEmail);
    }

    async cancelBookingRequest(bookingRequestId: number, clientUserId?: number | null, clientEmail?: string | null) {
        // Verify the booking belongs to this client
        const booking = await this.repository.getBookingRequestById(bookingRequestId);

        // Check ownership: prefer user ID, fallback to email
        let isOwner = false;
        if (clientUserId && booking.clientUserId) {
            isOwner = booking.clientUserId === clientUserId;
        } else if (clientEmail) {
            isOwner = booking.clientEmail === clientEmail.toLowerCase().trim();
        }

        if (!booking || !isOwner) {
            throw new Error('Booking request not found or unauthorized');
        }

        // Only allow cancellation of pending or viewed bookings (protect against race condition)
        if (!['pending', 'viewed'].includes(booking.status)) {
            throw new Error('Cannot cancel this booking request');
        }

        // Get instructor details for notification
        const { users } = await import('$lib/server/db/schema');
        const instructor = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, booking.instructorId),
            columns: {
                id: true,
                name: true,
                lastName: true,
                email: true
            }
        });

        if (!instructor) {
            throw new Error('Instructor not found');
        }

        // Update status to cancelled (this will automatically clean up tentative blocks)
        await this.updateBookingStatus(bookingRequestId, 'cancelled');

        // No deposit refunds - platform is 100% free

        // Send notification to instructor
        try {
            await sendCancellationNotificationToInstructor({
                instructorEmail: instructor.email,
                instructorName: instructor.name,
                bookingRequestId: booking.id,
                clientName: booking.clientName,
                startDate: new Date(booking.startDate).toLocaleDateString(),
                endDate: booking.endDate ? new Date(booking.endDate).toLocaleDateString() : undefined,
                numberOfStudents: booking.numberOfStudents,
                hoursPerDay: parseFloat(booking.hoursPerDay)
            });
        } catch (error) {
            console.error('Failed to send instructor notification:', error);
            // Don't throw - notification failure shouldn't break cancellation
        }

        // Send confirmation to client
        try {
            await sendCancellationConfirmationToClient({
                clientEmail: booking.clientEmail,
                clientName: booking.clientName,
                instructorName: `${instructor.name} ${instructor.lastName}`,
                bookingRequestId: booking.id,
                startDate: new Date(booking.startDate).toLocaleDateString(),
                endDate: booking.endDate ? new Date(booking.endDate).toLocaleDateString() : undefined
            });
        } catch (error) {
            console.error('Failed to send client confirmation:', error);
            // Don't throw - notification failure shouldn't break cancellation
        }

        return {
            success: true,
            bookingRequestId,
            depositRefunded,
            refundAmount: depositRefunded ? refundAmount : 0,
            currency,
            usedLaunchCode: !!booking.usedLaunchCode
        };
    }
}