<script lang="ts">
	import BookingCard from '$src/features/Bookings/components/BookingCard.svelte';
	import BookingDetailDialog from '$src/features/Bookings/components/BookingDetailDialog.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';
	import { goto } from '$app/navigation';

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

	// Add console logging to debug the data
	$effect(() => {
		console.log('Bookings data:', data.bookings);
		console.log('Booking IDs:', data.bookings.map((b: any) => b.id));
		
		// Check for duplicates
		const ids = data.bookings.map((b: any) => b.id);
		const duplicates = ids.filter((id: number, index: number) => ids.indexOf(id) !== index);
		if (duplicates.length > 0) {
			console.error('Duplicate booking IDs found:', duplicates);
		}
	});

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
		<h1 class="title2 mb-2">Booking Requests</h1>
		<p class="text-muted-foreground">
			Manage your lesson requests and connect with clients
		</p>
	</div>

	<!-- Filter Tabs -->
	<Tabs.Root value={data.currentFilter} class="mb-6">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="all" onclick={() => changeFilter('all')}>
				All
				{#if counts.all > 0}
					<Badge variant="secondary" class="ml-2">{counts.all}</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="pending" onclick={() => changeFilter('pending')}>
				Pending
				{#if counts.pending > 0}
					<Badge variant="secondary" class="ml-2 bg-yellow-100 text-yellow-800">
						{counts.pending}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="unlocked" onclick={() => changeFilter('unlocked')}>
				Unlocked
				{#if counts.unlocked > 0}
					<Badge variant="secondary" class="ml-2 bg-blue-100 text-blue-800">
						{counts.unlocked}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="rejected" onclick={() => changeFilter('rejected')}>
				Rejected
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
			<h3 class="mb-2 font-semibold text-lg">No Booking Requests</h3>
			<p class="text-muted-foreground">
				{#if data.currentFilter === 'all'}
					You don't have any booking requests yet. When clients request lessons, they'll appear here.
				{:else if data.currentFilter === 'pending'}
					No pending requests waiting for payment.
				{:else if data.currentFilter === 'unlocked'}
					No unlocked bookings at the moment.
				{:else}
					No rejected bookings.
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
					<p class="font-medium">💡 How It Works</p>
					<p class="mt-1">
						Pay €5 to unlock a client's contact information. This one-time fee gives you direct access
						to connect with potential students. Once unlocked, you can accept or reject the booking.
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