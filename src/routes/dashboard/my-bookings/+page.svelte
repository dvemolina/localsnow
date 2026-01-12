<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { t } from '$lib/i18n/i18n';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let filter = $state<'all' | 'active' | 'completed' | 'cancelled'>('all');
	let cancellingId = $state<number | null>(null);
	let showCancelDialog = $state(false);

	const filteredBookings = $derived(() => {
		if (filter === 'all') return data.bookingRequests;
		if (filter === 'active') return data.bookingRequests.filter(b => ['pending', 'viewed'].includes(b.status));
		if (filter === 'completed') return data.bookingRequests.filter(b => b.status === 'accepted');
		if (filter === 'cancelled') return data.bookingRequests.filter(b => ['rejected', 'cancelled', 'expired'].includes(b.status));
		return data.bookingRequests;
	});

	// Status labels extracted at top level
	const statusLabels = $derived({
		pending: $t('status_pending'),
		viewed: $t('client_status_viewed'),
		accepted: $t('status_accepted'),
		rejected: $t('status_rejected'),
		cancelled: $t('client_status_cancelled'),
		expired: $t('status_expired')
	});

	function getStatusBadge(statusValue: string) {
		const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', class: string, label: string }> = {
			'pending': { variant: 'outline', class: 'border-yellow-500 text-yellow-700', label: statusLabels.pending },
			'viewed': { variant: 'outline', class: 'border-blue-500 text-blue-700', label: statusLabels.viewed },
			'accepted': { variant: 'default', class: 'bg-green-600', label: statusLabels.accepted },
			'rejected': { variant: 'destructive', class: '', label: statusLabels.rejected },
			'cancelled': { variant: 'secondary', class: '', label: statusLabels.cancelled },
			'expired': { variant: 'secondary', class: '', label: statusLabels.expired }
		};

		const config = variants[statusValue] || { variant: 'outline' as const, class: '', label: statusValue };
		return config;
	}

	function openCancelDialog(bookingId: number) {
		cancellingId = bookingId;
		showCancelDialog = true;
	}

	function closeCancelDialog() {
		cancellingId = null;
		showCancelDialog = false;
	}

	const formatTimeSlots = (timeSlots: string) => {
		try {
			const slots = JSON.parse(timeSlots);
			if (Array.isArray(slots) && slots.length > 0) {
				return slots.join(', ');
			}
			return '-';
		} catch {
			return '-';
		}
	};
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{$t('client_my_bookings')}</h1>
		<p class="text-muted-foreground">{$t('my_bookings_client_my_bookings_desc')}</p>
	</div>

	<!-- Filter Tabs -->
	<Card>
		<CardContent class="p-4">
			<div class="flex gap-2">
				<Button
					variant={filter === 'all' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (filter = 'all')}
				>
					{$t('my_bookings_client_filter_all')} ({data.counts.all})
				</Button>
				<Button
					variant={filter === 'active' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (filter = 'active')}
				>
					{$t('my_bookings_client_filter_active')} ({data.counts.active})
				</Button>
				<Button
					variant={filter === 'completed' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (filter = 'completed')}
				>
					{$t('my_bookings_client_filter_completed')} ({data.counts.completed})
				</Button>
				<Button
					variant={filter === 'cancelled' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (filter = 'cancelled')}
				>
					{$t('my_bookings_client_filter_cancelled')} ({data.counts.cancelled})
				</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="rounded-md bg-green-100 p-3 text-sm text-green-800">
			{form.message}
		</div>
	{/if}
	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
			{form.error}
		</div>
	{/if}

	<!-- Bookings Table -->
	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('my_bookings_client_table_instructor')}</Table.Head>
						<Table.Head>{$t('my_bookings_table_dates')}</Table.Head>
						<Table.Head>{$t('my_bookings_client_table_students')}</Table.Head>
						<Table.Head>{$t('my_bookings_client_table_sports')}</Table.Head>
						<Table.Head>{$t('table_status')}</Table.Head>
						<Table.Head>{$t('table_actions')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if filteredBookings().length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="text-center text-muted-foreground">
								{$t('my_bookings_client_no_bookings_found')}
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each filteredBookings() as booking}
							<Table.Row>
								<Table.Cell class="font-mono text-xs text-muted-foreground">
									#{booking.id}
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col">
										<span class="font-medium">
											{booking.instructor?.name} {booking.instructor?.lastName}
										</span>
										{#if booking.contactInfoUnlocked}
											<span class="text-xs text-muted-foreground">
												{booking.instructor?.email}
											</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col text-sm">
										<span>{new Date(booking.startDate).toLocaleDateString()}</span>
										{#if booking.endDate && booking.endDate !== booking.startDate}
											<span class="text-xs text-muted-foreground">
												→ {new Date(booking.endDate).toLocaleDateString()}
											</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>
									{booking.numberOfStudents}
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-wrap gap-1">
										{#each booking.sports as sport}
											<Badge variant="outline" class="text-xs">
												{sport.sportName}
											</Badge>
										{/each}
									</div>
								</Table.Cell>
								<Table.Cell>
									{@const statusConfig = getStatusBadge(booking.status)}
									<Badge variant={statusConfig.variant} class={statusConfig.class}>
										{statusConfig.label}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex gap-2">
										<Button
											href="/dashboard/my-bookings/{booking.id}"
											size="sm"
											variant="outline"
										>
											{$t('button_view')}
										</Button>
										{#if ['pending', 'viewed'].includes(booking.status)}
											<Button
												size="sm"
												variant="destructive"
												onclick={() => openCancelDialog(booking.id)}
											>
												{$t('button_cancel')}
											</Button>
										{/if}
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- Empty State for New Users -->
	{#if data.bookingRequests.length === 0}
		<Card class="border-dashed">
			<CardContent class="flex flex-col items-center justify-center py-12">
				<svg class="mb-4 h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				<h3 class="mb-2 text-lg font-semibold">{$t('my_bookings_client_no_bookings_title')}</h3>
				<p class="mb-4 text-center text-sm text-muted-foreground">
					{$t('my_bookings_client_no_bookings_subtitle')}
				</p>
				<Button href="/instructors">
					{$t('my_bookings_client_find_instructors')}
				</Button>
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Cancel Confirmation Dialog -->
<AlertDialog.Root bind:open={showCancelDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('my_bookings_client_cancel_booking_title')}</AlertDialog.Title>
			<AlertDialog.Description>
				{$t('my_bookings_client_cancel_booking_desc')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={closeCancelDialog}>{$t('my_bookings_button_cancel_action')}</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/cancel"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						closeCancelDialog();
					};
				}}
			>
				<input type="hidden" name="bookingRequestId" value={cancellingId || ''} />
				<AlertDialog.Action asChild let:builder>
					<Button {...builder} type="submit" variant="destructive">
						{$t('my_bookings_button_confirm_cancel')}
					</Button>
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
