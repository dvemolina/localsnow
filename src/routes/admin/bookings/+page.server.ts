// src/routes/admin/bookings/+page.server.ts
import { adminBookingService } from '$src/features/Admin/lib/adminBookingService';
import { fail } from '@sveltejs/kit';
import { hasRole } from '$src/lib/utils/roles';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const status = url.searchParams.get('status') || undefined;
	const search = url.searchParams.get('search') || undefined;

	const filters = { status, search };
	const result = await adminBookingService.getAllBookings(filters, page, 30);

	return { ...result, filters };
};

export const actions: Actions = {
	cancel: async ({ request, locals }) => {
		const formData = await request.formData();
		const bookingId = parseInt(formData.get('bookingId') as string);
		const reason = formData.get('reason') as string;

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		await adminBookingService.cancelBooking(bookingId, locals.user.id, reason);
		return { success: true, message: 'Booking cancelled' };
	},

	refund: async ({ request, locals }) => {
		const formData = await request.formData();
		const bookingId = parseInt(formData.get('bookingId') as string);

		if (!locals.user || !hasRole(locals.user, 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const result = await adminBookingService.refundDeposit(bookingId, locals.user.id);
		return result;
	}
};
