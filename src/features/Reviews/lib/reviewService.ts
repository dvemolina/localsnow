import { ReviewRepository } from './reviewRepository';
import { BookingRequestRepository } from '$src/features/Bookings/lib/bookingRequestRepository';
import type { SubmitReviewInput } from './reviewSchema';

export class ReviewService {
	private reviewRepo: ReviewRepository;
	private bookingRepo: BookingRequestRepository;

	constructor() {
		this.reviewRepo = new ReviewRepository();
		this.bookingRepo = new BookingRequestRepository();
	}

	/**
	 * Submit a review for a booking
	 * Validates that:
	 * 1. Booking exists and matches the client email
	 * 2. Booking has been accepted by instructor
	 * 3. Lesson date has passed (at least 1 hour ago)
	 * 4. No review already exists for this booking
	 */
	async submitReview(input: SubmitReviewInput) {
		// Get the booking request
		const booking = await this.bookingRepo.getBookingRequestById(input.bookingRequestId);

		if (!booking) {
			throw new Error('Booking not found');
		}

		// Verify client email matches
		if (booking.clientEmail !== input.clientEmail) {
			throw new Error('Email does not match booking');
		}

		// Check if booking was accepted
		if (booking.status !== 'accepted' && booking.status !== 'completed') {
			throw new Error('Booking must be accepted before leaving a review');
		}

		// Check if lesson date has passed (at least 1 hour after end date or start date)
		const lessonEndDate = booking.endDate || booking.startDate;
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		if (new Date(lessonEndDate) > oneHourAgo) {
			throw new Error('You can leave a review 1 hour after the lesson ends');
		}

		// Check if review already exists
		const existingReview = await this.reviewRepo.getReviewByBookingId(input.bookingRequestId);
		if (existingReview) {
			throw new Error('Review already exists for this booking');
		}

		// Create the review
		const review = await this.reviewRepo.createReview({
			bookingRequestId: input.bookingRequestId,
			instructorId: booking.instructorId,
			clientEmail: input.clientEmail,
			rating: input.rating,
			comment: input.comment
		});

		return review;
	}

	/**
	 * Check if a client can leave a review for a booking
	 */
	async canLeaveReview(bookingRequestId: number, clientEmail: string): Promise<{
		canReview: boolean;
		reason?: string;
	}> {
		const booking = await this.bookingRepo.getBookingRequestById(bookingRequestId);

		if (!booking) {
			return { canReview: false, reason: 'Booking not found' };
		}

		if (booking.clientEmail !== clientEmail) {
			return { canReview: false, reason: 'Email does not match booking' };
		}

		if (booking.status !== 'accepted' && booking.status !== 'completed') {
			return { canReview: false, reason: 'Booking must be accepted first' };
		}

		const existingReview = await this.reviewRepo.getReviewByBookingId(bookingRequestId);
		if (existingReview) {
			return { canReview: false, reason: 'Review already submitted' };
		}

		const lessonEndDate = booking.endDate || booking.startDate;
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		if (new Date(lessonEndDate) > oneHourAgo) {
			return { canReview: false, reason: 'Review available 1 hour after lesson ends' };
		}

		return { canReview: true };
	}

	/**
	 * Get reviews for an instructor with pagination
	 */
	async getInstructorReviews(instructorId: number, limit = 10, offset = 0) {
		return await this.reviewRepo.getInstructorReviews(instructorId, limit, offset);
	}

	/**
	 * Get instructor rating statistics
	 */
	async getInstructorStats(instructorId: number) {
		return await this.reviewRepo.getInstructorRatingStats(instructorId);
	}

	/**
	 * Check if review exists for a booking (used by deposit refund logic)
	 */
	async hasReview(bookingRequestId: number): Promise<boolean> {
		return await this.reviewRepo.reviewExists(bookingRequestId);
	}
}
