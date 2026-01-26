import type { PageServerLoad, Actions } from './$types';
import { adminResortRequestService } from '$src/features/Admin/lib/adminResortRequestService';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const status = url.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;

	const { requests, pagination } = await adminResortRequestService.getAllResortRequests(
		{ status },
		page,
		50
	);

	const stats = await adminResortRequestService.getResortRequestStats();

	return {
		requests,
		pagination,
		stats,
		filters: {
			status
		}
	};
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const requestId = parseInt(formData.get('requestId') as string);

		if (!requestId) {
			return fail(400, { error: 'Request ID is required' });
		}

		try {
			await adminResortRequestService.approveResortRequest(requestId, user.id);
			return { success: true, message: 'Resort request approved successfully' };
		} catch (error) {
			console.error('Failed to approve resort request:', error);
			return fail(500, { error: 'Failed to approve resort request' });
		}
	},

	reject: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const requestId = parseInt(formData.get('requestId') as string);
		const reason = formData.get('reason') as string;

		if (!requestId || !reason) {
			return fail(400, { error: 'Request ID and reason are required' });
		}

		try {
			await adminResortRequestService.rejectResortRequest(requestId, user.id, reason);
			return { success: true, message: 'Resort request rejected' };
		} catch (error) {
			console.error('Failed to reject resort request:', error);
			return fail(500, { error: 'Failed to reject resort request' });
		}
	}
};
