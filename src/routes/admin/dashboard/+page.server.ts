// src/routes/admin/dashboard/+page.server.ts
import { adminStatsService } from '$src/features/Admin/lib/adminStatsService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [stats, pendingVerifications, recentBookings, recentReviews, suspendedUsers] = await Promise.all([
		adminStatsService.getPlatformStats(),
		adminStatsService.getPendingVerifications(),
		adminStatsService.getRecentBookings(10),
		adminStatsService.getRecentReviews(5),
		adminStatsService.getSuspendedUsers()
	]);

	return {
		stats,
		pendingVerifications,
		recentBookings,
		recentReviews,
		suspendedUsers
	};
};
