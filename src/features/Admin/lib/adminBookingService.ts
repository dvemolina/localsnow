// src/features/Admin/lib/adminBookingService.ts
import { db } from '$lib/server/db';
import { bookingRequests, clientDeposits, leadPayments } from '$lib/server/db/schema';
import { eq, and, or, like, gte, lte, sql, count } from 'drizzle-orm';
import { adminAuditService } from './adminAuditService';

interface BookingFilters {
	search?: string;
	status?: string;
	dateFrom?: Date;
	dateTo?: Date;
	instructorId?: number;
}

export const adminBookingService = {
	/**
	 * Get all bookings with filters and pagination
	 */
	async getAllBookings(filters: BookingFilters = {}, page: number = 1, pageSize: number = 50) {
		const offset = (page - 1) * pageSize;

		// Build where conditions
		const conditions: any[] = [];

		if (filters.search) {
			conditions.push(
				or(
					like(bookingRequests.clientName, `%${filters.search}%`),
					like(bookingRequests.clientEmail, `%${filters.search}%`)
				)
			);
		}

		if (filters.status) {
			conditions.push(eq(bookingRequests.status, filters.status as any));
		}

		if (filters.dateFrom) {
			conditions.push(gte(bookingRequests.startDate, filters.dateFrom));
		}

		if (filters.dateTo) {
			conditions.push(lte(bookingRequests.startDate, filters.dateTo));
		}

		if (filters.instructorId) {
			conditions.push(eq(bookingRequests.instructorId, filters.instructorId));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const bookings = await db.query.bookingRequests.findMany({
			where: whereClause,
			limit: pageSize,
			offset,
			orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
			with: {
				instructor: {
					columns: {
						id: true,
						name: true,
						lastName: true,
						email: true
					}
				},
				sports: {
					with: {
						sport: true
					}
				}
			}
		});

		// Get total count
		const totalResult = await db
			.select({ count: count() })
			.from(bookingRequests)
			.where(whereClause);

		const total = totalResult[0]?.count || 0;

		return {
			bookings,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize)
			}
		};
	},

	/**
	 * Get single booking details
	 */
	async getBookingById(bookingId: number) {
		const booking = await db.query.bookingRequests.findFirst({
			where: eq(bookingRequests.id, bookingId),
			with: {
				instructor: true,
				sports: {
					with: {
						sport: true
					}
				}
			}
		});

		if (!booking) {
			return null;
		}

		// Get client deposit info
		const deposit = await db.query.clientDeposits.findFirst({
			where: eq(clientDeposits.bookingRequestId, bookingId)
		});

		// Get lead payment info
		const leadPayment = await db.query.leadPayments.findFirst({
			where: eq(leadPayments.bookingRequestId, bookingId)
		});

		// Get audit logs
		const auditLogs = await adminAuditService.getLogsByTarget('booking', bookingId, 20);

		return {
			booking,
			deposit,
			leadPayment,
			auditLogs
		};
	},

	/**
	 * Cancel a booking
	 */
	async cancelBooking(bookingId: number, adminId: number, reason: string, event?: any) {
		await db
			.update(bookingRequests)
			.set({
				status: 'rejected',
				updatedAt: new Date()
			})
			.where(eq(bookingRequests.id, bookingId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'cancel_booking',
			targetType: 'booking',
			targetId: bookingId,
			details: { reason },
			event
		});

		return { success: true };
	},

	/**
	 * Process refund for a booking deposit
	 * Note: This marks it as refunded in DB, actual Stripe refund should be done separately
	 */
	async refundDeposit(bookingId: number, adminId: number, event?: any) {
		const deposit = await db.query.clientDeposits.findFirst({
			where: eq(clientDeposits.bookingRequestId, bookingId)
		});

		if (!deposit) {
			return { success: false, error: 'No deposit found for this booking' };
		}

		await db
			.update(clientDeposits)
			.set({
				status: 'refunded',
				refundedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(clientDeposits.bookingRequestId, bookingId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'refund_deposit',
			targetType: 'booking',
			targetId: bookingId,
			details: {
				depositId: deposit.id,
				amount: deposit.amount,
				stripePaymentIntentId: deposit.stripePaymentIntentId
			},
			event
		});

		return {
			success: true,
			deposit,
			message: 'Deposit marked as refunded. Please process the Stripe refund separately.'
		};
	},

	/**
	 * Get booking statistics for reporting
	 */
	async getBookingStatistics(dateFrom?: Date, dateTo?: Date) {
		const conditions: any[] = [];

		if (dateFrom) {
			conditions.push(gte(bookingRequests.createdAt, dateFrom));
		}

		if (dateTo) {
			conditions.push(lte(bookingRequests.createdAt, dateTo));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Bookings by status
		const byStatus = await db
			.select({
				status: bookingRequests.status,
				count: count()
			})
			.from(bookingRequests)
			.where(whereClause)
			.groupBy(bookingRequests.status);

		// Total estimated revenue
		const revenueResult = await db
			.select({
				total: sql<number>`SUM(${bookingRequests.estimatedPrice})`
			})
			.from(bookingRequests)
			.where(and(
				whereClause,
				or(
					eq(bookingRequests.status, 'accepted'),
					eq(bookingRequests.status, 'completed')
				)
			));

		return {
			byStatus,
			totalRevenue: revenueResult[0]?.total || 0
		};
	}
};
