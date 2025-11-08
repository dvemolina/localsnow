<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusOptions = [
		{ value: 'all', label: 'All Bookings' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'viewed', label: 'Viewed' },
		{ value: 'accepted', label: 'Accepted' },
		{ value: 'rejected', label: 'Rejected' },
		{ value: 'expired', label: 'Expired' },
		{ value: 'completed', label: 'Completed' }
	];

	function filterByStatus(status: string) {
		if (status === 'all') {
			goto('/admin/bookings');
		} else {
			goto(`/admin/bookings?status=${status}`);
		}
	}
</script>

<div>
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="title2">All Bookings</h1>
			<p class="text-muted-foreground">Manage all booking requests</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex items-center gap-4">
		<div class="w-64">
			<Select.Root
				selected={data.currentFilter
					? { value: data.currentFilter, label: data.currentFilter }
					: { value: 'all', label: 'All Bookings' }}
				onSelectedChange={(v) => v && filterByStatus(v.value)}
			>
				<Select.Trigger>
					<Select.Value placeholder="Filter by status" />
				</Select.Trigger>
				<Select.Content>
					{#each statusOptions as option}
						<Select.Item value={option.value}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<p class="text-sm text-muted-foreground">{data.bookings.length} bookings</p>
	</div>

	<!-- Bookings Table -->
	<div class="rounded-lg border border-border bg-card">
		{#if data.bookings.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border text-left text-sm text-muted-foreground">
							<th class="p-4 font-medium">ID</th>
							<th class="p-4 font-medium">Client</th>
							<th class="p-4 font-medium">Instructor</th>
							<th class="p-4 font-medium">Date</th>
							<th class="p-4 font-medium">Students</th>
							<th class="p-4 font-medium">Price</th>
							<th class="p-4 font-medium">Status</th>
							<th class="p-4 font-medium">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each data.bookings as booking}
							<tr class="border-b border-border hover:bg-accent/50">
								<td class="p-4 text-sm font-mono">#{booking.id}</td>
								<td class="p-4">
									<div class="text-sm">
										<p class="font-medium">{booking.clientName}</p>
										<p class="text-muted-foreground">{booking.clientEmail}</p>
									</div>
								</td>
								<td class="p-4">
									<div class="text-sm">
										<p class="font-medium">{booking.instructorName}</p>
										<p class="text-muted-foreground">{booking.instructorEmail}</p>
									</div>
								</td>
								<td class="p-4 text-sm">
									{new Date(booking.startDate).toLocaleDateString()}
									{#if booking.endDate}
										- {new Date(booking.endDate).toLocaleDateString()}
									{/if}
								</td>
								<td class="p-4 text-sm">{booking.numberOfStudents}</td>
								<td class="p-4 text-sm">
									{booking.currency === 'EUR' ? '€' : '$'}{booking.estimatedPrice}
								</td>
								<td class="p-4">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium {booking.status ===
										'pending'
											? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
											: booking.status === 'accepted'
												? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
												: booking.status === 'rejected'
													? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
													: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}"
									>
										{booking.status}
									</span>
								</td>
								<td class="p-4 text-sm text-muted-foreground">
									{new Date(booking.createdAt).toLocaleDateString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="p-12 text-center">
				<p class="text-muted-foreground">No bookings found</p>
			</div>
		{/if}
	</div>
</div>
