<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { useIntlayer } from 'svelte-intlayer';

	const table = useIntlayer('table');
	const status = useIntlayer('status');
	const button = useIntlayer('button');
	const admin = useIntlayer('admin');

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

	function getStatusColor(status: string) {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-800',
			viewed: 'bg-blue-100 text-blue-800',
			accepted: 'bg-green-100 text-green-800',
			completed: 'bg-green-600 text-white',
			rejected: 'bg-red-100 text-red-800',
			expired: 'bg-gray-100 text-gray-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{m["admin.bookings.admin_booking_management"]()}</h1>
		<p class="text-muted-foreground">{m["admin.bookings.admin_booking_management_desc"]()}</p>
	</div>

	<!-- Filters -->
	<Card>
		<CardContent class="pt-6">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="col-span-2">
					<Input
						bind:value={searchValue}
						placeholder={m["admin.bookings.admin_search_client_placeholder"]()}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>
				<Select.Root
					selected={{ value: statusFilter }}
					onSelectedChange={(v) => statusFilter = v?.value || 'all'}
				>
					<Select.Trigger>
						<Select.Value placeholder={$table.status.value} />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">{m["admin.bookings.admin_all_statuses"]()}</Select.Item>
						<Select.Item value="pending">{$status.pending.value}</Select.Item>
						<Select.Item value="viewed">{m["admin.bookings.status_viewed"]()}</Select.Item>
						<Select.Item value="accepted">{m["dashboard.my-bookings.status_accepted"]()}</Select.Item>
						<Select.Item value="completed">{$status.completed.value}</Select.Item>
						<Select.Item value="rejected">{m["dashboard.my-bookings.status_rejected"]()}</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<Button onclick={applyFilters} class="mt-4">{$button.apply_filters.value}</Button>
		</CardContent>
	</Card>

	<p class="text-sm text-muted-foreground">
		{m.admin_showing_of({ count: data.bookings.length, total: data.pagination.total })} {$admin.bookings.value.toLowerCase()}
	</p>

	<!-- Bookings Table -->
	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$table.id.value}</Table.Head>
						<Table.Head>{$table.client.value}</Table.Head>
						<Table.Head>{$table.instructor.value}</Table.Head>
						<Table.Head>{m["admin.bookings.table_resort_sport"]()}</Table.Head>
						<Table.Head>{$table.date.value}</Table.Head>
						<Table.Head>{$table.students.value}</Table.Head>
						<Table.Head>{$table.price.value}</Table.Head>
						<Table.Head>{$table.status.value}</Table.Head>
						<Table.Head>{m["admin.bookings.table_created"]()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.bookings as booking}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">#{booking.id}</Table.Cell>
							<Table.Cell>
								<div>
									<p class="font-medium">{booking.clientName}</p>
									<p class="text-xs text-muted-foreground">{booking.clientEmail}</p>
								</div>
							</Table.Cell>
							<Table.Cell>
								{booking.instructor.name} {booking.instructor.lastName}
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
							<Table.Cell class="text-xs text-muted-foreground">
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
					{$button.previous.value}
				</Button>
			{/if}
			<span class="text-sm">{m.admin_page_of({ page: data.pagination.page, total: data.pagination.totalPages })}</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/bookings?page={data.pagination.page + 1}" variant="outline" size="sm">
					{$button.next.value}
				</Button>
			{/if}
		</div>
	{/if}
</div>
