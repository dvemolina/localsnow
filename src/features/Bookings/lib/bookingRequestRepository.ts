import { db } from "$lib/server/db";
import { bookingRequests, bookingRequestSports } from "$src/lib/server/db/schema";
import { eq } from "drizzle-orm";

export interface BookingRequestData {
    instructorId: number;
    clientName: string;
    clientEmail: string;
    clientCountryCode: string;
    clientPhone?: string | null;
    numberOfStudents: number;
    startDate: Date;
    endDate?: Date | null;
    hoursPerDay: number;
    skillLevel: string;
    message?: string | null;
    promoCode?: string | null;
    estimatedPrice?: number | null;
    currency?: string | null;
    sports: number[];
}

export class BookingRequestRepository {
    async createBookingRequest(data: BookingRequestData) {
        return await db.transaction(async (tx) => {
            // Create the booking request
            const [request] = await tx.insert(bookingRequests).values({
                instructorId: data.instructorId,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone || null,
                clientCountryCode: data.clientCountryCode,
                numberOfStudents: data.numberOfStudents,
                startDate: data.startDate,
                endDate: data.endDate || null,
                hoursPerDay: data.hoursPerDay.toString(),
                skillLevel: data.skillLevel,
                message: data.message || null,
                promoCode: data.promoCode || null,
                estimatedPrice: data.estimatedPrice || null,
                currency: data.currency || null,
                status: 'pending'
            }).returning();

            // Insert sports relationships
            if (data.sports && data.sports.length > 0) {
                await tx.insert(bookingRequestSports).values(
                    data.sports.map(sportId => ({
                        bookingRequestId: request.id,
                        sportId
                    }))
                );
            }

            return request;
        });
    }

    async getBookingRequestById(id: number) {
        const result = await db.select().from(bookingRequests).where(eq(bookingRequests.id, id));
        return result[0] ?? null;
    }

    async getBookingRequestsByInstructor(instructorId: number) {
        return await db.select().from(bookingRequests).where(eq(bookingRequests.instructorId, instructorId));
    }

    async updateRequestStatus(id: number, status: string) {
        const result = await db
            .update(bookingRequests)
            .set({ status, updatedAt: new Date() })
            .where(eq(bookingRequests.id, id))
            .returning();
        return result[0] ?? null;
    }
}