import { db } from '$lib/server/db';
import { instructorReviews, bookingRequests, users } from '$lib/server/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { InsertInstructorReview } from '$lib/server/db/schema';

export interface CreateReviewData {
	bookingRequestId: number;
	instructorId: number;
	clientName?: string;
	clientEmail: string;
	rating: number;
	comment?: string;
}

export class ReviewRepository {
	/**
	 * Create a new review
	 */
	async createReview(data: CreateReviewData) {
		const [review] = await db
			.insert(instructorReviews)
			.values({
				bookingId: data.bookingRequestId,
				instructorId: data.instructorId,
				clientName: data.clientName || null,
				clientEmail: data.clientEmail,
				rating: data.rating,
				comment: data.comment || null,
				isVerified: true,
				isPublished: true // Auto-publish verified reviews
			})
			.returning();

		return review;
	}

	/**
	 * Get review by booking request ID
	 */
	async getReviewByBookingId(bookingRequestId: number) {
		const [review] = await db
			.select()
			.from(instructorReviews)
			.where(eq(instructorReviews.bookingId, bookingRequestId));

		return review;
	}

	/**
	 * Get all published reviews for an instructor with reviewer profile data
	 */
	async getInstructorReviews(instructorId: number, limit = 10, offset = 0) {
		const reviews = await db
			.select({
				id: instructorReviews.id,
				uuid: instructorReviews.uuid,
				instructorId: instructorReviews.instructorId,
				reviewerId: instructorReviews.reviewerId,
				bookingId: instructorReviews.bookingId,
				clientName: instructorReviews.clientName,
				clientEmail: instructorReviews.clientEmail,
				rating: instructorReviews.rating,
				comment: instructorReviews.comment,
				isVerified: instructorReviews.isVerified,
				isPublished: instructorReviews.isPublished,
				createdAt: instructorReviews.createdAt,
				updatedAt: instructorReviews.updatedAt,
				// Fetch reviewer profile data if they have an account
				reviewerName: users.name,
				reviewerLastName: users.lastName,
				reviewerProfileImage: users.profileImageUrl
			})
			.from(instructorReviews)
			.leftJoin(users, eq(instructorReviews.reviewerId, users.id))
			.where(
				and(
					eq(instructorReviews.instructorId, instructorId),
					eq(instructorReviews.isPublished, true)
				)
			)
			.orderBy(desc(instructorReviews.createdAt))
			.limit(limit)
			.offset(offset);

		console.log(`📊 getInstructorReviews for instructor ${instructorId}:`, {
			count: reviews.length,
			reviews: reviews.map(r => ({
				id: r.id,
				rating: r.rating,
				isPublished: r.isPublished,
				hasAccount: !!r.reviewerId
			}))
		});

		return reviews;
	}

	/**
	 * Get instructor rating statistics (only published reviews)
	 */
	async getInstructorRatingStats(instructorId: number) {
		const [stats] = await db
			.select({
				averageRating: sql<number>`ROUND(AVG(${instructorReviews.rating})::numeric, 2)`,
				totalReviews: sql<number>`COUNT(*)::int`,
				fiveStarCount: sql<number>`COUNT(CASE WHEN ${instructorReviews.rating} = 5 THEN 1 END)::int`,
				fourStarCount: sql<number>`COUNT(CASE WHEN ${instructorReviews.rating} = 4 THEN 1 END)::int`,
				threeStarCount: sql<number>`COUNT(CASE WHEN ${instructorReviews.rating} = 3 THEN 1 END)::int`,
				twoStarCount: sql<number>`COUNT(CASE WHEN ${instructorReviews.rating} = 2 THEN 1 END)::int`,
				oneStarCount: sql<number>`COUNT(CASE WHEN ${instructorReviews.rating} = 1 THEN 1 END)::int`
			})
			.from(instructorReviews)
			.where(
				and(
					eq(instructorReviews.instructorId, instructorId),
					eq(instructorReviews.isPublished, true)
				)
			);

		// If no reviews, return null
		if (!stats || stats.totalReviews === 0) {
			return null;
		}

		// Convert averageRating to number if it's a string (PostgreSQL numeric type)
		return {
			...stats,
			averageRating: stats.averageRating ? Number(stats.averageRating) : 0
		};
	}

	/**
	 * Check if a review already exists for a booking
	 */
	async reviewExists(bookingRequestId: number): Promise<boolean> {
		const review = await this.getReviewByBookingId(bookingRequestId);
		return !!review;
	}

	/**
	 * Delete review (admin only)
	 */
	async deleteReview(reviewId: number) {
		return await db.delete(instructorReviews).where(eq(instructorReviews.id, reviewId));
	}
}
