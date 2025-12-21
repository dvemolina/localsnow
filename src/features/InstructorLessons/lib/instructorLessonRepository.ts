import { db } from '$lib/server/db';
import { instructorLessons, reviews, resorts, users } from '$lib/server/db/schema';
import type { InstructorLesson, InsertInstructorLesson } from '$lib/server/db/schema';
import { eq, and, isNull, desc, sql, gt } from 'drizzle-orm';
import crypto from 'crypto';

export interface LessonWithRelations extends InstructorLesson {
	review?: {
		id: number;
		rating: number;
		comment: string | null;
		createdAt: Date | null;
	} | null;
	resort?: {
		id: number;
		name: string;
		slug: string;
	} | null;
	instructor?: {
		id: number;
		name: string;
		lastName: string;
		profileImageUrl: string | null;
	} | null;
}

export interface LessonWithInstructor extends InstructorLesson {
	instructor: {
		id: number;
		name: string;
		lastName: string;
		profileImageUrl: string | null;
	};
}

export interface ClientSummary {
	clientName: string;
	clientEmail: string;
	clientPhone: string | null;
	clientCountryCode: string | null;
	lessonCount: number;
	totalHours: number;
	lastLessonDate: Date;
	hasReview: boolean;
}

export interface CreateLessonData {
	instructorId: number;
	clientName: string;
	clientEmail: string;
	clientCountryCode?: string;
	clientPhone?: string;
	lessonDate: Date;
	duration: number;
	numberOfStudents: number;
	sport?: string;
	skillLevel?: string;
	resortId?: number;
	resortName?: string;
	instructorNotes?: string;
	source?: 'manual' | 'marketplace';
	bookingRequestId?: number;
}

export class InstructorLessonRepository {
	/**
	 * Create a new instructor lesson
	 * Generates a secure review token automatically
	 */
	async createLesson(data: CreateLessonData): Promise<InstructorLesson> {
		// Generate secure review token (32 random bytes = 64 hex chars)
		const reviewToken = crypto.randomBytes(32).toString('hex');

		// Normalize email to lowercase and trim
		const normalizedEmail = data.clientEmail.toLowerCase().trim();

		const [lesson] = await db
			.insert(instructorLessons)
			.values({
				instructorId: data.instructorId,
				clientName: data.clientName,
				clientEmail: normalizedEmail,
				clientCountryCode: data.clientCountryCode || null,
				clientPhone: data.clientPhone || null,
				lessonDate: data.lessonDate,
				duration: data.duration.toString(),
				numberOfStudents: data.numberOfStudents,
				sport: data.sport || null,
				skillLevel: data.skillLevel || null,
				resortId: data.resortId || null,
				resortName: data.resortName || null,
				instructorNotes: data.instructorNotes || null,
				source: data.source || 'manual',
				bookingRequestId: data.bookingRequestId || null,
				reviewToken,
				updatedAt: new Date()
			})
			.returning();

		return lesson;
	}

	/**
	 * Get all lessons for an instructor with related data
	 * Includes review status, resort info, etc.
	 */
	async getInstructorLessons(
		instructorId: number,
		includeDeleted = false
	): Promise<LessonWithRelations[]> {
		const whereConditions = includeDeleted
			? [eq(instructorLessons.instructorId, instructorId)]
			: [
					eq(instructorLessons.instructorId, instructorId),
					isNull(instructorLessons.deletedAt)
			  ];

		const lessonsData = await db
			.select({
				lesson: instructorLessons,
				review: {
					id: reviews.id,
					rating: reviews.rating,
					comment: reviews.comment,
					createdAt: reviews.createdAt
				},
				resort: {
					id: resorts.id,
					name: resorts.name,
					slug: resorts.slug
				}
			})
			.from(instructorLessons)
			.leftJoin(
				reviews,
				eq(instructorLessons.id, reviews.instructorLessonId)
			)
			.leftJoin(resorts, eq(instructorLessons.resortId, resorts.id))
			.where(and(...whereConditions))
			.orderBy(desc(instructorLessons.lessonDate));

		return lessonsData.map((row) => ({
			...row.lesson,
			review: row.review.id ? row.review : null,
			resort: row.resort.id ? row.resort : null
		})) as LessonWithRelations[];
	}

	/**
	 * Get unique clients for an instructor with aggregated stats
	 * Returns client contact info + lesson count, total hours, last lesson date
	 */
	async getInstructorClients(instructorId: number): Promise<ClientSummary[]> {
		const clientStats = await db
			.select({
				clientName: sql<string>`MAX(${instructorLessons.clientName})`,
				clientEmail: instructorLessons.clientEmail,
				clientPhone: sql<string | null>`MAX(${instructorLessons.clientPhone})`,
				clientCountryCode: sql<string | null>`MAX(${instructorLessons.clientCountryCode})`,
				lessonCount: sql<number>`COUNT(*)::int`,
				totalHours: sql<number>`SUM(${instructorLessons.duration})::numeric`,
				lastLessonDate: sql<Date>`MAX(${instructorLessons.lessonDate})`,
				hasReview: sql<boolean>`BOOL_OR(${reviews.id} IS NOT NULL)`
			})
			.from(instructorLessons)
			.leftJoin(
				reviews,
				eq(instructorLessons.id, reviews.instructorLessonId)
			)
			.where(
				and(
					eq(instructorLessons.instructorId, instructorId),
					isNull(instructorLessons.deletedAt)
				)
			)
			.groupBy(instructorLessons.clientEmail)
			.orderBy(desc(sql`MAX(${instructorLessons.lessonDate})`));

		return clientStats as ClientSummary[];
	}

	/**
	 * Get lesson by review token
	 * Used for public review submission page
	 */
	async getLessonByReviewToken(token: string): Promise<LessonWithInstructor | null> {
		const result = await db
			.select({
				lesson: instructorLessons,
				instructor: {
					id: users.id,
					name: users.name,
					lastName: users.lastName,
					profileImageUrl: users.profileImageUrl
				}
			})
			.from(instructorLessons)
			.innerJoin(users, eq(instructorLessons.instructorId, users.id))
			.where(
				and(
					eq(instructorLessons.reviewToken, token),
					isNull(instructorLessons.deletedAt)
				)
			)
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		const { lesson, instructor } = result[0];
		return {
			...lesson,
			instructor
		};
	}

	/**
	 * Get lesson by ID with optional ownership check
	 */
	async getLessonById(
		id: number,
		instructorId?: number
	): Promise<LessonWithRelations | null> {
		const whereConditions = instructorId
			? [
					eq(instructorLessons.id, id),
					eq(instructorLessons.instructorId, instructorId),
					isNull(instructorLessons.deletedAt)
			  ]
			: [eq(instructorLessons.id, id), isNull(instructorLessons.deletedAt)];

		const result = await db
			.select({
				lesson: instructorLessons,
				review: {
					id: reviews.id,
					rating: reviews.rating,
					comment: reviews.comment,
					createdAt: reviews.createdAt
				},
				resort: {
					id: resorts.id,
					name: resorts.name,
					slug: resorts.slug
				},
				instructor: {
					id: users.id,
					name: users.name,
					lastName: users.lastName,
					profileImageUrl: users.profileImageUrl
				}
			})
			.from(instructorLessons)
			.leftJoin(
				reviews,
				eq(instructorLessons.id, reviews.instructorLessonId)
			)
			.leftJoin(resorts, eq(instructorLessons.resortId, resorts.id))
			.leftJoin(users, eq(instructorLessons.instructorId, users.id))
			.where(and(...whereConditions))
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		const row = result[0];
		return {
			...row.lesson,
			review: row.review.id ? row.review : null,
			resort: row.resort.id ? row.resort : null,
			instructor: row.instructor.id ? row.instructor : null
		} as LessonWithRelations;
	}

	/**
	 * Update lesson data
	 */
	async updateLesson(
		id: number,
		data: Partial<InsertInstructorLesson>
	): Promise<InstructorLesson> {
		const [updated] = await db
			.update(instructorLessons)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(instructorLessons.id, id))
			.returning();

		return updated;
	}

	/**
	 * Mark review request as sent for a lesson
	 */
	async markReviewRequestSent(id: number): Promise<InstructorLesson> {
		const [updated] = await db
			.update(instructorLessons)
			.set({
				reviewRequestSent: true,
				reviewRequestSentAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(instructorLessons.id, id))
			.returning();

		return updated;
	}

	/**
	 * Soft delete a lesson (sets deletedAt timestamp)
	 * Reviews are preserved even if lesson is deleted
	 */
	async deleteLesson(id: number): Promise<void> {
		await db
			.update(instructorLessons)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(instructorLessons.id, id));
	}

	/**
	 * Get lesson by booking request ID
	 * Used for marketplace integration
	 */
	async getLessonByBookingRequestId(bookingRequestId: number): Promise<InstructorLesson | null> {
		const [lesson] = await db
			.select()
			.from(instructorLessons)
			.where(eq(instructorLessons.bookingRequestId, bookingRequestId))
			.limit(1);

		return lesson || null;
	}
}
