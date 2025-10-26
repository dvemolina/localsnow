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
}