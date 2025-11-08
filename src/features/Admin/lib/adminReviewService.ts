// src/features/Admin/lib/adminReviewService.ts
import { db } from '$lib/server/db';
import { reviews } from '$lib/server/db/schema';
import { eq, and, gte, lte, count } from 'drizzle-orm';
import { adminAuditService } from './adminAuditService';

interface ReviewFilters {
	instructorId?: number;
	rating?: number;
	dateFrom?: Date;
	dateTo?: Date;
}

export const adminReviewService = {
	/**
	 * Get all reviews with filters and pagination
	 */
	async getAllReviews(filters: ReviewFilters = {}, page: number = 1, pageSize: number = 50) {
		const offset = (page - 1) * pageSize;

		// Build where conditions
		const conditions: any[] = [];

		if (filters.instructorId) {
			conditions.push(eq(reviews.instructorId, filters.instructorId));
		}

		if (filters.rating) {
			conditions.push(eq(reviews.rating, filters.rating));
		}

		if (filters.dateFrom) {
			conditions.push(gte(reviews.createdAt, filters.dateFrom));
		}

		if (filters.dateTo) {
			conditions.push(lte(reviews.createdAt, filters.dateTo));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const allReviews = await db.query.reviews.findMany({
			where: whereClause,
			limit: pageSize,
			offset,
			orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
			with: {
				instructor: {
					columns: {
						id: true,
						name: true,
						lastName: true,
						email: true
					}
				},
				bookingRequest: {
					columns: {
						id: true,
						clientName: true,
						startDate: true,
						status: true
					}
				}
			}
		});

		// Get total count
		const totalResult = await db
			.select({ count: count() })
			.from(reviews)
			.where(whereClause);

		const total = totalResult[0]?.count || 0;

		return {
			reviews: allReviews,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize)
			}
		};
	},

	/**
	 * Get single review details
	 */
	async getReviewById(reviewId: number) {
		const review = await db.query.reviews.findFirst({
			where: eq(reviews.id, reviewId),
			with: {
				instructor: true,
				bookingRequest: true
			}
		});

		if (!review) {
			return null;
		}

		// Get audit logs
		const auditLogs = await adminAuditService.getLogsByTarget('review', reviewId, 10);

		return {
			review,
			auditLogs
		};
	},

	/**
	 * Delete a review (soft delete by setting deletedAt)
	 */
	async deleteReview(reviewId: number, adminId: number, reason: string, event?: any) {
		await db
			.update(reviews)
			.set({
				deletedAt: new Date()
			})
			.where(eq(reviews.id, reviewId));

		// Log the action
		await adminAuditService.logAction({
			adminId,
			action: 'delete_review',
			targetType: 'review',
			targetId: reviewId,
			details: { reason },
			event
		});

		return { success: true };
	},

	/**
	 * Get review statistics
	 */
	async getReviewStatistics() {
		// Reviews by rating
		const byRating = await db
			.select({
				rating: reviews.rating,
				count: count()
			})
			.from(reviews)
			.groupBy(reviews.rating);

		// Average rating
		const avgResult = await db
			.select({
				avg: count()
			})
			.from(reviews);

		return {
			byRating,
			totalReviews: avgResult[0]?.avg || 0
		};
	}
};
