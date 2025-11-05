import { db } from "$lib/server/db";
import { clientDeposits, bookingRequests } from "$lib/server/db/schema";
import { eq, and, lte } from "drizzle-orm";

export interface CreateDepositData {
    bookingRequestId: number;
    clientEmail: string;
    amount: string;
    currency: string;
    expiresAt: Date;
}

export class ClientDepositRepository {
    
    async createDeposit(data: CreateDepositData) {
        const [deposit] = await db.insert(clientDeposits)
            .values({
                bookingRequestId: data.bookingRequestId,
                clientEmail: data.clientEmail,
                amount: data.amount,
                currency: data.currency,
                status: 'pending',
                expiresAt: data.expiresAt
            })
            .returning();
        
        return deposit;
    }

    async getDepositById(id: number) {
        const result = await db.select()
            .from(clientDeposits)
            .where(eq(clientDeposits.id, id));
        
        return result[0] ?? null;
    }

    async getDepositByBookingRequest(bookingRequestId: number) {
        const result = await db.select()
            .from(clientDeposits)
            .where(eq(clientDeposits.bookingRequestId, bookingRequestId));
        
        return result[0] ?? null;
    }

    async updateDepositStatus(
        id: number, 
        status: string, 
        additionalFields?: { 
            stripePaymentIntentId?: string;
            refundedAt?: Date;
            forfeitedAt?: Date;
        }
    ) {
        const updateData: any = {
            status,
            updatedAt: new Date()
        };

        if (additionalFields) {
            Object.assign(updateData, additionalFields);
        }

        const [deposit] = await db.update(clientDeposits)
            .set(updateData)
            .where(eq(clientDeposits.id, id))
            .returning();
        
        return deposit;
    }

    async getExpiredHeldDeposits(currentDate: Date) {
        return await db.select({
            deposit: clientDeposits,
            booking: bookingRequests
        })
        .from(clientDeposits)
        .leftJoin(bookingRequests, eq(clientDeposits.bookingRequestId, bookingRequests.id))
        .where(
            and(
                eq(clientDeposits.status, 'held'),
                lte(clientDeposits.expiresAt, currentDate)
            )
        );
    }
}