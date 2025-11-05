<script lang="ts">
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { Badge } from '$src/lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let syncing = $state(false);
	let disconnecting = $state(false);

	async function connectCalendar() {
		try {
			const res = await fetch('/api/calendar/connect');
			const json = await res.json();

			if (json.connected) {
				toast.info('Calendar already connected');
				return;
			}

			if (json.authUrl) {
				window.location.href = json.authUrl;
			}
		} catch (error) {
			toast.error('Failed to start connection process');
		}
	}

	async function syncNow() {
		syncing = true;
		try {
			const res = await fetch('/api/calendar/connect', { method: 'POST' });
			const json = await res.json();

			if (json.success) {
				toast.success(`Synced ${json.eventsImported} events from Google Calendar`);
				await invalidateAll();
			} else {
				toast.error(json.error || 'Sync failed');
			}
		} catch (error) {
			toast.error('Failed to sync calendar');
		} finally {
			syncing = false;
		}
	}

	async function disconnectCalendar() {
		if (!confirm('Are you sure you want to disconnect your Google Calendar?')) {
			return;
		}

		disconnecting = true;
		try {
			const res = await fetch('/api/calendar/connect', { method: 'DELETE' });
			const json = await res.json();

			if (json.success) {
				toast.success('Calendar disconnected successfully');
				await invalidateAll();
			} else {
				toast.error('Failed to disconnect calendar');
			}
		} catch (error) {
			toast.error('Failed to disconnect calendar');
		} finally {
			disconnecting = false;
		}
	}

	// Show toast messages from OAuth callback
	$effect(() => {
		if (data.successMessage) {
			toast.success(data.successMessage);
		}
		if (data.errorMessage) {
			toast.error(data.errorMessage);
		}
	});
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">Availability Settings</h1>
		<p class="text-muted-foreground">
			Manage your calendar sync and availability settings
		</p>
	</div>

	<!-- Google Calendar Connection Card -->
	<Card.Root class="border-2">
		<Card.Header>
			<div class="flex items-start justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Google Calendar Integration
						{#if data.connected}
							<Badge variant="default" class="bg-green-600">Connected</Badge>
						{:else}
							<Badge variant="secondary">Not Connected</Badge>
						{/if}
					</Card.Title>
					<Card.Description class="mt-1">
						Sync your Google Calendar to automatically block unavailable times
					</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if data.connected && data.syncDetails}
				<!-- Connected State -->
				<div class="rounded-lg bg-green-50 p-4">
					<div class="flex items-start gap-3">
						<svg
							class="h-5 w-5 flex-shrink-0 text-green-600"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						<div class="text-sm text-green-800">
							<p class="font-medium">Calendar Connected</p>
							<p class="mt-1">
								Your Google Calendar is synced. Events will automatically block availability slots
								for clients.
							</p>
							{#if data.syncDetails.lastSyncAt}
								<p class="mt-2 text-xs">
									Last synced: {new Date(data.syncDetails.lastSyncAt).toLocaleString()}
								</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Sync Actions -->
				<div class="flex flex-col sm:flex-row gap-3">
					<Button onclick={syncNow} disabled={syncing} variant="outline">
						{#if syncing}
							<svg
								class="mr-2 h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Syncing...
						{:else}
							<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Sync Now
						{/if}
					</Button>
					<Button
						onclick={disconnectCalendar}
						disabled={disconnecting}
						variant="destructive"
						class="sm:ml-auto"
					>
						{#if disconnecting}
							Disconnecting...
						{:else}
							Disconnect Calendar
						{/if}
					</Button>
				</div>
			{:else}
				<!-- Not Connected State -->
				<div class="rounded-lg border-2 border-dashed border-border p-6 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
					>
						<svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 font-semibold text-lg">Connect Your Google Calendar</h3>
					<p class="mb-4 text-muted-foreground">
						Automatically sync your calendar events to show accurate availability to clients
					</p>
					<Button onclick={connectCalendar} class="mx-auto">
						<svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Connect Google Calendar
					</Button>
				</div>

				<!-- Info Box -->
				<div class="rounded-md border border-blue-200 bg-blue-50 p-4">
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
							<p class="font-medium">Why connect your calendar?</p>
							<ul class="mt-2 space-y-1 text-sm">
								<li>• Automatically block times when you're busy</li>
								<li>• Prevent double bookings</li>
								<li>• Keep your availability always up-to-date</li>
								<li>• Save time - no manual updates needed</li>
							</ul>
							<p class="mt-2 text-xs">
								We only read your calendar events to check availability. We never modify or delete
								your events.
							</p>
						</div>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Working Hours Card -->
	<Card.Root class="mt-6 border-2">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				Working Hours
				{#if data.workingHoursConfigured}
					<Badge variant="default" class="bg-green-600">Configured</Badge>
				{:else}
					<Badge variant="secondary">Not Set</Badge>
				{/if}
			</Card.Title>
			<Card.Description>
				Set your regular working hours and seasonal availability
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if data.workingHoursConfigured}
				<div class="rounded-lg bg-green-50 p-4">
					<div class="flex items-start gap-3">
						<svg
							class="h-5 w-5 flex-shrink-0 text-green-600"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						<div class="text-sm text-green-800">
							<p class="font-medium">Working Hours Set</p>
							<p class="mt-1">
								You have configured your working hours. Clients can now book lessons during your
								available times.
							</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="rounded-lg border-2 border-dashed border-border p-6 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
					>
						<svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 font-semibold text-lg">Set Your Working Hours</h3>
					<p class="mb-4 text-muted-foreground">
						Define your available hours for each day of the week to let clients know when they can
						book lessons
					</p>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer>
			<Button href="/dashboard/availability/working-hours" class="w-full">
				{data.workingHoursConfigured ? 'Edit Working Hours' : 'Set Working Hours'}
			</Button>
		</Card.Footer>
	</Card.Root>
</div>