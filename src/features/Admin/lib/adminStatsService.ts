// src/features/Admin/lib/adminStatsService.ts
import { db } from '$lib/server/db';
import {
	users,
	bookingRequests,
	instructorReviews,
	clientDeposits,
	leadPayments,
	userRoles,
	instructorResorts,
	resorts,
	countries,
	funnelEvents
} from '$lib/server/db/schema';
import { sql, eq, count, sum, and, gte, inArray } from 'drizzle-orm';

export const adminStatsService = {
	/**
	 * Get platform overview statistics
	 */
	async getPlatformStats() {
		// Total users by role
		const userStats = await db
			.select({
				role: userRoles.role,
				count: count()
			})
			.from(userRoles)
			.groupBy(userRoles.role);

		// Total instructors (verified vs unverified)
		const instructorStats = await db
			.select({
				isVerified: users.isVerified,
				count: count()
			})
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.where(inArray(userRoles.role, ['instructor-independent', 'instructor-school']))
			.groupBy(users.isVerified);

		// Booking statistics by status
		const bookingStats = await db
			.select({
				status: bookingRequests.status,
				count: count()
			})
			.from(bookingRequests)
			.groupBy(bookingRequests.status);

		// Total revenue from deposits (held + forfeited)
		const depositRevenue = await db
			.select({
				total: sum(clientDeposits.amount),
				status: clientDeposits.status
			})
			.from(clientDeposits)
			.groupBy(clientDeposits.status);

		// Total revenue from lead payments
		const leadRevenue = await db
			.select({
				total: sum(leadPayments.amount),
				status: leadPayments.status
			})
			.from(leadPayments)
			.groupBy(leadPayments.status);

		// Review statistics
		const reviewStats = await db
			.select({
				total: count(),
				avgRating: sql<number>`AVG(${instructorReviews.rating})`
			})
			.from(instructorReviews);

		// Get recent activity (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentBookings = await db
			.select({ count: count() })
			.from(bookingRequests)
			.where(gte(bookingRequests.createdAt, thirtyDaysAgo));

		const recentUsers = await db
			.select({ count: count() })
			.from(users)
			.where(gte(users.createdAt, thirtyDaysAgo));

		return {
			userStats,
			instructorStats,
			bookingStats,
			depositRevenue,
			leadRevenue,
			reviewStats: reviewStats[0] || { total: 0, avgRating: 0 },
			recentActivity: {
				bookings: recentBookings[0]?.count || 0,
				users: recentUsers[0]?.count || 0
			}
		};
	},

	/**
	 * Business operating KPIs from first-party data (Spain + Global).
	 * No third-party trackers or analytics cookies are required.
	 */
	async getBusinessKpis() {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const safeDiv = (num: number, den: number) => (den > 0 ? num / den : 0);

		const instructorSignupsGlobalAllTime = await db
			.select({ count: sql<number>`count(distinct ${users.id})` })
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.where(sql`${userRoles.role} in ('instructor-independent', 'instructor-school')`);

		const instructorSignupsGlobal30d = await db
			.select({ count: sql<number>`count(distinct ${users.id})` })
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.where(
				and(
					sql`${userRoles.role} in ('instructor-independent', 'instructor-school')`,
					gte(users.createdAt, thirtyDaysAgo)
				)
			);

		const instructorSignupsSpainAllTime = await db
			.select({ count: sql<number>`count(distinct ${users.id})` })
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.leftJoin(instructorResorts, eq(instructorResorts.instructorId, users.id))
			.leftJoin(resorts, eq(instructorResorts.resortId, resorts.id))
			.leftJoin(countries, eq(resorts.countryId, countries.id))
			.where(
				and(
					sql`${userRoles.role} in ('instructor-independent', 'instructor-school')`,
					sql`(
							upper(cast(${users.countryCode} as text)) = 'ES'
							or upper(cast(${users.professionalCountryCode} as text)) = 'ES'
							or ${countries.countrySlug} = 'spain'
						)`
				)
			);

		const instructorSignupsSpain30d = await db
			.select({ count: sql<number>`count(distinct ${users.id})` })
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.leftJoin(instructorResorts, eq(instructorResorts.instructorId, users.id))
			.leftJoin(resorts, eq(instructorResorts.resortId, resorts.id))
			.leftJoin(countries, eq(resorts.countryId, countries.id))
			.where(
				and(
					sql`${userRoles.role} in ('instructor-independent', 'instructor-school')`,
					gte(users.createdAt, thirtyDaysAgo),
					sql`(
							upper(cast(${users.countryCode} as text)) = 'ES'
							or upper(cast(${users.professionalCountryCode} as text)) = 'ES'
							or ${countries.countrySlug} = 'spain'
						)`
				)
			);

		const totalRequestsGlobal30d = await db
			.select({ count: sql<number>`count(distinct ${bookingRequests.id})` })
			.from(bookingRequests)
			.where(gte(bookingRequests.createdAt, thirtyDaysAgo));

		const totalRequestsSpain30d = await db
			.select({ count: sql<number>`count(distinct ${bookingRequests.id})` })
			.from(bookingRequests)
			.innerJoin(
				instructorResorts,
				eq(instructorResorts.instructorId, bookingRequests.instructorId)
			)
			.innerJoin(resorts, eq(instructorResorts.resortId, resorts.id))
			.innerJoin(countries, eq(resorts.countryId, countries.id))
			.where(
				and(eq(countries.countrySlug, 'spain'), gte(bookingRequests.createdAt, thirtyDaysAgo))
			);

		const qualifiedRequestsGlobalAllTime = await db
			.select({ count: sql<number>`count(distinct ${bookingRequests.id})` })
			.from(bookingRequests)
			.where(
				and(
					eq(bookingRequests.contactInfoUnlocked, true),
					sql`${bookingRequests.status} in ('pending', 'viewed', 'accepted', 'completed', 'no_show')`
				)
			);

		const qualifiedRequestsGlobal30d = await db
			.select({ count: sql<number>`count(distinct ${bookingRequests.id})` })
			.from(bookingRequests)
			.where(
				and(
					gte(bookingRequests.createdAt, thirtyDaysAgo),
					eq(bookingRequests.contactInfoUnlocked, true),
					sql`${bookingRequests.status} in ('pending', 'viewed', 'accepted', 'completed', 'no_show')`
				)
			);

		const qualifiedRequestsSpainAllTime = await db
			.select({ count: sql<number>`count(distinct ${bookingRequests.id})` })
			.from(bookingRequests)
			.innerJoin(
				instructorResorts,
				eq(instructorResorts.instructorId, bookingRequests.instructorId)
			)
			.innerJoin(resorts, eq(instructorResorts.resortId, resorts.id))
			.innerJoin(countries, eq(resorts.countryId, countries.id))
			.where(
				and(
					eq(countries.countrySlug, 'spain'),
					eq(bookingRequests.contactInfoUnlocked, true),
					sql`${bookingRequests.status} in ('pending', 'viewed', 'accepted', 'completed', 'no_show')`
				)
			);

		const qualifiedRequestsSpain30d = await db
			.select({ count: sql<number>`count(distinct ${bookingRequests.id})` })
			.from(bookingRequests)
			.innerJoin(
				instructorResorts,
				eq(instructorResorts.instructorId, bookingRequests.instructorId)
			)
			.innerJoin(resorts, eq(instructorResorts.resortId, resorts.id))
			.innerJoin(countries, eq(resorts.countryId, countries.id))
			.where(
				and(
					eq(countries.countrySlug, 'spain'),
					gte(bookingRequests.createdAt, thirtyDaysAgo),
					eq(bookingRequests.contactInfoUnlocked, true),
					sql`${bookingRequests.status} in ('pending', 'viewed', 'accepted', 'completed', 'no_show')`
				)
			);

		const publishedInstructorsGlobal = await db
			.select({ count: sql<number>`count(distinct ${users.id})` })
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.where(
				and(
					sql`${userRoles.role} in ('instructor-independent', 'instructor-school')`,
					eq(users.isPublished, true),
					eq(users.isSuspended, false)
				)
			);

		const publishedInstructorsSpain = await db
			.select({ count: sql<number>`count(distinct ${users.id})` })
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.leftJoin(instructorResorts, eq(instructorResorts.instructorId, users.id))
			.leftJoin(resorts, eq(instructorResorts.resortId, resorts.id))
			.leftJoin(countries, eq(resorts.countryId, countries.id))
			.where(
				and(
					sql`${userRoles.role} in ('instructor-independent', 'instructor-school')`,
					eq(users.isPublished, true),
					eq(users.isSuspended, false),
					sql`(
						upper(cast(${users.countryCode} as text)) = 'ES'
						or upper(cast(${users.professionalCountryCode} as text)) = 'ES'
						or ${countries.countrySlug} = 'spain'
					)`
				)
			);

		const instructorSignupsGlobalAllTimeCount = Number(
			instructorSignupsGlobalAllTime[0]?.count || 0
		);
		const instructorSignupsGlobal30dCount = Number(instructorSignupsGlobal30d[0]?.count || 0);
		const instructorSignupsSpainAllTimeCount = Number(instructorSignupsSpainAllTime[0]?.count || 0);
		const instructorSignupsSpain30dCount = Number(instructorSignupsSpain30d[0]?.count || 0);

		const totalRequestsGlobal30dCount = Number(totalRequestsGlobal30d[0]?.count || 0);
		const totalRequestsSpain30dCount = Number(totalRequestsSpain30d[0]?.count || 0);

		const qualifiedRequestsGlobalAllTimeCount = Number(
			qualifiedRequestsGlobalAllTime[0]?.count || 0
		);
		const qualifiedRequestsGlobal30dCount = Number(qualifiedRequestsGlobal30d[0]?.count || 0);
		const qualifiedRequestsSpainAllTimeCount = Number(qualifiedRequestsSpainAllTime[0]?.count || 0);
		const qualifiedRequestsSpain30dCount = Number(qualifiedRequestsSpain30d[0]?.count || 0);

		const publishedInstructorsGlobalCount = Number(publishedInstructorsGlobal[0]?.count || 0);
		const publishedInstructorsSpainCount = Number(publishedInstructorsSpain[0]?.count || 0);

		return {
			acquisition: {
				instructorSignups: {
					global: {
						allTime: instructorSignupsGlobalAllTimeCount,
						last30Days: instructorSignupsGlobal30dCount
					},
					spain: {
						allTime: instructorSignupsSpainAllTimeCount,
						last30Days: instructorSignupsSpain30dCount
					},
					spainShareLast30DaysPct: safeDiv(
						instructorSignupsSpain30dCount,
						instructorSignupsGlobal30dCount
					)
				}
			},
			demand: {
				lessonRequests30Days: {
					global: totalRequestsGlobal30dCount,
					spain: totalRequestsSpain30dCount
				},
				qualifiedLessonRequests: {
					global: {
						allTime: qualifiedRequestsGlobalAllTimeCount,
						last30Days: qualifiedRequestsGlobal30dCount
					},
					spain: {
						allTime: qualifiedRequestsSpainAllTimeCount,
						last30Days: qualifiedRequestsSpain30dCount
					},
					spainShareLast30DaysPct: safeDiv(
						qualifiedRequestsSpain30dCount,
						qualifiedRequestsGlobal30dCount
					)
				},
				qualifiedRate30DaysPct: {
					global: safeDiv(qualifiedRequestsGlobal30dCount, totalRequestsGlobal30dCount),
					spain: safeDiv(qualifiedRequestsSpain30dCount, totalRequestsSpain30dCount)
				},
				qualifiedRequestsPerPublishedInstructor30Days: {
					global: safeDiv(qualifiedRequestsGlobal30dCount, publishedInstructorsGlobalCount),
					spain: safeDiv(qualifiedRequestsSpain30dCount, publishedInstructorsSpainCount)
				}
			},
			supply: {
				publishedInstructors: {
					global: publishedInstructorsGlobalCount,
					spain: publishedInstructorsSpainCount
				},
				spainSharePct: safeDiv(publishedInstructorsSpainCount, publishedInstructorsGlobalCount)
			}
		};
	},

	/**
	 * Consent-aware first-party funnel metrics (Spain + Global)
	 */
	async getFunnelMetrics(days: number = 30) {
		const since = new Date();
		since.setDate(since.getDate() - days);

		const toInt = (value: unknown) => Number(value ?? 0);
		const safeDiv = (num: number, den: number) => (den > 0 ? num / den : 0);

		const totalsRows = await db
			.select({
				totalEvents: sql<number>`count(*)::int`,
				totalEventsSpain: sql<number>`count(*) filter (where ${funnelEvents.isSpain} = true)::int`,
				demandEventsGlobal: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'demand')::int`,
				demandEventsSpain: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'demand' and ${funnelEvents.isSpain} = true)::int`,
				supplyEventsGlobal: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'supply')::int`,
				supplyEventsSpain: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'supply' and ${funnelEvents.isSpain} = true)::int`,
				consentAcceptedGlobal: sql<number>`count(*) filter (where ${funnelEvents.consentStatus} = 'accepted')::int`,
				consentAcceptedSpain: sql<number>`count(*) filter (where ${funnelEvents.consentStatus} = 'accepted' and ${funnelEvents.isSpain} = true)::int`
			})
			.from(funnelEvents)
			.where(gte(funnelEvents.createdAt, since));

		const stageRows = await db
			.select({
				funnel: funnelEvents.funnel,
				stage: funnelEvents.stage,
				globalCount: sql<number>`count(*)::int`,
				spainCount: sql<number>`count(*) filter (where ${funnelEvents.isSpain} = true)::int`
			})
			.from(funnelEvents)
			.where(gte(funnelEvents.createdAt, since))
			.groupBy(funnelEvents.funnel, funnelEvents.stage)
			.orderBy(funnelEvents.funnel, funnelEvents.stage);

		const eventTypeRows = await db
			.select({
				eventType: funnelEvents.eventType,
				funnel: funnelEvents.funnel,
				stage: funnelEvents.stage,
				globalCount: sql<number>`count(*)::int`,
				spainCount: sql<number>`count(*) filter (where ${funnelEvents.isSpain} = true)::int`,
				lastSeenAt: sql<string>`max(${funnelEvents.createdAt})::text`
			})
			.from(funnelEvents)
			.where(gte(funnelEvents.createdAt, since))
			.groupBy(funnelEvents.eventType, funnelEvents.funnel, funnelEvents.stage)
			.orderBy(sql`count(*) desc`, funnelEvents.eventType)
			.limit(12);

		const dailyRows = await db
			.select({
				day: sql<string>`to_char(date_trunc('day', ${funnelEvents.createdAt}), 'YYYY-MM-DD')`,
				globalCount: sql<number>`count(*)::int`,
				spainCount: sql<number>`count(*) filter (where ${funnelEvents.isSpain} = true)::int`,
				demandGlobal: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'demand')::int`,
				demandSpain: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'demand' and ${funnelEvents.isSpain} = true)::int`,
				supplyGlobal: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'supply')::int`,
				supplySpain: sql<number>`count(*) filter (where ${funnelEvents.funnel} = 'supply' and ${funnelEvents.isSpain} = true)::int`
			})
			.from(funnelEvents)
			.where(gte(funnelEvents.createdAt, since))
			.groupBy(sql`date_trunc('day', ${funnelEvents.createdAt})`)
			.orderBy(sql`date_trunc('day', ${funnelEvents.createdAt})`)
			.limit(Math.min(days, 30));

		const totals = totalsRows[0] ?? {
			totalEvents: 0,
			totalEventsSpain: 0,
			demandEventsGlobal: 0,
			demandEventsSpain: 0,
			supplyEventsGlobal: 0,
			supplyEventsSpain: 0,
			consentAcceptedGlobal: 0,
			consentAcceptedSpain: 0
		};

		const totalEventsGlobal = toInt(totals.totalEvents);
		const totalEventsSpain = toInt(totals.totalEventsSpain);
		const demandEventsGlobal = toInt(totals.demandEventsGlobal);
		const demandEventsSpain = toInt(totals.demandEventsSpain);
		const supplyEventsGlobal = toInt(totals.supplyEventsGlobal);
		const supplyEventsSpain = toInt(totals.supplyEventsSpain);
		const consentAcceptedGlobal = toInt(totals.consentAcceptedGlobal);
		const consentAcceptedSpain = toInt(totals.consentAcceptedSpain);

		return {
			windowDays: days,
			totals: {
				totalEventsGlobal,
				totalEventsSpain,
				totalEventsSpainSharePct: safeDiv(totalEventsSpain, totalEventsGlobal),
				demandEventsGlobal,
				demandEventsSpain,
				demandEventsSpainSharePct: safeDiv(demandEventsSpain, demandEventsGlobal),
				supplyEventsGlobal,
				supplyEventsSpain,
				supplyEventsSpainSharePct: safeDiv(supplyEventsSpain, supplyEventsGlobal),
				consentAcceptedGlobal,
				consentAcceptedSpain,
				consentAcceptanceRateGlobalPct: safeDiv(consentAcceptedGlobal, totalEventsGlobal),
				consentAcceptanceRateSpainPct: safeDiv(consentAcceptedSpain, totalEventsSpain)
			},
			byStage: stageRows.map((row) => ({
				funnel: row.funnel,
				stage: row.stage,
				globalCount: toInt(row.globalCount),
				spainCount: toInt(row.spainCount),
				spainSharePct: safeDiv(toInt(row.spainCount), toInt(row.globalCount))
			})),
			byEventType: eventTypeRows.map((row) => ({
				eventType: row.eventType,
				funnel: row.funnel,
				stage: row.stage,
				globalCount: toInt(row.globalCount),
				spainCount: toInt(row.spainCount),
				spainSharePct: safeDiv(toInt(row.spainCount), toInt(row.globalCount)),
				lastSeenAt: row.lastSeenAt
			})),
			daily: dailyRows.map((row) => ({
				day: row.day,
				globalCount: toInt(row.globalCount),
				spainCount: toInt(row.spainCount),
				demandGlobal: toInt(row.demandGlobal),
				demandSpain: toInt(row.demandSpain),
				supplyGlobal: toInt(row.supplyGlobal),
				supplySpain: toInt(row.supplySpain)
			}))
		};
	},

	/**
	 * Get pending verifications that need admin action
	 */
	async getPendingVerifications() {
		const pendingInstructors = await db
			.select({
				id: users.id,
				name: users.name,
				lastName: users.lastName,
				email: users.email,
				qualificationUrl: users.qualificationUrl,
				createdAt: users.createdAt
			})
			.from(users)
			.innerJoin(userRoles, eq(userRoles.userId, users.id))
			.where(
				and(
					inArray(userRoles.role, ['instructor-independent', 'instructor-school']),
					eq(users.isVerified, false),
					sql`${users.qualificationUrl} IS NOT NULL`
				)
			)
			.limit(10)
			.orderBy(users.createdAt);

		return pendingInstructors;
	},

	/**
	 * Get recent bookings for dashboard
	 */
	async getRecentBookings(limit: number = 10) {
		const bookings = await db.query.bookingRequests.findMany({
			limit,
			orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
			with: {
				instructor: {
					columns: {
						id: true,
						name: true,
						lastName: true,
						email: true
					}
				}
			}
		});

		return bookings;
	},

	/**
	 * Get recent reviews for dashboard
	 */
	async getRecentReviews(limit: number = 10) {
		const recentReviews = await db.query.instructorReviews.findMany({
			limit,
			orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
			with: {
				instructor: {
					columns: {
						id: true,
						name: true,
						lastName: true
					}
				}
			}
		});

		return recentReviews;
	},

	/**
	 * Get suspended users
	 */
	async getSuspendedUsers() {
		return await db.query.users.findMany({
			where: (users, { eq }) => eq(users.isSuspended, true),
			columns: {
				id: true,
				name: true,
				lastName: true,
				email: true,
				role: true,
				suspensionReason: true,
				suspendedAt: true
			}
		});
	}
};
