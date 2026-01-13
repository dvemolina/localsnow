<script lang="ts">
	import BookingCard from '$src/features/Bookings/components/BookingCard.svelte';
	import BookingDetailDialog from '$src/features/Bookings/components/BookingDetailDialog.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';
	import { goto } from '$app/navigation';
	import { isMobile } from '$src/lib/hooks/is-mobile.svelte.js';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	let selectedBooking = $state<any>(null);
	let dialogOpen = $state(false);

	const handleViewDetails = (booking: any) => {
		selectedBooking = booking;
		dialogOpen = true;
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
	<div class="mb-6">
		<h1 class="title2 mb-2">{$t('bookings_page_title')}</h1>
		<p class="text-muted-foreground">
			{$t('bookings_page_subtitle')}
		</p>
	</div>

	<!-- Filter Tabs -->
	<Tabs.Root value={data.currentFilter} class="mb-6" orientation={ isMobile ? 'vertical' : 'horizontal' }>
		<Tabs.List class="grid w-full h-full grid-cols-2 md:grid-cols-4">
			<Tabs.Trigger value="all" onclick={() => changeFilter('all')}>
				{$t('instructors_filter_all')}
				{#if counts.all > 0}
					<Badge variant="secondary" class="ml-2">{counts.all}</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="pending" onclick={() => changeFilter('pending')}>
				{$t('bookings_filter_pending')}
				{#if counts.pending > 0}
					<Badge variant="secondary" class="ml-2 bg-yellow-100 text-yellow-800">
						{counts.pending}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="unlocked" onclick={() => changeFilter('unlocked')}>
				{$t('bookings_filter_unlocked')}
				{#if counts.unlocked > 0}
					<Badge variant="secondary" class="ml-2 bg-blue-100 text-blue-800">
						{counts.unlocked}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="rejected" onclick={() => changeFilter('rejected')}>
				{$t('bookings_filter_rejected')}
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
				<BookingCard {booking} onViewDetails={() => handleViewDetails(booking)} />
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
	<BookingDetailDialog booking={selectedBooking} bind:open={dialogOpen} />
{/if}
