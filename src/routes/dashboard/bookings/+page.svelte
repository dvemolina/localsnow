<script lang="ts">
	import RequestDetailDialog from '$src/features/Requests/components/RequestDetailDialog.svelte';
	import AddManualBookingDialog from '$src/features/Bookings/components/AddManualBookingDialog.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { goto } from '$app/navigation';
	import { isMobile } from '$src/lib/hooks/is-mobile.svelte.js';
	import { t } from '$src/lib/i18n/i18n.js';
	import { formatDate } from '$src/lib/utils/generics';
	let { data } = $props();

	let selectedBooking = $state<any>(null);
	let dialogOpen = $state(false);
	let addBookingDialogOpen = $state(false);

	const handleViewDetails = (booking: any) => {
		selectedBooking = booking;
		dialogOpen = true;
	};

	const statusConfig = $derived({
		pending: {
			label: $t('status_pending_review'),
			variant: 'secondary' as const,
			color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
		},
		accepted: {
			label: $t('status_accepted'),
			variant: 'default' as const,
			color: 'bg-green-100 text-green-800 border-green-200'
		},
		viewed: {
			label: $t('status_unlocked'),
			variant: 'default' as const,
			color: 'bg-blue-100 text-blue-800 border-blue-200'
		},
		rejected: {
			label: $t('status_rejected'),
			variant: 'outline' as const,
			color: 'bg-red-100 text-red-800 border-red-200'
		},
		cancelled: {
			label: $t('status_cancelled'),
			variant: 'outline' as const,
			color: 'bg-gray-100 text-gray-800 border-gray-200'
		},
		expired: {
			label: $t('status_expired'),
			variant: 'outline' as const,
			color: 'bg-gray-100 text-gray-800 border-gray-200'
		}
	});

	const getStatus = (booking: any) => {
		if (booking.status === 'rejected') return 'rejected';
		if (booking.status === 'cancelled') return 'cancelled';
		if (booking.status === 'expired') return 'expired';
		if (booking.status === 'accepted') return 'accepted';
		if (booking.status === 'viewed' || booking.contactInfoUnlocked) return 'viewed';
		return 'pending';
	};

	const changeFilter = (status: string) => {
		const url = new URL(window.location.href);
		if (status === 'all') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', status);
		}
		goto(url.pathname + url.search);
	};


	// Count bookings by status
	const counts = $derived({
		all: data.bookings.length,
		pending: data.bookings.filter(
			(b: any) => !b.contactInfoUnlocked && b.status === 'pending'
		).length,
		unlocked: data.bookings.filter((b: any) => b.contactInfoUnlocked).length,
		rejected: data.bookings.filter((b: any) => b.status === 'rejected').length
	});

	// Create unique keys for each booking to avoid duplicate key errors
	const bookingsWithUniqueKeys = $derived(
		data.bookings.map((booking: any, index: number) => ({
			...booking,
			uniqueKey: `${booking.id}-${index}`
		}))
	);
</script>

<div class="container mx-auto max-w-7xl">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="title2 mb-2">{$t('bookings_page_title') || 'Bookings & Clients'}</h1>
			<p class="text-muted-foreground">
				{$t('bookings_page_subtitle') || 'Manage all your bookings and clients in one place'}
			</p>
		</div>
		<Button onclick={() => (addBookingDialogOpen = true)}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-4 mr-2"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v16m8-8H4"
				/>
			</svg>
			{$t('button_add_booking') || 'Add Booking'}
		</Button>
	</div>

	<!-- Filter Tabs -->
	<Tabs.Root value={data.currentFilter} class="mb-6" orientation={ isMobile ? 'vertical' : 'horizontal' }>
		<Tabs.List class="grid w-full h-full grid-cols-2 md:grid-cols-4">
			<Tabs.Trigger value="all" onclick={() => changeFilter('all')}>
				{$t('filter_all')}
				{#if counts.all > 0}
					<Badge variant="secondary" class="ml-2">{counts.all}</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="pending" onclick={() => changeFilter('pending')}>
				{$t('filter_pending')}
				{#if counts.pending > 0}
					<Badge variant="secondary" class="ml-2 bg-yellow-100 text-yellow-800">
						{counts.pending}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="unlocked" onclick={() => changeFilter('unlocked')}>
				{$t('filter_unlocked')}
				{#if counts.unlocked > 0}
					<Badge variant="secondary" class="ml-2 bg-blue-100 text-blue-800">
						{counts.unlocked}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="rejected" onclick={() => changeFilter('rejected')}>
				{$t('filter_rejected')}
				{#if counts.rejected > 0}
					<Badge variant="secondary" class="ml-2">{counts.rejected}</Badge>
				{/if}
			</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<!-- Bookings List -->
	{#if bookingsWithUniqueKeys.length === 0}
		<div class="rounded-lg border-2 border-dashed border-border p-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 font-semibold text-lg">{$t('bookings_empty_state_title')}</h3>
			<p class="text-muted-foreground">
				{#if data.currentFilter === 'all'}
					{$t('bookings_empty_state_all')}
				{:else if data.currentFilter === 'pending'}
					{$t('bookings_empty_state_pending')}
				{:else if data.currentFilter === 'unlocked'}
					{$t('bookings_empty_state_unlocked')}
				{:else}
					{$t('bookings_empty_state_rejected')}
				{/if}
			</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each bookingsWithUniqueKeys as booking (booking.uniqueKey)}
				{@const currentStatus = getStatus(booking)}
				{@const statusInfo = statusConfig[currentStatus]}
				<Card.Root class="hover:shadow-md transition-shadow">
					<Card.Content class="p-6">
						<div class="space-y-4">
							<!-- Header -->
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<div class="flex items-center gap-2">
										<h3 class="font-semibold text-lg">
											{booking.contactInfoUnlocked ? booking.clientName : 'New Booking Request'}
										</h3>
										<Badge class="{statusInfo.color} border">
											{statusInfo.label}
										</Badge>
									</div>
									<p class="text-sm text-muted-foreground">
										Requested {formatDate(new Date(booking.createdAt))}
									</p>
								</div>
							</div>

							<!-- Key Details -->
							<div class="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span class="text-muted-foreground">Start Date:</span>
									<p class="font-medium">{formatDate(new Date(booking.startDate))}</p>
								</div>
								{#if booking.endDate}
									<div>
										<span class="text-muted-foreground">End Date:</span>
										<p class="font-medium">{formatDate(new Date(booking.endDate))}</p>
									</div>
								{/if}
								<div>
									<span class="text-muted-foreground">Students:</span>
									<p class="font-medium">{booking.numberOfStudents}</p>
								</div>
								<div>
									<span class="text-muted-foreground">Hours/Day:</span>
									<p class="font-medium">{booking.hoursPerDay}h</p>
								</div>
							</div>

							<!-- Sports -->
							<div>
								<span class="text-sm text-muted-foreground">Sports:</span>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each booking.sports as sport}
										<Badge variant="outline" class="text-xs">
											{sport.sportName}
										</Badge>
									{/each}
								</div>
							</div>

							<!-- Price Estimate -->
							{#if booking.estimatedPrice}
								<div class="rounded-md bg-muted/50 p-3">
									<div class="flex items-center justify-between">
										<span class="text-sm text-muted-foreground">Estimated Price:</span>
										<span class="text-lg font-bold">
											{booking.estimatedPrice}{booking.currency}
										</span>
									</div>
								</div>
							{/if}

							<!-- Actions -->
							<div class="flex flex-col gap-2 pt-2">
								<Button onclick={() => handleViewDetails(booking)} class="flex-1" variant="outline">
									View Details
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	<!-- Info Box -->
	{#if bookingsWithUniqueKeys.length > 0 && counts.pending > 0}
		<div class="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
			<div class="flex gap-3">
				<svg
					class="h-5 w-5 flex-shrink-0 text-blue-600"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
				<div class="text-sm text-blue-800">
					<p class="font-medium">💡 {$t('bookings_how_it_works_title')}</p>
					<p class="mt-1">
						{$t('bookings_unlock_info')}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Detail Dialog -->
{#if selectedBooking}
	<RequestDetailDialog request={selectedBooking} type="booking" bind:open={dialogOpen} />
{/if}

<!-- Add Manual Booking Dialog -->
<AddManualBookingDialog bind:open={addBookingDialogOpen} instructorLessons={data.instructorLessons} />
