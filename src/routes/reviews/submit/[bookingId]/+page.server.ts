import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BookingRequestRepository } from '$src/features/Bookings/lib/bookingRequestRepository';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';

const bookingRepo = new BookingRequestRepository();
const reviewService = new ReviewService();

export const load: PageServerLoad = async ({ params, url }) => {
	const bookingId = parseInt(params.bookingId);
	const clientEmail = url.searchParams.get('email');

	if (isNaN(bookingId)) {
		throw error(400, 'Invalid booking ID');
	}

	if (!clientEmail) {
		throw error(400, 'Email parameter is required');
	}

	try {
		// Get booking details
		const booking = await bookingRepo.getBookingRequestById(bookingId);

		if (!booking) {
			throw error(404, 'Booking not found');
		}

		// Verify email matches
		if (booking.clientEmail !== clientEmail) {
			throw error(403, 'Email does not match booking');
		}

		// Check if review already exists
		const existingReview = await reviewService.hasReview(bookingId);

		// Check if client can leave a review
		const eligibility = await reviewService.canLeaveReview(bookingId, clientEmail);

		return {
			booking,
			clientEmail,
			canReview: eligibility.canReview,
			reason: eligibility.reason,
			alreadyReviewed: existingReview
		};
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Error loading review page:', err);
		throw error(500, 'Failed to load review page');
	}
};
