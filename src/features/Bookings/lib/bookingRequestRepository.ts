import { db } from "$lib/server/db";
import { bookingRequests, leadPayments, bookingRequestSports, sports } from "$lib/server/db/schema";
import { eq, desc, and, inArray, or, isNull } from "drizzle-orm";

export interface BookingRequestData {
    instructorId: number;
    clientUserId?: number | null; // Authenticated user ID (preferred for security and performance)
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
                clientUserId: data.clientUserId || null, // Store user ID for authenticated users
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
                timeSlots: bookingRequests.timeSlots,
                skillLevel: bookingRequests.skillLevel,
                message: bookingRequests.message,
                estimatedPrice: bookingRequests.estimatedPrice,
                currency: bookingRequests.currency,
                status: bookingRequests.status,
                contactInfoUnlocked: bookingRequests.contactInfoUnlocked,
                reviewSubmittedAt: bookingRequests.reviewSubmittedAt,
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
        const result = await db
            .update(bookingRequests)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(bookingRequests.id, bookingRequestId))
            .returning();
        return result[0] ?? null;
    }

    /**
     * Check if client already has an active request with this instructor
     * @param instructorId - Instructor user ID
     * @param clientUserId - Client user ID (preferred)
     * @param clientEmail - Client email (fallback)
     */
    async checkExistingRequest(instructorId: number, clientUserId?: number | null, clientEmail?: string | null): Promise<boolean> {
        // Build WHERE clause based on available identifiers
        let clientCondition;
        if (clientUserId) {
            clientCondition = eq(bookingRequests.clientUserId, clientUserId);
        } else if (clientEmail) {
            clientCondition = eq(bookingRequests.clientEmail, clientEmail.toLowerCase().trim());
        } else {
            return false;
        }

        const result = await db.select()
            .from(bookingRequests)
            .where(
                and(
                    eq(bookingRequests.instructorId, instructorId),
                    clientCondition,
                    inArray(bookingRequests.status, ['pending', 'viewed', 'accepted'])
                )
            );
        return result.length > 0;
    }

    /**
     * Get count of active booking requests for a client
     * @param clientUserId - Client user ID (preferred)
     * @param clientEmail - Client email (fallback)
     */
    async getActiveRequestCount(clientUserId?: number | null, clientEmail?: string | null): Promise<number> {
        // Build WHERE clause based on available identifiers
        let clientCondition;
        if (clientUserId) {
            clientCondition = eq(bookingRequests.clientUserId, clientUserId);
        } else if (clientEmail) {
            clientCondition = eq(bookingRequests.clientEmail, clientEmail.toLowerCase().trim());
        } else {
            return 0;
        }

        const result = await db.select()
            .from(bookingRequests)
            .where(
                and(
                    clientCondition,
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

    /**
     * Get bookings by client user ID (preferred) with email fallback
     * @param clientUserId - Authenticated user ID (preferred)
     * @param clientEmail - Email address (fallback for legacy bookings)
     */
    async getBookingRequestsByClient(clientUserId?: number | null, clientEmail?: string | null) {
        // Build WHERE clause: prioritize user ID, fallback to email
        let whereClause;
        if (clientUserId) {
            // Primary path: Query by user ID (most secure and performant)
            whereClause = eq(bookingRequests.clientUserId, clientUserId);
        } else if (clientEmail) {
            // Fallback path: Query by email (for legacy bookings or guest users)
            whereClause = and(
                eq(bookingRequests.clientEmail, clientEmail.toLowerCase().trim()),
                // Ensure we only get bookings that don't have a user ID set
                // This prevents duplicate results if a user has both authenticated and legacy bookings
                isNull(bookingRequests.clientUserId)
            );
        } else {
            // No valid identifier provided
            return [];
        }

        const bookingsQuery = await db
            .select({
                id: bookingRequests.id,
                instructorId: bookingRequests.instructorId,
                clientUserId: bookingRequests.clientUserId,
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
                reviewSubmittedAt: bookingRequests.reviewSubmittedAt,
                usedLaunchCode: bookingRequests.usedLaunchCode,
                promoCode: bookingRequests.promoCode,
                createdAt: bookingRequests.createdAt,
                updatedAt: bookingRequests.updatedAt
            })
            .from(bookingRequests)
            .where(whereClause)
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
