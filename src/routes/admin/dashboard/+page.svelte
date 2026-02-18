<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$src/lib/components/ui/card';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import * as Table from '$src/lib/components/ui/table';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	// Calculate totals from stats
	const totalUsers = data.stats.userStats.reduce((sum, stat) => sum + stat.count, 0);
	const totalInstructors = data.stats.instructorStats.reduce((sum, stat) => sum + stat.count, 0);
	const verifiedInstructors =
		data.stats.instructorStats.find((s) => s.isVerified === true)?.count || 0;
	const pendingInstructors =
		data.stats.instructorStats.find((s) => s.isVerified === false)?.count || 0;

	const totalBookings = data.stats.bookingStats.reduce((sum, stat) => sum + stat.count, 0);
	const completedBookings =
		data.stats.bookingStats.find((s) => s.status === 'completed')?.count || 0;
	const pendingBookings = data.stats.bookingStats.find((s) => s.status === 'pending')?.count || 0;

	// Calculate revenue
	const depositRevenue = data.stats.depositRevenue.find((r) => r.status === 'held')?.total || 0;
	const leadRevenue = data.stats.leadRevenue.find((r) => r.status === 'paid')?.total || 0;
	const totalRevenue = Number(depositRevenue) + Number(leadRevenue);

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getStatusColor(status: string) {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-800',
			accepted: 'bg-blue-100 text-blue-800',
			completed: 'bg-green-100 text-green-800',
			rejected: 'bg-red-100 text-red-800',
			expired: 'bg-gray-100 text-gray-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}

	function formatPercent(value: number) {
		return `${(value * 100).toFixed(1)}%`;
	}

	function formatRatio(value: number) {
		return value.toFixed(2);
	}

	function formatDateTime(date: string | Date | null | undefined) {
		if (!date) return '-';
		return new Date(date).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function prettifyToken(value: string) {
		return value.replaceAll('_', ' ');
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="title2 mb-2">{$t('admin_platform_overview')}</h1>
		<p class="text-muted-foreground">{$t('admin_platform_overview_desc')}</p>
	</div>

	<!-- Key Metrics Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">{$t('admin_total_users')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{totalUsers}</div>
				<p class="text-muted-foreground text-xs">
					+{data.stats.recentActivity.users}
					{$t('admin_in_last_30_days')}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">{$t('admin_instructors')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{verifiedInstructors}/{totalInstructors}</div>
				<p class="text-muted-foreground text-xs">
					{pendingInstructors}
					{$t('admin_pending_verification')}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">{$t('admin_bookings')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{totalBookings}</div>
				<p class="text-muted-foreground text-xs">
					{completedBookings}
					{$t('client_status_completed')}, {pendingBookings}
					{$t('status_pending')}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">{$t('admin_revenue')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
				<p class="text-muted-foreground text-xs">
					{data.stats.reviewStats.total}
					{$t('admin_reviews_submitted')}
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Business KPIs (Spain + Global) -->
	<Card class="border-blue-200 bg-blue-50">
		<CardHeader>
			<CardTitle class="text-blue-900">{$t('admin_business_kpis_title')}</CardTitle>
			<p class="text-sm text-blue-800">{$t('admin_business_kpis_subtitle')}</p>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-lg bg-white p-4">
					<p class="text-muted-foreground text-sm">{$t('admin_kpi_instructor_signups')}</p>
					<div class="mt-2 space-y-1 text-sm">
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_global')} {$t('admin_kpi_all_time')}</span>
							<span class="font-semibold"
								>{data.businessKpis.acquisition.instructorSignups.global.allTime}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_spain')} {$t('admin_kpi_all_time')}</span>
							<span class="font-semibold"
								>{data.businessKpis.acquisition.instructorSignups.spain.allTime}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_global')} {$t('admin_kpi_last_30_days')}</span>
							<span class="font-semibold"
								>{data.businessKpis.acquisition.instructorSignups.global.last30Days}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_spain')} {$t('admin_kpi_last_30_days')}</span>
							<span class="font-semibold"
								>{data.businessKpis.acquisition.instructorSignups.spain.last30Days}</span
							>
						</div>
						<div class="flex items-center justify-between border-t pt-2">
							<span>{$t('admin_kpi_spain_share')} ({$t('admin_kpi_last_30_days')})</span>
							<span class="font-semibold"
								>{formatPercent(
									data.businessKpis.acquisition.instructorSignups.spainShareLast30DaysPct
								)}</span
							>
						</div>
					</div>
				</div>

				<div class="rounded-lg bg-white p-4">
					<p class="text-muted-foreground text-sm">{$t('admin_kpi_qualified_requests')}</p>
					<div class="mt-2 space-y-1 text-sm">
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_global')} {$t('admin_kpi_all_time')}</span>
							<span class="font-semibold"
								>{data.businessKpis.demand.qualifiedLessonRequests.global.allTime}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_spain')} {$t('admin_kpi_all_time')}</span>
							<span class="font-semibold"
								>{data.businessKpis.demand.qualifiedLessonRequests.spain.allTime}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_global')} {$t('admin_kpi_last_30_days')}</span>
							<span class="font-semibold"
								>{data.businessKpis.demand.qualifiedLessonRequests.global.last30Days}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_spain')} {$t('admin_kpi_last_30_days')}</span>
							<span class="font-semibold"
								>{data.businessKpis.demand.qualifiedLessonRequests.spain.last30Days}</span
							>
						</div>
						<div class="flex items-center justify-between border-t pt-2">
							<span>{$t('admin_kpi_spain_share')} ({$t('admin_kpi_last_30_days')})</span>
							<span class="font-semibold"
								>{formatPercent(
									data.businessKpis.demand.qualifiedLessonRequests.spainShareLast30DaysPct
								)}</span
							>
						</div>
					</div>
				</div>

				<div class="rounded-lg bg-white p-4">
					<p class="text-muted-foreground text-sm">{$t('admin_kpi_total_requests')}</p>
					<div class="mt-2 space-y-1 text-sm">
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_global')} {$t('admin_kpi_last_30_days')}</span>
							<span class="font-semibold"
								>{data.businessKpis.demand.lessonRequests30Days.global}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_spain')} {$t('admin_kpi_last_30_days')}</span>
							<span class="font-semibold"
								>{data.businessKpis.demand.lessonRequests30Days.spain}</span
							>
						</div>
						<div class="flex items-center justify-between border-t pt-2">
							<span>{$t('admin_kpi_qualified_rate')} {$t('admin_kpi_global')}</span>
							<span class="font-semibold"
								>{formatPercent(data.businessKpis.demand.qualifiedRate30DaysPct.global)}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_qualified_rate')} {$t('admin_kpi_spain')}</span>
							<span class="font-semibold"
								>{formatPercent(data.businessKpis.demand.qualifiedRate30DaysPct.spain)}</span
							>
						</div>
					</div>
				</div>

				<div class="rounded-lg bg-white p-4">
					<p class="text-muted-foreground text-sm">{$t('admin_kpi_published_instructors')}</p>
					<div class="mt-2 space-y-1 text-sm">
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_global')}</span>
							<span class="font-semibold"
								>{data.businessKpis.supply.publishedInstructors.global}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_spain')}</span>
							<span class="font-semibold"
								>{data.businessKpis.supply.publishedInstructors.spain}</span
							>
						</div>
						<div class="flex items-center justify-between border-t pt-2">
							<span>{$t('admin_kpi_spain_share')}</span>
							<span class="font-semibold"
								>{formatPercent(data.businessKpis.supply.spainSharePct)}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_requests_per_instructor')} {$t('admin_kpi_global')}</span>
							<span class="font-semibold"
								>{formatRatio(
									data.businessKpis.demand.qualifiedRequestsPerPublishedInstructor30Days.global
								)}</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span>{$t('admin_kpi_requests_per_instructor')} {$t('admin_kpi_spain')}</span>
							<span class="font-semibold"
								>{formatRatio(
									data.businessKpis.demand.qualifiedRequestsPerPublishedInstructor30Days.spain
								)}</span
							>
						</div>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Funnel Measurement Views -->
	<Card class="border-emerald-200 bg-emerald-50">
		<CardHeader>
			<CardTitle class="text-emerald-900">{$t('admin_funnel_views_title')}</CardTitle>
			<p class="text-sm text-emerald-800">
				{$t('admin_funnel_views_subtitle', { days: data.funnelMetrics.windowDays })}
			</p>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.funnelMetrics.totals.totalEventsGlobal === 0}
				<div class="text-muted-foreground rounded-lg bg-white p-4 text-sm">
					{$t('admin_funnel_views_empty')}
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div class="rounded-lg bg-white p-4">
						<p class="text-muted-foreground text-sm">{$t('admin_funnel_total_events')}</p>
						<div class="mt-2 space-y-1 text-sm">
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_global')}</span>
								<span class="font-semibold">{data.funnelMetrics.totals.totalEventsGlobal}</span>
							</div>
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_spain')}</span>
								<span class="font-semibold">{data.funnelMetrics.totals.totalEventsSpain}</span>
							</div>
							<div class="flex items-center justify-between border-t pt-2">
								<span>{$t('admin_kpi_spain_share')}</span>
								<span class="font-semibold"
									>{formatPercent(data.funnelMetrics.totals.totalEventsSpainSharePct)}</span
								>
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-white p-4">
						<p class="text-muted-foreground text-sm">{$t('admin_funnel_demand_events')}</p>
						<div class="mt-2 space-y-1 text-sm">
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_global')}</span>
								<span class="font-semibold">{data.funnelMetrics.totals.demandEventsGlobal}</span>
							</div>
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_spain')}</span>
								<span class="font-semibold">{data.funnelMetrics.totals.demandEventsSpain}</span>
							</div>
							<div class="flex items-center justify-between border-t pt-2">
								<span>{$t('admin_kpi_spain_share')}</span>
								<span class="font-semibold"
									>{formatPercent(data.funnelMetrics.totals.demandEventsSpainSharePct)}</span
								>
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-white p-4">
						<p class="text-muted-foreground text-sm">{$t('admin_funnel_supply_events')}</p>
						<div class="mt-2 space-y-1 text-sm">
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_global')}</span>
								<span class="font-semibold">{data.funnelMetrics.totals.supplyEventsGlobal}</span>
							</div>
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_spain')}</span>
								<span class="font-semibold">{data.funnelMetrics.totals.supplyEventsSpain}</span>
							</div>
							<div class="flex items-center justify-between border-t pt-2">
								<span>{$t('admin_kpi_spain_share')}</span>
								<span class="font-semibold"
									>{formatPercent(data.funnelMetrics.totals.supplyEventsSpainSharePct)}</span
								>
							</div>
						</div>
					</div>

					<div class="rounded-lg bg-white p-4">
						<p class="text-muted-foreground text-sm">{$t('admin_funnel_consent')}</p>
						<div class="mt-2 space-y-1 text-sm">
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_global')}</span>
								<span class="font-semibold"
									>{formatPercent(data.funnelMetrics.totals.consentAcceptanceRateGlobalPct)}</span
								>
							</div>
							<div class="flex items-center justify-between">
								<span>{$t('admin_kpi_spain')}</span>
								<span class="font-semibold"
									>{formatPercent(data.funnelMetrics.totals.consentAcceptanceRateSpainPct)}</span
								>
							</div>
							<div class="flex items-center justify-between border-t pt-2">
								<span>{$t('admin_funnel_consented_events')}</span>
								<span class="font-semibold">{data.funnelMetrics.totals.consentAcceptedGlobal}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="grid gap-4 lg:grid-cols-2">
					<Card class="bg-white">
						<CardHeader>
							<CardTitle class="text-base">{$t('admin_funnel_stage_breakdown')}</CardTitle>
						</CardHeader>
						<CardContent>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>{$t('admin_funnel_col_funnel')}</Table.Head>
										<Table.Head>{$t('admin_funnel_col_stage')}</Table.Head>
										<Table.Head>{$t('admin_kpi_global')}</Table.Head>
										<Table.Head>{$t('admin_kpi_spain')}</Table.Head>
										<Table.Head>{$t('admin_kpi_spain_share')}</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each data.funnelMetrics.byStage as row}
										<Table.Row>
											<Table.Cell class="capitalize">{row.funnel}</Table.Cell>
											<Table.Cell class="capitalize">{prettifyToken(row.stage)}</Table.Cell>
											<Table.Cell>{row.globalCount}</Table.Cell>
											<Table.Cell>{row.spainCount}</Table.Cell>
											<Table.Cell>{formatPercent(row.spainSharePct)}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</CardContent>
					</Card>

					<Card class="bg-white">
						<CardHeader>
							<CardTitle class="text-base">{$t('admin_funnel_event_types')}</CardTitle>
						</CardHeader>
						<CardContent>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>{$t('admin_funnel_col_event_type')}</Table.Head>
										<Table.Head>{$t('admin_kpi_global')}</Table.Head>
										<Table.Head>{$t('admin_kpi_spain')}</Table.Head>
										<Table.Head>{$t('admin_funnel_col_last_seen')}</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each data.funnelMetrics.byEventType as row}
										<Table.Row>
											<Table.Cell class="text-xs">{row.eventType}</Table.Cell>
											<Table.Cell>{row.globalCount}</Table.Cell>
											<Table.Cell>{row.spainCount}</Table.Cell>
											<Table.Cell class="text-xs">{formatDateTime(row.lastSeenAt)}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</CardContent>
					</Card>
				</div>

				<Card class="bg-white">
					<CardHeader>
						<CardTitle class="text-base">{$t('admin_funnel_daily_trend')}</CardTitle>
					</CardHeader>
					<CardContent>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>{$t('admin_funnel_col_day')}</Table.Head>
									<Table.Head>{$t('admin_funnel_total_events')}</Table.Head>
									<Table.Head>{$t('admin_kpi_spain')}</Table.Head>
									<Table.Head>{$t('admin_funnel_demand_events')}</Table.Head>
									<Table.Head>{$t('admin_funnel_supply_events')}</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.funnelMetrics.daily as row}
									<Table.Row>
										<Table.Cell>{row.day}</Table.Cell>
										<Table.Cell>{row.globalCount}</Table.Cell>
										<Table.Cell>{row.spainCount}</Table.Cell>
										<Table.Cell>{row.demandGlobal}</Table.Cell>
										<Table.Cell>{row.supplyGlobal}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</CardContent>
				</Card>
			{/if}
		</CardContent>
	</Card>

	<!-- Pending Verifications Alert -->
	{#if data.pendingVerifications.length > 0}
		<Card class="border-yellow-200 bg-yellow-50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-yellow-900">
					<span class="text-xl">⚠️</span>
					{data.pendingVerifications.length}
					{$t('admin_instructors_pending_verification')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.pendingVerifications as instructor}
						<div class="flex items-center justify-between rounded-lg bg-white p-3">
							<div>
								<p class="font-medium">{instructor.name} {instructor.lastName}</p>
								<p class="text-muted-foreground text-sm">{instructor.email}</p>
								<p class="text-muted-foreground text-xs">
									{$t('admin_registered')}: {formatDate(instructor.createdAt)}
								</p>
							</div>
							<Button href="/admin/instructors/{instructor.id}" size="sm">
								{$t('dashboard_button_review')}
							</Button>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Suspended Users Alert -->
	{#if data.suspendedUsers.length > 0}
		<Card class="border-red-200 bg-red-50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-red-900">
					<span class="text-xl">🚫</span>
					{data.suspendedUsers.length}
					{$t('admin_suspended_users')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.suspendedUsers as user}
						<div class="flex items-center justify-between rounded-lg bg-white p-3">
							<div>
								<p class="font-medium">{user.name} {user.lastName}</p>
								<p class="text-muted-foreground text-sm">{user.email}</p>
								<p class="text-xs text-red-600">{$t('admin_reason')}: {user.suspensionReason}</p>
							</div>
							<Badge variant="destructive">{user.role}</Badge>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Recent Activity -->
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Recent Bookings -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('admin_recent_bookings')}</CardTitle>
			</CardHeader>
			<CardContent>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{$t('table_client')}</Table.Head>
							<Table.Head>{$t('table_instructor')}</Table.Head>
							<Table.Head>{$t('table_date')}</Table.Head>
							<Table.Head>{$t('table_status')}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.recentBookings as booking}
							<Table.Row>
								<Table.Cell class="font-medium">{booking.clientName}</Table.Cell>
								<Table.Cell>
									{booking.instructor.name}
									{booking.instructor.lastName}
								</Table.Cell>
								<Table.Cell>{formatDate(booking.startDate)}</Table.Cell>
								<Table.Cell>
									<Badge class={getStatusColor(booking.status || 'pending')}>
										{booking.status || '-'}
									</Badge>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				<div class="mt-4 text-center">
					<Button href="/admin/bookings" variant="outline" size="sm">
						{$t('dashboard_button_view_all_bookings')}
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Recent Reviews -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('admin_recent_reviews')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					{#each data.recentReviews as review}
						<div class="rounded-lg border p-3">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<p class="font-medium">
										{review.instructor.name}
										{review.instructor.lastName}
									</p>
									<div class="flex items-center gap-1 text-yellow-500">
										{'⭐'.repeat(review.rating)}
									</div>
									{#if review.comment}
										<p class="text-muted-foreground mt-1 text-sm">
											{review.comment.slice(0, 100)}{review.comment.length > 100 ? '...' : ''}
										</p>
									{/if}
								</div>
								<span class="text-muted-foreground text-xs">
									{formatDate(review.createdAt)}
								</span>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 text-center">
					<Button href="/admin/reviews" variant="outline" size="sm">
						{$t('dashboard_button_view_all_reviews')}
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Statistics Breakdown -->
	<div class="grid gap-4 md:grid-cols-3">
		<!-- User Distribution -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('admin_users_by_role')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.stats.userStats as stat}
						<div class="flex items-center justify-between">
							<span class="text-sm capitalize">{stat.role || $t('admin_no_role')}</span>
							<Badge variant="secondary">{stat.count}</Badge>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Booking Status Distribution -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('admin_bookings_by_status')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.stats.bookingStats as stat}
						<div class="flex items-center justify-between">
							<span class="text-sm capitalize">{stat.status}</span>
							<Badge variant="secondary">{stat.count}</Badge>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Review Statistics -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('admin_review_metrics')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					<div>
						<p class="text-muted-foreground text-sm">{$t('admin_total_reviews')}</p>
						<p class="text-2xl font-bold">{data.stats.reviewStats.total}</p>
					</div>
					<div>
						<p class="text-muted-foreground text-sm">{$t('admin_average_rating')}</p>
						<div class="flex items-center gap-2">
							<p class="text-2xl font-bold">
								{Number(data.stats.reviewStats.avgRating || 0).toFixed(1)}
							</p>
							<span class="text-yellow-500">⭐</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
