import { db } from '$lib/server/db';
import { reviews, bookingRequests, users } from '$lib/server/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { InsertReview } from '$lib/server/db/schema';

export interface CreateReviewData {
	bookingRequestId: number;
	instructorId: number;
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
			.insert(reviews)
			.values({
				bookingRequestId: data.bookingRequestId,
				instructorId: data.instructorId,
				clientEmail: data.clientEmail,
				rating: data.rating,
				comment: data.comment || null
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
			.from(reviews)
			.where(eq(reviews.bookingRequestId, bookingRequestId));

		return review;
	}

	/**
	 * Get all reviews for an instructor
	 */
	async getInstructorReviews(instructorId: number, limit = 10, offset = 0) {
		return await db
			.select()
			.from(reviews)
			.where(eq(reviews.instructorId, instructorId))
			.orderBy(desc(reviews.createdAt))
			.limit(limit)
			.offset(offset);
	}

	/**
	 * Get instructor rating statistics
	 */
	async getInstructorRatingStats(instructorId: number) {
		const [stats] = await db
			.select({
				averageRating: sql<number>`ROUND(AVG(${reviews.rating})::numeric, 2)`,
				totalReviews: sql<number>`COUNT(*)::int`,
				fiveStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 5 THEN 1 END)::int`,
				fourStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 4 THEN 1 END)::int`,
				threeStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 3 THEN 1 END)::int`,
				twoStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 2 THEN 1 END)::int`,
				oneStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 1 THEN 1 END)::int`
			})
			.from(reviews)
			.where(eq(reviews.instructorId, instructorId));

		return stats || null;
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
		return await db.delete(reviews).where(eq(reviews.id, reviewId));
	}
}
