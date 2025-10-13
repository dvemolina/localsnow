import { db } from "$lib/server/db";
import { bookingRequests, users, type InsertBookingRequest } from "$src/lib/server/db/schema";
import { eq } from "drizzle-orm";

export class BookingRequestRepository {
    async createBookingRequest(data: InsertBookingRequest) {
        const result = await db.insert(bookingRequests).values(data).returning();
        return result[0];
    }

    async getBookingRequestById(id: number) {
        const result = await db.select().from(bookingRequests).where(eq(bookingRequests.id, id));
        return result[0] ?? null;
    }

    async getBookingRequestsByInstructor(instructorId: number) {
        return await db.select().from(bookingRequests).where(eq(bookingRequests.instructorId, instructorId));
    }

    async getAllBookingRequests() {
        return await db
            .select({
                request: bookingRequests,
                instructor: users
            })
            .from(bookingRequests)
            .innerJoin(users, eq(bookingRequests.instructorId, users.id));
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