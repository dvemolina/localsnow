// src/features/Admin/lib/adminStatsService.ts
import { db } from '$lib/server/db';
import { users, bookingRequests, instructorReviews, clientDeposits, leadPayments } from '$lib/server/db/schema';
import { sql, eq, count, sum, and, gte } from 'drizzle-orm';

export const adminStatsService = {
	/**
	 * Get platform overview statistics
	 */
	async getPlatformStats() {
		// Total users by role
		const userStats = await db
			.select({
				role: users.role,
				count: count()
			})
			.from(users)
			.groupBy(users.role);

		// Total instructors (verified vs unverified)
		const instructorStats = await db
			.select({
				isVerified: users.isVerified,
				count: count()
			})
			.from(users)
			.where(
				sql`${users.role} IN ('instructor-independent', 'instructor-school')`
			)
			.groupBy(users.isVerified);

		// Booking statistics by status
		const bookingStats = await db
			.select({
				status: bookingRequests.status,
				count: count()
			})
			.from(bookingRequests)
			.groupBy(bookingRequests.status);

		// Total revenue from deposits (held + forfeited)
		const depositRevenue = await db
			.select({
				total: sum(clientDeposits.amount),
				status: clientDeposits.status
			})
			.from(clientDeposits)
			.groupBy(clientDeposits.status);

		// Total revenue from lead payments
		const leadRevenue = await db
			.select({
				total: sum(leadPayments.amount),
				status: leadPayments.status
			})
			.from(leadPayments)
			.groupBy(leadPayments.status);

		// Review statistics
		const reviewStats = await db
			.select({
				total: count(),
				avgRating: sql<number>`AVG(${instructorReviews.rating})`
			})
			.from(instructorReviews);

		// Get recent activity (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentBookings = await db
			.select({ count: count() })
			.from(bookingRequests)
			.where(gte(bookingRequests.createdAt, thirtyDaysAgo));

		const recentUsers = await db
			.select({ count: count() })
			.from(users)
			.where(gte(users.createdAt, thirtyDaysAgo));

		return {
			userStats,
			instructorStats,
			bookingStats,
			depositRevenue,
			leadRevenue,
			reviewStats: reviewStats[0] || { total: 0, avgRating: 0 },
			recentActivity: {
				bookings: recentBookings[0]?.count || 0,
				users: recentUsers[0]?.count || 0
			}
		};
	},

	/**
	 * Get pending verifications that need admin action
	 */
	async getPendingVerifications() {
		const pendingInstructors = await db.query.users.findMany({
			where: (users, { and, eq, or, isNotNull }) =>
				and(
					or(
						eq(users.role, 'instructor-independent'),
						eq(users.role, 'instructor-school')
					),
					eq(users.isVerified, false),
					isNotNull(users.qualificationUrl) // Has uploaded certification
				),
			columns: {
				id: true,
				name: true,
				lastName: true,
				email: true,
				qualificationUrl: true,
				createdAt: true
			},
			limit: 10,
			orderBy: (users, { asc }) => [asc(users.createdAt)]
		});

		return pendingInstructors;
	},

	/**
	 * Get recent bookings for dashboard
	 */
	async getRecentBookings(limit: number = 10) {
		const bookings = await db.query.bookingRequests.findMany({
			limit,
			orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
			with: {
				instructor: {
					columns: {
						id: true,
						name: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		return bookings;
	},

	/**
	 * Get recent reviews for dashboard
	 */
	async getRecentReviews(limit: number = 10) {
		const recentReviews = await db.query.instructorReviews.findMany({
			limit,
			orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
			with: {
				instructor: {
					columns: {
						id: true,
						name: true,
						lastName: true
					}
				}
			}
		});

		return recentReviews;
	},

	/**
	 * Get suspended users
	 */
	async getSuspendedUsers() {
		return await db.query.users.findMany({
			where: (users, { eq }) => eq(users.isSuspended, true),
			columns: {
				id: true,
				name: true,
				lastName: true,
				email: true,
				role: true,
				suspensionReason: true,
				suspendedAt: true
			}
		});
	}
};
