<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	let searchValue = $state(data.filters.search || '');
	let statusFilter = $state(data.filters.status || 'all');

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		goto(`/admin/bookings?${params.toString()}`);
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getStatusColor(status: string | null) {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-800',
			viewed: 'bg-blue-100 text-blue-800',
			accepted: 'bg-green-100 text-green-800',
			completed: 'bg-green-600 text-white',
			rejected: 'bg-red-100 text-red-800',
			expired: 'bg-gray-100 text-gray-800'
		};
		return status ? colors[status] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
	}

	function getOperationStatusColor(status: string) {
		const colors: Record<string, string> = {
			replacement_or_refund_needed: 'bg-red-100 text-red-800',
			confirm_requested_instructor_first: 'bg-yellow-100 text-yellow-800',
			payment_pending: 'bg-slate-100 text-slate-800',
			requested_instructor_confirmed: 'bg-green-100 text-green-800',
			refund_completed: 'bg-blue-100 text-blue-800',
			closed: 'bg-gray-100 text-gray-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{$t('bookings_admin_booking_management')}</h1>
		<p class="text-muted-foreground">{$t('bookings_admin_booking_management_desc')}</p>
	</div>

	<!-- Protected Booking Operations Queue -->
	<Card>
		<CardHeader>
			<CardTitle>Protected booking operations queue</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="text-muted-foreground mb-4 text-sm">
				Paid route only: confirm the requested instructor first. If they cannot serve, arrange a
				suitable replacement or refund. Instructor/school payout stays manual.
			</p>
			{#if data.protectedOperationsQueue.length > 0}
				<div class="space-y-3">
					{#each data.protectedOperationsQueue.slice(0, 8) as item}
						<div class="rounded-lg border p-4">
							<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
								<div class="space-y-1">
									<div class="flex flex-wrap items-center gap-2">
										<span class="text-muted-foreground font-mono text-xs">#{item.bookingId}</span>
										<Badge class={getOperationStatusColor(item.status)}>{item.label}</Badge>
									</div>
									<p class="font-medium">{item.clientName} → {item.requestedInstructorName}</p>
									<p class="text-muted-foreground text-sm">
										{formatDate(item.startDate)} · {item.numberOfStudents} student{item.numberOfStudents ===
										1
											? ''
											: 's'} · {item.sportLabels.join(', ') || 'sport not set'}
									</p>
								</div>
								<div class="text-left md:text-right">
									<p class="text-sm font-semibold">{item.currency} {item.protectedTotal}</p>
									<p class="text-muted-foreground text-xs">Protected total · payout manual</p>
								</div>
							</div>
							<p class="mt-3 text-sm">{item.nextOperatorAction}</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
					No paid protected booking operations yet.
				</p>
			{/if}
		</CardContent>
	</Card>

	<!-- Filters -->
	<Card>
		<CardContent class="pt-6">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="col-span-2">
					<Input
						bind:value={searchValue}
						placeholder={$t('bookings_admin_search_client_placeholder')}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>
				<Select.Root type="single" bind:value={statusFilter}>
					<Select.Trigger>
						<Select.Value placeholder={$t('table_status')} />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">{$t('bookings_admin_all_statuses')}</Select.Item>
						<Select.Item value="pending">{$t('status_pending')}</Select.Item>
						<Select.Item value="viewed">{$t('bookings_status_viewed')}</Select.Item>
						<Select.Item value="accepted">{$t('status_accepted')}</Select.Item>
						<Select.Item value="completed">{$t('client_status_completed')}</Select.Item>
						<Select.Item value="rejected">{$t('status_rejected')}</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<Button onclick={applyFilters} class="mt-4">{$t('button_apply_filters')}</Button>
		</CardContent>
	</Card>

	<p class="text-muted-foreground text-sm">
		{$t('admin_showing_of', {
			values: { count: data.bookings.length, total: data.pagination.total }
		})}
		{$t('admin_bookings').toLowerCase()}
	</p>

	<!-- Bookings Table -->
	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_client')}</Table.Head>
						<Table.Head>{$t('table_instructor')}</Table.Head>
						<Table.Head>{$t('bookings_table_resort_sport')}</Table.Head>
						<Table.Head>{$t('table_date')}</Table.Head>
						<Table.Head>{$t('table_students')}</Table.Head>
						<Table.Head>{$t('table_price')}</Table.Head>
						<Table.Head>{$t('table_status')}</Table.Head>
						<Table.Head>{$t('bookings_table_created')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.bookings as booking}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">#{booking.id}</Table.Cell>
							<Table.Cell>
								<div>
									<p class="font-medium">{booking.clientName}</p>
									<p class="text-muted-foreground text-xs">{booking.clientEmail}</p>
								</div>
							</Table.Cell>
							<Table.Cell>
								{booking.instructor.name}
								{booking.instructor.lastName}
							</Table.Cell>
							<Table.Cell>
								<div class="flex gap-1">
									{#each booking.sports as { sport }}
										<Badge variant="outline" class="text-xs">{sport.sport}</Badge>
									{/each}
								</div>
							</Table.Cell>
							<Table.Cell>{formatDate(booking.startDate)}</Table.Cell>
							<Table.Cell>{booking.numberOfStudents}</Table.Cell>
							<Table.Cell>€{booking.estimatedPrice}</Table.Cell>
							<Table.Cell>
								<Badge class={getStatusColor(booking.status)}>
									{booking.status}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">
								{formatDate(booking.createdAt)}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- Pagination -->
	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			{#if data.pagination.page > 1}
				<Button href="/admin/bookings?page={data.pagination.page - 1}" variant="outline" size="sm">
					{$t('button_previous')}
				</Button>
			{/if}
			<span class="text-sm"
				>{$t('admin_page_of', {
					values: { page: data.pagination.page, total: data.pagination.totalPages }
				})}</span
			>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/bookings?page={data.pagination.page + 1}" variant="outline" size="sm">
					{$t('button_next')}
				</Button>
			{/if}
		</div>
	{/if}
</div>
