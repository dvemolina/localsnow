import { TentativeBookingService } from "$src/features/Availability/lib/tentativeBookingService";
import { BookingRequestRepository, type BookingRequestData } from "./bookingRequestRepository";

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
        
        // Clean up tentative blocks when booking is rejected or expired
        if (status === 'rejected' || status === 'expired') {
            await tentativeBookingService.deleteTentativeBlocksForBooking(bookingRequestId).catch(err => {
                console.error('Failed to cleanup tentative blocks:', err);
            });
        }
        
        return result;
    }


    async validateBookingRequest(instructorId: number, clientEmail: string): Promise<{
        allowed: boolean;
        reason?: string;
        requiresPayment?: boolean;
        activeCount?: number;
    }> {
        // Check if already requested from this instructor
        const existingRequest = await this.repository.checkExistingRequest(instructorId, clientEmail);
        if (existingRequest) {
            return {
                allowed: false,
                reason: 'You already have an active request with this instructor'
            };
        }

        // Check total active requests
        const activeCount = await this.repository.getActiveRequestCount(clientEmail);
        
        if (activeCount >= MAX_FREE_REQUESTS) {
            return {
                allowed: false,
                requiresPayment: true,
                reason: `You have ${activeCount} active requests. To send more requests, you need to pay €${ADDITIONAL_REQUEST_FEE} per additional request or wait for instructors to respond.`,
                activeCount
            };
        }

        return { allowed: true, activeCount };
    }

    async markAsViewed(bookingRequestId: number) {
        return await this.repository.markAsViewed(bookingRequestId);
    }
}