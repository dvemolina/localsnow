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
    timeSlots?: string[];
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
                clientEmail: data.clientEmail.toLowerCase().trim(),
                clientPhone: data.clientPhone || null,
                clientCountryCode: data.clientCountryCode,
                numberOfStudents: data.numberOfStudents,
                startDate: data.startDate,
                endDate: data.endDate || null,
                hoursPerDay: data.hoursPerDay.toString(),
                timeSlots: JSON.stringify(data.timeSlots || []),
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

        // Group by booking ID to handle multiple payments for same booking
        const bookingsMap = new Map();
        for (const row of bookingsQuery) {
            if (!bookingsMap.has(row.id)) {
                // First occurrence of this booking ID
                bookingsMap.set(row.id, row);
            } else {
                // Duplicate found - keep the one with payment info if available
                const existing = bookingsMap.get(row.id);
                // If current row has payment info and existing doesn't, replace it
                if (row.paymentId && !existing.paymentId) {
                    bookingsMap.set(row.id, row);
                }
                // If both have payment info, keep the most recent payment
                else if (row.paymentId && existing.paymentId && row.paymentId > existing.paymentId) {
                    bookingsMap.set(row.id, row);
                }
            }
        }

        const uniqueBookings = Array.from(bookingsMap.values());

        // Get sports for each booking
        const bookingsWithSports = await Promise.all(
            uniqueBookings.map(async (booking) => {
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
    //Update booking request status
    async updateBookingStatus(bookingRequestId: number, status: string) {
        return await db
            .update(bookingRequests)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(bookingRequests.id, bookingRequestId))
            .returning();
    }

    async checkExistingRequest(instructorId: number, clientEmail: string): Promise<boolean> {
    const result = await db.select()
        .from(bookingRequests)
        .where(
            and(
                eq(bookingRequests.instructorId, instructorId),
                eq(bookingRequests.clientEmail, clientEmail.toLowerCase().trim()),
                inArray(bookingRequests.status, ['pending', 'viewed', 'accepted'])
            )
        );
    return result.length > 0;
}

    async getActiveRequestCount(clientEmail: string): Promise<number> {
        const result = await db.select()
            .from(bookingRequests)
            .where(
                and(
                    eq(bookingRequests.clientEmail, clientEmail.toLowerCase().trim()),
                    inArray(bookingRequests.status, ['pending', 'viewed'])
                )
            );
        return result.length;
    }

    async markAsViewed(bookingRequestId: number) {
        return await db
            .update(bookingRequests)
            .set({
                status: 'viewed',
                updatedAt: new Date()
            })
            .where(eq(bookingRequests.id, bookingRequestId))
            .returning();
    }

    async getBookingRequestsByClient(clientEmail: string) {
        const bookingsQuery = await db
            .select({
                id: bookingRequests.id,
                instructorId: bookingRequests.instructorId,
                clientName: bookingRequests.clientName,
                clientEmail: bookingRequests.clientEmail,
                clientPhone: bookingRequests.clientPhone,
                clientCountryCode: bookingRequests.clientCountryCode,
                numberOfStudents: bookingRequests.numberOfStudents,
                startDate: bookingRequests.startDate,
                endDate: bookingRequests.endDate,
                hoursPerDay: bookingRequests.hoursPerDay,
                timeSlots: bookingRequests.timeSlots,
                skillLevel: bookingRequests.skillLevel,
                message: bookingRequests.message,
                estimatedPrice: bookingRequests.estimatedPrice,
                currency: bookingRequests.currency,
                status: bookingRequests.status,
                contactInfoUnlocked: bookingRequests.contactInfoUnlocked,
                usedLaunchCode: bookingRequests.usedLaunchCode,
                promoCode: bookingRequests.promoCode,
                createdAt: bookingRequests.createdAt,
                updatedAt: bookingRequests.updatedAt
            })
            .from(bookingRequests)
            .where(eq(bookingRequests.clientEmail, clientEmail.toLowerCase().trim()))
            .orderBy(desc(bookingRequests.createdAt));

        // Get sports and instructor details for each booking
        const bookingsWithDetails = await Promise.all(
            bookingsQuery.map(async (booking) => {
                // Get sports
                const bookingSportIds = await this.getBookingRequestSports(booking.id);
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

                // Get instructor basic info
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

                return {
                    ...booking,
                    sports: sportsWithNames,
                    instructor
                };
            })
        );

        return bookingsWithDetails;
    }
}