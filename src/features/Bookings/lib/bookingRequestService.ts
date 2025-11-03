import { BookingRequestRepository, type BookingRequestData } from "./bookingRequestRepository";

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
        return await this.repository.updateBookingStatus(bookingRequestId, status);
    }
}