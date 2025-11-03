import { db } from "$lib/server/db";
import { bookingRequests, leadPayments, bookingRequestSports, sports } from "$lib/server/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

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

    async getBookingRequestSports(bookingRequestId: number): Promise<number[]> {
        const results = await db.select({ sportId: bookingRequestSports.sportId })
            .from(bookingRequestSports)
            .where(eq(bookingRequestSports.bookingRequestId, bookingRequestId));
        
        return results.map(r => r.sportId);
    }

    async getBookingsWithDetailsForInstructor(instructorId: number) {
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
            .leftJoin(leadPayments, 
                and(
                    eq(bookingRequests.id, leadPayments.bookingRequestId),
                    eq(leadPayments.instructorId, instructorId)
                )
            )
            .where(eq(bookingRequests.instructorId, instructorId))
            .orderBy(desc(bookingRequests.createdAt));
        
        // Get sports for each booking
        const bookingsWithSports = await Promise.all(
            bookingsQuery.map(async (booking) => {
                const bookingSportIds = await this.getBookingRequestSports(booking.id);
                
                // Get sport names only if there are sports
                let sportsWithNames: { sportId: number; sportName: "Ski" | "Snowboard" | "Telemark"; }[] = [];
                if (bookingSportIds.length > 0) {
                    sportsWithNames = await db
                        .select({
                            sportId: sports.id,
                            sportName: sports.sport
                        })
                        .from(sports)
                        .where(inArray(sports.id, bookingSportIds));
                }
                
                return {
                    ...booking,
                    sports: sportsWithNames
                };
            })
        );
        
        return bookingsWithSports;
    }
}