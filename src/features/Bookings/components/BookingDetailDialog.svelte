<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import { Separator } from '$src/lib/components/ui/separator';
	import { formatDate } from '$src/lib/utils/generics';
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';

	let {
		booking,
		open = $bindable(false)
	}: {
		booking: any;
		open: boolean;
	} = $props();

	let isSubmitting = $state(false);
	let actionResult = $state<{ success?: boolean; message?: string } | null>(null);
	let showRejectConfirm = $state(false);

	const statusConfig = $derived({
		pending: { label: m.status_pending_payment(), color: 'bg-yellow-100 text-yellow-800' },
		unlocked: { label: m.status_unlocked(), color: 'bg-blue-100 text-blue-800' },
		accepted: { label: m.status_accepted(), color: 'bg-green-100 text-green-800' },
		rejected: { label: m.status_rejected(), color: 'bg-red-100 text-red-800' },
		cancelled: { label: m.status_cancelled ? m.status_cancelled() : 'Cancelled by Client', color: 'bg-gray-100 text-gray-800' },
		expired: { label: m.status_expired ? m.status_expired() : 'Expired', color: 'bg-gray-100 text-gray-800' }
	});

	const getStatus = () => {
		if (booking.status === 'rejected') return 'rejected';
		if (booking.status === 'cancelled') return 'cancelled';
		if (booking.status === 'expired') return 'expired';
		if (booking.status === 'accepted') return 'accepted';
		if (booking.contactInfoUnlocked || booking.status === 'viewed') return 'unlocked';
		return 'pending';
	};

	const currentStatus = $derived(getStatus());
	const statusInfo = $derived(statusConfig[currentStatus]);

	// Determine if booking is in an inactive state
	const isInactiveBooking = $derived(['rejected', 'cancelled', 'expired'].includes(booking.status));

	let depositStatus = $state<any>(null);
	let isLoadingDeposit = $state(false);

	// Load deposit status when dialog opens
	$effect(() => {
		if (open && booking.id) {
			loadDepositStatus();
		}
	});

	async function loadDepositStatus() {
		isLoadingDeposit = true;
		try {
			const response = await fetch(`/api/deposits/status/${booking.id}`);
			if (response.ok) {
				depositStatus = await response.json();
			}
		} catch (error) {
			console.error('Error loading deposit status:', error);
		} finally {
			isLoadingDeposit = false;
		}
	}

	// Parse time slots from JSON string
	const formatTimeSlots = (timeSlots: string) => {
		try {
			const slots = JSON.parse(timeSlots);
			if (Array.isArray(slots)) {
				return slots;
			}
			return [];
		} catch {
			return [];
		}
	};

	const timeSlots = $derived(formatTimeSlots(booking.timeSlots || '[]'));
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				Booking Request Details
				<Badge class="{statusInfo.color} border">
					{statusInfo.label}
				</Badge>
			</Dialog.Title>
			<Dialog.Description>
				Review the booking details and take action
			</Dialog.Description>
			{#if booking.createdAt}
				<p class="text-xs text-muted-foreground mt-2">
					Created: {new Date(booking.createdAt).toLocaleString()}
				</p>
			{/if}
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Status Message for Cancelled/Rejected/Expired -->
			{#if isInactiveBooking}
				<div class="rounded-lg border-2 {booking.status === 'cancelled' ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'} p-4">
					<div class="flex items-center gap-3">
						<svg class="h-6 w-6 {booking.status === 'cancelled' ? 'text-gray-600' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<div class="flex-1">
							<h3 class="font-semibold {booking.status === 'cancelled' ? 'text-gray-900' : 'text-red-900'}">
								{#if booking.status === 'cancelled'}
									Booking Cancelled by Client
								{:else if booking.status === 'expired'}
									Booking Expired
								{:else}
									Booking Rejected
								{/if}
							</h3>
							<p class="text-sm {booking.status === 'cancelled' ? 'text-gray-600' : 'text-red-600'} mt-1">
								{#if booking.status === 'cancelled'}
									The client has cancelled this booking request.
								{:else if booking.status === 'expired'}
									This booking request has expired.
								{:else}
									You have rejected this booking request.
								{/if}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Contact Information / Payment Section -->
			{#if booking.contactInfoUnlocked}
				<div class="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
					<h3 class="mb-3 font-semibold flex items-center gap-2">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						Client Contact Information
					</h3>
					<div class="grid gap-3 text-sm">
						<div>
							<span class="text-muted-foreground">Name:</span>
							<p class="font-medium">{booking.clientName}</p>
						</div>
						<div>
							<span class="text-muted-foreground">Email:</span>
							<p class="font-medium">
								<a href="mailto:{booking.clientEmail}" class="text-primary hover:underline">
									{booking.clientEmail}
								</a>
							</p>
						</div>
						{#if booking.clientPhone}
							<div>
								<span class="text-muted-foreground">Phone:</span>
								<p class="font-medium">
									<a href="tel:+{booking.clientCountryCode}{booking.clientPhone}" class="text-primary hover:underline">
										+{booking.clientCountryCode} {booking.clientPhone}
									</a>
								</p>
							</div>
						{/if}
					</div>
				</div>
			{:else if !isInactiveBooking}
				<!-- Preview with blur effect - Only show for active pending bookings -->
				<div class="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
					<div class="mb-3 flex items-center justify-between">
						<h3 class="font-semibold text-yellow-800">🔒 Contact Information Locked</h3>
						<Badge variant="secondary">€5 to unlock</Badge>
					</div>
					
					<!-- Blurred preview -->
					<div class="relative mb-4 rounded bg-white p-3 text-sm">
						<div class="absolute inset-0 backdrop-blur-sm bg-white/60 rounded flex items-center justify-center">
							<svg class="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
						<div class="space-y-2 blur-sm select-none">
							<p><strong>Name:</strong> John D***</p>
							<p><strong>Email:</strong> j***@e***.com</p>
							<p><strong>Phone:</strong> +** *** ****</p>
						</div>
					</div>

					<div class="space-y-3">
						<p class="text-sm text-yellow-800">
							💡 Review the lesson details below. If interested, pay €5 to unlock contact information and connect with this client.
						</p>
						
						<Button
							onclick={() => (window.location.href = `/leads/payment/${booking.id}`)}
							class="w-full"
							size="lg"
						>
							Pay €5 to Unlock Contact Info
						</Button>

						<p class="text-xs text-center text-muted-foreground">
							The client will be notified when you unlock their contact information
						</p>
					</div>
				</div>
			{/if}

			<!-- Deposit Status -->
			{#if depositStatus?.exists}
				<div class="rounded-lg border-2 {depositStatus.status === 'held' ? 'border-green-200 bg-green-50' : depositStatus.status === 'refunded' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'} p-4">
					<h3 class="mb-3 font-semibold flex items-center gap-2">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						Client Deposit Status
					</h3>
					<div class="grid gap-3 text-sm">
						<div>
							<span class="text-muted-foreground">Status:</span>
							<p class="font-medium capitalize">{depositStatus.status}</p>
						</div>
						<div>
							<span class="text-muted-foreground">Amount:</span>
							<p class="font-medium">{depositStatus.amount} {depositStatus.currency.toUpperCase()}</p>
						</div>
						{#if depositStatus.status === 'held'}
							<div class="rounded bg-green-100 p-2 text-green-800">
								<p class="text-xs">✓ Client paid deposit - shows serious commitment</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<Separator />

			<!-- Lesson Details -->
			<div>
				<h3 class="mb-3 font-semibold">Lesson Details</h3>
				<div class="grid gap-4 sm:grid-cols-2 text-sm">
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
						<span class="text-muted-foreground">Number of Students:</span>
						<p class="font-medium">{booking.numberOfStudents}</p>
					</div>
					<div>
						<span class="text-muted-foreground">Hours per Day:</span>
						<p class="font-medium">{booking.hoursPerDay}h</p>
					</div>
					<div>
						<span class="text-muted-foreground">Skill Level:</span>
						<p class="font-medium capitalize">{booking.skillLevel}</p>
					</div>
					<div>
						<span class="text-muted-foreground">Sports:</span>
						<div class="mt-1 flex flex-wrap gap-1">
							{#each booking.sports as sport}
								<Badge variant="outline" class="text-xs">
									{sport.sportName}
								</Badge>
							{/each}
						</div>
					</div>
				</div>

				{#if timeSlots.length > 0}
					<div class="mt-4">
						<span class="text-muted-foreground text-sm">{m.client_requested_times()}</span>
						<div class="mt-2 flex flex-wrap gap-2">
							{#each timeSlots as slot}
								<Badge variant="secondary" class="text-sm">
									{slot}
								</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Price Estimate -->
			{#if booking.estimatedPrice}
				<div class="rounded-lg bg-muted/50 p-4">
					<div class="flex items-center justify-between">
						<span class="font-medium">Estimated Price:</span>
						<span class="text-2xl font-bold text-primary">
							{booking.estimatedPrice}{booking.currency}
						</span>
					</div>
					<p class="mt-1 text-xs text-muted-foreground">
						This is an estimate. You can negotiate the final price with the client.
					</p>
				</div>
			{/if}

			<!-- Additional Message -->
			{#if booking.message}
				<div>
					<h3 class="mb-2 font-semibold">Client Message</h3>
					<div class="rounded-md border bg-muted/30 p-3 text-sm">
						<p class="whitespace-pre-wrap">{booking.message}</p>
					</div>
				</div>
			{/if}

			<!-- Action Results -->
			{#if actionResult}
				<div
					class="rounded-md p-3 {actionResult.success
						? 'bg-green-50 text-green-800'
						: 'bg-red-50 text-red-800'}"
				>
					<p class="text-sm">{actionResult.message}</p>
				</div>
			{/if}

			<!-- Actions -->
			<!-- BEFORE PAYMENT: Two clear options -->
			{#if !booking.contactInfoUnlocked && booking.status === 'pending'}
				<div class="flex gap-3 pt-4">
					<!-- Option 1: Free Reject (with confirmation) -->
					<Button
						variant="outline"
						class="flex-1"
						onclick={() => showRejectConfirm = true}
						disabled={isSubmitting}
					>
						Not Interested
					</Button>

					<!-- Option 2: Pay & Accept (combined action) -->
					<Button
						onclick={() => (window.location.href = `/leads/payment/${booking.id}`)}
						class="flex-1"
					>
						Pay €5 & Accept Booking
					</Button>
				</div>

				<p class="text-xs text-center text-muted-foreground mt-2">
					💡 Only pay if you're ready to accept this booking
				</p>
			{/if}

			<!-- AFTER PAYMENT: Show acceptance confirmation, NO MORE ACTIONS -->
			{#if booking.contactInfoUnlocked}
				<div class="rounded-lg border-2 border-green-200 bg-green-50 p-4 mb-4">
					<div class="flex items-center gap-2 text-green-800">
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
						</svg>
						<span class="font-semibold">Booking Accepted</span>
					</div>
					<p class="text-sm text-green-700 mt-1">
						You've unlocked contact info and accepted this booking. Contact the client to arrange details.
					</p>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Rejection Confirmation Dialog -->
<Dialog.Root bind:open={showRejectConfirm}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Reject Booking Request?</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to reject this booking request?
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
				<div class="flex gap-3">
					<svg class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<div class="text-sm text-amber-800 dark:text-amber-200">
						<p class="font-semibold mb-1">Important Information:</p>
						<ul class="list-disc list-inside space-y-1">
							<li>This action cannot be undone</li>
							<li>The client will be notified</li>
							<li>You won't be able to see this request again</li>
							<li>The time slots will be released back to your calendar</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<div class="flex gap-3 justify-end">
			<Button
				variant="outline"
				onclick={() => showRejectConfirm = false}
			>
				Cancel
			</Button>

			<form
				method="POST"
				action="?/rejectBooking"
				use:enhance={() => {
					isSubmitting = true;
					showRejectConfirm = false;
					return async ({ result, update }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							actionResult = { success: true, message: 'Booking rejected' };
							setTimeout(() => {
								open = false;
								window.location.reload();
							}, 1500);
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="bookingId" value={booking.id} />
				<Button
					type="submit"
					variant="destructive"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Rejecting...' : 'Yes, Reject Booking'}
				</Button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>