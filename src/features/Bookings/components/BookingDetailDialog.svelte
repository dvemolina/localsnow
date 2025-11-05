<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import { Separator } from '$src/lib/components/ui/separator';
	import { formatDate } from '$src/lib/utils/generics';
	import { enhance } from '$app/forms';

	let {
		booking,
		open = $bindable(false)
	}: {
		booking: any;
		open: boolean;
	} = $props();

	let isSubmitting = $state(false);
	let actionResult = $state<{ success?: boolean; message?: string } | null>(null);

	const statusConfig = {
		pending: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' },
		unlocked: { label: 'Unlocked', color: 'bg-blue-100 text-blue-800' },
		accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
		rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
	};

	const getStatus = () => {
		if (booking.status === 'rejected') return 'rejected';
		if (booking.status === 'accepted') return 'accepted';
		if (booking.contactInfoUnlocked) return 'unlocked';
		return 'pending';
	};

	const currentStatus = $derived(getStatus());
	const statusInfo = $derived(statusConfig[currentStatus]);
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
		</Dialog.Header>

		<div class="space-y-6 py-4">
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
			{:else}
				<!-- Preview with blur effect -->
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
			{#if booking.contactInfoUnlocked && booking.status !== 'accepted' && booking.status !== 'rejected'}
				<div class="flex gap-3 pt-4">
					<form
						method="POST"
						action="?/rejectBooking"
						class="flex-1"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									actionResult = { success: true, message: 'Booking rejected' };
									setTimeout(() => {
										open = false;
										window.location.reload();
									}, 1500);
								} else {
									actionResult = { success: false, message: 'Failed to reject booking' };
								}
								await update();
							};
						}}
					>
						<input type="hidden" name="bookingId" value={booking.id} />
						<Button type="submit" variant="outline" class="w-full" disabled={isSubmitting}>
							Reject
						</Button>
					</form>

					<form
						method="POST"
						action="?/acceptBooking"
						class="flex-1"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									actionResult = { success: true, message: 'Booking accepted!' };
									setTimeout(() => {
										open = false;
										window.location.reload();
									}, 1500);
								} else {
									actionResult = { success: false, message: 'Failed to accept booking' };
								}
								await update();
							};
						}}
					>
						<input type="hidden" name="bookingId" value={booking.id} />
						<Button type="submit" class="w-full" disabled={isSubmitting}>
							{isSubmitting ? 'Processing...' : 'Accept Booking'}
						</Button>
					</form>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>