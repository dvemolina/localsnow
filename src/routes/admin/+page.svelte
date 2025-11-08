<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div>
	<div class="mb-8">
		<h1 class="title2">Admin Dashboard</h1>
		<p class="text-muted-foreground">Manage your Local Snow platform</p>
	</div>

	<!-- Stats Grid -->
	<div class="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg border border-border bg-card p-6">
			<p class="text-sm font-medium text-muted-foreground">Total Instructors</p>
			<p class="mt-2 text-3xl font-bold">{data.stats.totalInstructors}</p>
			<p class="mt-1 text-xs text-muted-foreground">
				+{data.stats.newInstructorsThisMonth} this month
			</p>
		</div>

		<div class="rounded-lg border border-border bg-card p-6">
			<p class="text-sm font-medium text-muted-foreground">Total Bookings</p>
			<p class="mt-2 text-3xl font-bold">{data.stats.totalBookings}</p>
			<p class="mt-1 text-xs text-muted-foreground">
				+{data.stats.newBookingsThisMonth} this month
			</p>
		</div>

		<div class="rounded-lg border border-border bg-card p-6">
			<p class="text-sm font-medium text-muted-foreground">Pending Verifications</p>
			<p class="mt-2 text-3xl font-bold">{data.stats.pendingVerifications}</p>
			<Button href="/admin/instructors?filter=pending" size="sm" class="mt-2">Review</Button>
		</div>

		<div class="rounded-lg border border-border bg-card p-6">
			<p class="text-sm font-medium text-muted-foreground">Total Resorts</p>
			<p class="mt-2 text-3xl font-bold">{data.stats.totalResorts}</p>
			<Button href="/admin/resorts" size="sm" variant="outline" class="mt-2">Manage</Button>
		</div>
	</div>

	<!-- Recent Activity -->
	<div class="rounded-lg border border-border bg-card p-6">
		<h2 class="title4 mb-4">Recent Booking Requests</h2>

		{#if data.recentBookings.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border text-left text-sm text-muted-foreground">
							<th class="pb-3 font-medium">Client</th>
							<th class="pb-3 font-medium">Instructor</th>
							<th class="pb-3 font-medium">Date</th>
							<th class="pb-3 font-medium">Status</th>
							<th class="pb-3 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentBookings as booking}
							<tr class="border-b border-border">
								<td class="py-3 text-sm">{booking.clientName}</td>
								<td class="py-3 text-sm">{booking.instructorName}</td>
								<td class="py-3 text-sm">
									{new Date(booking.startDate).toLocaleDateString()}
								</td>
								<td class="py-3">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium {booking.status ===
										'pending'
											? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
											: booking.status === 'accepted'
												? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
												: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}"
									>
										{booking.status}
									</span>
								</td>
								<td class="py-3">
									<Button href="/admin/bookings/{booking.id}" size="sm" variant="ghost"
										>View</Button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="mt-4">
				<Button href="/admin/bookings" variant="outline">View All Bookings</Button>
			</div>
		{:else}
			<p class="text-muted-foreground">No recent booking requests</p>
		{/if}
	</div>
</div>
