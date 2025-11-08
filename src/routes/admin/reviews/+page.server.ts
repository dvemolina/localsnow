// src/routes/admin/reviews/+page.server.ts
import { adminReviewService } from '$src/features/Admin/lib/adminReviewService';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const result = await adminReviewService.getAllReviews({}, page, 50);
	return result;
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const reviewId = parseInt(formData.get('reviewId') as string);
		const reason = formData.get('reason') as string;

		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminReviewService.deleteReview(reviewId, locals.user.id, reason);
		return { success: true };
	}
};
