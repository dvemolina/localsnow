import { BookingRequestRepository } from "./bookingRequestRepository";
import { sendBookingNotification } from "$src/lib/server/webhooks/email-n8n";
import type { InsertBookingRequest } from "$src/lib/server/db/schema";

export class BookingRequestService {
    private repository: BookingRequestRepository;

    constructor() {
        this.repository = new BookingRequestRepository();
    }

    async createBookingRequest(data: InsertBookingRequest) {
        const request = await this.repository.createBookingRequest(data);
        
        // Send notification email (you'll implement this next)
        // await sendBookingNotification(request);
        
        return request;
    }

    async getBookingRequestsByInstructor(instructorId: number) {
        return await this.repository.getBookingRequestsByInstructor(instructorId);
    }

    async getAllBookingRequests() {
        return await this.repository.getAllBookingRequests();
    }

    async updateRequestStatus(id: number, status: string) {
        return await this.repository.updateRequestStatus(id, status);
    }
}