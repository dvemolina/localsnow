// src/routes/admin/dashboard/+page.server.ts
import { adminStatsService } from '$src/features/Admin/lib/adminStatsService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [
		stats,
		businessKpis,
		funnelMetrics,
		pendingVerifications,
		recentBookings,
		recentReviews,
		suspendedUsers
	] = await Promise.all([
		adminStatsService.getPlatformStats(),
		adminStatsService.getBusinessKpis(),
		adminStatsService.getFunnelMetrics(30),
		adminStatsService.getPendingVerifications(),
		adminStatsService.getRecentBookings(10),
		adminStatsService.getRecentReviews(5),
		adminStatsService.getSuspendedUsers()
	]);

	return {
		stats,
		businessKpis,
		funnelMetrics,
		pendingVerifications,
		recentBookings,
		recentReviews,
		suspendedUsers
	};
};
