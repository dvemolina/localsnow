<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();

	// Calculate totals from stats
	const totalUsers = data.stats.userStats.reduce((sum, stat) => sum + stat.count, 0);
	const totalInstructors = data.stats.instructorStats.reduce((sum, stat) => sum + stat.count, 0);
	const verifiedInstructors = data.stats.instructorStats.find((s) => s.isVerified === true)?.count || 0;
	const pendingInstructors = data.stats.instructorStats.find((s) => s.isVerified === false)?.count || 0;

	const totalBookings = data.stats.bookingStats.reduce((sum, stat) => sum + stat.count, 0);
	const completedBookings = data.stats.bookingStats.find((s) => s.status === 'completed')?.count || 0;
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
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="title2 mb-2">Platform Overview</h1>
		<p class="text-muted-foreground">Monitor key metrics and platform health</p>
	</div>

	<!-- Key Metrics Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Users</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{totalUsers}</div>
				<p class="text-xs text-muted-foreground">
					+{data.stats.recentActivity.users} in last 30 days
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Instructors</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{verifiedInstructors}/{totalInstructors}</div>
				<p class="text-xs text-muted-foreground">
					{pendingInstructors} pending verification
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Bookings</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{totalBookings}</div>
				<p class="text-xs text-muted-foreground">
					{completedBookings} completed, {pendingBookings} pending
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Revenue</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.reviewStats.total} reviews submitted
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Pending Verifications Alert -->
	{#if data.pendingVerifications.length > 0}
		<Card class="border-yellow-200 bg-yellow-50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-yellow-900">
					<span class="text-xl">⚠️</span>
					{data.pendingVerifications.length} Instructor(s) Pending Verification
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.pendingVerifications as instructor}
						<div class="flex items-center justify-between rounded-lg bg-white p-3">
							<div>
								<p class="font-medium">{instructor.name} {instructor.lastName}</p>
								<p class="text-sm text-muted-foreground">{instructor.email}</p>
								<p class="text-xs text-muted-foreground">
									Registered: {formatDate(instructor.createdAt)}
								</p>
							</div>
							<Button href="/admin/instructors/{instructor.id}" size="sm">
								Review
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
					{data.suspendedUsers.length} Suspended User(s)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.suspendedUsers as user}
						<div class="flex items-center justify-between rounded-lg bg-white p-3">
							<div>
								<p class="font-medium">{user.name} {user.lastName}</p>
								<p class="text-sm text-muted-foreground">{user.email}</p>
								<p class="text-xs text-red-600">Reason: {user.suspensionReason}</p>
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
				<CardTitle>Recent Bookings</CardTitle>
			</CardHeader>
			<CardContent>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Client</Table.Head>
							<Table.Head>Instructor</Table.Head>
							<Table.Head>Date</Table.Head>
							<Table.Head>Status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.recentBookings as booking}
							<Table.Row>
								<Table.Cell class="font-medium">{booking.clientName}</Table.Cell>
								<Table.Cell>
									{booking.instructor.name} {booking.instructor.lastName}
								</Table.Cell>
								<Table.Cell>{formatDate(booking.startDate)}</Table.Cell>
								<Table.Cell>
									<Badge class={getStatusColor(booking.status)}>
										{booking.status}
									</Badge>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				<div class="mt-4 text-center">
					<Button href="/admin/bookings" variant="outline" size="sm">
						View All Bookings
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Recent Reviews -->
		<Card>
			<CardHeader>
				<CardTitle>Recent Reviews</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					{#each data.recentReviews as review}
						<div class="rounded-lg border p-3">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<p class="font-medium">
										{review.instructor.name} {review.instructor.lastName}
									</p>
									<div class="flex items-center gap-1 text-yellow-500">
										{'⭐'.repeat(review.rating)}
									</div>
									{#if review.comment}
										<p class="mt-1 text-sm text-muted-foreground">
											{review.comment.slice(0, 100)}{review.comment.length > 100 ? '...' : ''}
										</p>
									{/if}
								</div>
								<span class="text-xs text-muted-foreground">
									{formatDate(review.createdAt)}
								</span>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 text-center">
					<Button href="/admin/reviews" variant="outline" size="sm">
						View All Reviews
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
				<CardTitle>Users by Role</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.stats.userStats as stat}
						<div class="flex items-center justify-between">
							<span class="text-sm capitalize">{stat.role || 'No role'}</span>
							<Badge variant="secondary">{stat.count}</Badge>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Booking Status Distribution -->
		<Card>
			<CardHeader>
				<CardTitle>Bookings by Status</CardTitle>
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
				<CardTitle>Review Metrics</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					<div>
						<p class="text-sm text-muted-foreground">Total Reviews</p>
						<p class="text-2xl font-bold">{data.stats.reviewStats.total}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Average Rating</p>
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
