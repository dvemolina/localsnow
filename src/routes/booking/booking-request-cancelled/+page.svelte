<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	const bookingId = page.url.searchParams.get('bookingId');
	let cleanupStatus = $state<'pending' | 'success' | 'error'>('pending');
	let errorMessage = $state<string>('');

	// Cleanup the booking if user cancelled
	onMount(async () => {
		if (bookingId) {
			try {
				const response = await fetch(`/api/bookings/${bookingId}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!response.ok) {
					const data = await response.json().catch(() => ({ message: 'Unknown error' }));
					throw new Error(data.message || `HTTP ${response.status}`);
				}

				cleanupStatus = 'success';
			} catch (err) {
				console.error('Failed to cleanup booking:', err);
				cleanupStatus = 'error';
				errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			}
		} else {
			cleanupStatus = 'error';
			errorMessage = 'No booking ID provided';
		}
	});
</script>

<svelte:head>
	<title>Booking Cancelled - Local Snow</title>
</svelte:head>

<section class="mx-auto max-w-2xl py-12">
	<div class="rounded-lg border border-border bg-card p-8 text-center">
		<!-- Cancelled Icon -->
		<div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gray-100">
			<svg class="size-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</div>

		<!-- Message -->
		<h1 class="title2 mb-4">Booking Request Cancelled</h1>
		<p class="mb-8 text-muted-foreground">
			Your booking request was not submitted. No charges were made to your account.
		</p>

		<!-- Info Box -->
		<div class="mb-6 rounded-lg bg-muted/50 p-4 text-left text-sm">
			<p class="text-muted-foreground">
				You can restart the booking process at any time by selecting an instructor and filling out the booking form again.
			</p>
		</div>

		<!-- Cleanup Status -->
		{#if cleanupStatus === 'error'}
			<div class="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
				<p class="text-sm text-red-600 dark:text-red-400">
					<strong>Note:</strong> There was an issue cleaning up the booking request. Please contact support if you cannot create a new booking with this instructor.
				</p>
				{#if errorMessage}
					<p class="text-xs text-red-500 dark:text-red-500 mt-2">Error: {errorMessage}</p>
				{/if}
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button onclick={() => window.location.href = '/instructors'} variant="default">
				Find an Instructor
			</Button>
			<Button onclick={() => window.location.href = '/'} variant="outline">
				Back to Home
			</Button>
		</div>
	</div>
</section>