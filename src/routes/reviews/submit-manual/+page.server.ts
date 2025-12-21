import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ReviewService } from '$src/features/Reviews/lib/reviewService';
import { InstructorLessonService } from '$src/features/InstructorLessons/lib/instructorLessonService';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { submitManualReviewSchema } from '$src/features/Reviews/lib/reviewSchema';

export const load: PageServerLoad = async ({ url }) => {
	// Get token from URL search params
	const token = url.searchParams.get('token');

	if (!token || token.length !== 64) {
		throw error(404, 'Invalid or missing review link');
	}

	try {
		// Get lesson by token
		const lessonService = new InstructorLessonService();
		const lesson = await lessonService.getLessonByReviewToken(token);

		if (!lesson) {
			throw error(404, 'Invalid or expired review link');
		}

		// Check if review already exists
		const reviewService = new ReviewService();
		const reviewRepo = reviewService['reviewRepo']; // Access private property
		const existingReview = await reviewRepo.getReviewByInstructorLessonId(lesson.id);

		if (existingReview) {
			throw error(400, 'A review has already been submitted for this lesson');
		}

		// Initialize form with token
		const form = await superValidate({ token }, zod(submitManualReviewSchema));

		// Return lesson data for display
		return {
			form,
			lesson: {
				instructorName: `${lesson.instructor.name} ${lesson.instructor.lastName}`,
				lessonDate: lesson.lessonDate,
				sport: lesson.sport,
				clientName: lesson.clientName,
				duration: lesson.duration,
				numberOfStudents: lesson.numberOfStudents
			}
		};
	} catch (err: any) {
		console.error('Error loading review form:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, 'Failed to load review form');
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(submitManualReviewSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const reviewService = new ReviewService();
			await reviewService.submitManualLessonReview(form.data);

			// Redirect to thank you page
			throw redirect(303, '/reviews/thank-you');
		} catch (err: any) {
			console.error('Error submitting review:', err);

			// Return form with error message
			return message(form, err.message || 'Failed to submit review', {
				status: 400
			});
		}
	}
};
