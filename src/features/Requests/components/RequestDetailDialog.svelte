<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { formatDate } from '$src/lib/utils/generics';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/i18n';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let {
		request,
		type = 'lead',
		open = $bindable(false)
	}: {
		request: any;
		type: 'lead' | 'booking';
		open: boolean;
	} = $props();

	let isSubmitting = $state(false);
	let actionResult = $state<{ success?: boolean; message?: string } | null>(null);
	let showRejectConfirm = $state(false);
	let updatingStatus = $state(false);

	// Status configuration
	const statusConfig = $derived(
		type === 'lead'
			? {
					new: { label: $t('status_new') || 'New', color: 'bg-blue-100 text-blue-800' },
					contacted: { label: $t('status_contacted') || 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
					converted: { label: $t('status_converted') || 'Converted', color: 'bg-green-100 text-green-800' },
					spam: { label: $t('status_spam') || 'Spam', color: 'bg-red-100 text-red-800' }
			  }
			: {
					pending: { label: $t('status_pending_payment'), color: 'bg-yellow-100 text-yellow-800' },
					unlocked: { label: $t('status_unlocked'), color: 'bg-blue-100 text-blue-800' },
					accepted: { label: $t('status_accepted'), color: 'bg-green-100 text-green-800' },
					rejected: { label: $t('status_rejected'), color: 'bg-red-100 text-red-800' },
					cancelled: { label: $t('status_cancelled'), color: 'bg-gray-100 text-gray-800' },
					expired: { label: $t('status_expired'), color: 'bg-gray-100 text-gray-800' }
			  }
	);

	const getStatus = () => {
		if (type === 'lead') {
			return request.status || 'new';
		} else {
			if (request.status === 'rejected') return 'rejected';
			if (request.status === 'cancelled') return 'cancelled';
			if (request.status === 'expired') return 'expired';
			if (request.status === 'accepted') return 'accepted';
			if (request.contactInfoUnlocked || request.status === 'viewed') return 'unlocked';
			return 'pending';
		}
	};

	const currentStatus = $derived(getStatus());
	const statusInfo = $derived(statusConfig[currentStatus]);

	// Determine if booking is in an inactive state
	const isInactiveBooking = $derived(
		type === 'booking' && ['rejected', 'cancelled', 'expired'].includes(request.status)
	);

	// Parse time slots from JSON string (for bookings)
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

	const timeSlots = $derived(type === 'booking' ? formatTimeSlots(request.timeSlots || '[]') : []);

	// Lead status update
	async function updateLeadStatus(newStatus: string) {
		updatingStatus = true;
		try {
			const response = await fetch(`/api/leads/${request.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (!response.ok) {
				throw new Error('Failed to update status');
			}

			toast.success($t('success_lead_status_updated') || 'Status updated successfully');
			await invalidateAll();
			open = false;
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error($t('error_update_lead_status') || 'Failed to update status');
		} finally {
			updatingStatus = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				{type === 'lead'
					? ($t('lead_details_title') || 'Contact Inquiry Details')
					: 'Booking Request Details'}
				<Badge class="{statusInfo.color} border">
					{statusInfo.label}
				</Badge>
			</Dialog.Title>
			<Dialog.Description>
				{type === 'lead'
					? ($t('lead_details_description') || 'Review the inquiry and update its status')
					: 'Review the booking details and take action'}
			</Dialog.Description>
			{#if request.createdAt}
				<p class="text-xs text-muted-foreground mt-2">
					{type === 'lead' ? 'Received' : 'Created'}: {new Date(request.createdAt).toLocaleString()}
				</p>
			{/if}
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Status Message for Cancelled/Rejected/Expired (Bookings only) -->
			{#if isInactiveBooking}
				<div
					class="rounded-lg border-2 {request.status === 'cancelled'
						? 'border-gray-200 bg-gray-50'
						: 'border-red-200 bg-red-50'} p-4"
				>
					<div class="flex items-center gap-3">
						<svg
							class="h-6 w-6 {request.status === 'cancelled'
								? 'text-gray-600'
								: 'text-red-600'}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<div class="flex-1">
							<h3
								class="font-semibold {request.status === 'cancelled'
									? 'text-gray-900'
									: 'text-red-900'}"
							>
								{#if request.status === 'cancelled'}
									Booking Cancelled by Client
								{:else if request.status === 'expired'}
									Booking Expired
								{:else}
									Booking Rejected
								{/if}
							</h3>
							<p
								class="text-sm {request.status === 'cancelled'
									? 'text-gray-600'
									: 'text-red-600'} mt-1"
							>
								{#if request.status === 'cancelled'}
									The client has cancelled this booking request.
								{:else if request.status === 'expired'}
									This booking request has expired.
								{:else}
									You have rejected this booking request.
								{/if}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Contact Information -->
			{#if type === 'lead' || (type === 'booking' && !isInactiveBooking)}
				<div class="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
					<h3 class="mb-3 font-semibold flex items-center gap-2">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
						{$t('label_client_contact_info') || 'Client Contact Information'}
					</h3>
					<div class="grid gap-3 text-sm">
						<div>
							<span class="text-muted-foreground">{$t('label_name') || 'Name'}:</span>
							<p class="font-medium">{request.clientName || $t('label_anonymous') || 'Anonymous'}</p>
						</div>
						<div>
							<span class="text-muted-foreground">{$t('label_email') || 'Email'}:</span>
							<p class="font-medium">
								<a href="mailto:{request.clientEmail}" class="text-primary hover:underline">
									{request.clientEmail}
								</a>
							</p>
						</div>
						{#if request.clientPhone}
							<div>
								<span class="text-muted-foreground">{$t('label_phone') || 'Phone'}:</span>
								<p class="font-medium">
									<a
										href="tel:{request.clientPhone}"
										class="text-primary hover:underline"
									>
										{request.clientPhone}
									</a>
								</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<Separator />

			<!-- Lesson Details -->
			{#if type === 'lead'}
				<!-- Lead Lesson Details -->
				{#if request.preferredDates || request.numberOfStudents || request.skillLevel}
					<div>
						<h3 class="mb-3 font-semibold">{$t('label_lesson_preferences') || 'Lesson Preferences'}</h3>
						<div class="grid gap-4 sm:grid-cols-2 text-sm">
							{#if request.preferredDates}
								<div>
									<span class="text-muted-foreground">{$t('label_preferred_dates') || 'Preferred Dates'}:</span>
									<p class="font-medium">{request.preferredDates}</p>
								</div>
							{/if}
							{#if request.numberOfStudents}
								<div>
									<span class="text-muted-foreground">{$t('label_number_of_students') || 'Number of Students'}:</span>
									<p class="font-medium">{request.numberOfStudents}</p>
								</div>
							{/if}
							{#if request.skillLevel}
								<div>
									<span class="text-muted-foreground">{$t('label_skill_level') || 'Skill Level'}:</span>
									<p class="font-medium capitalize">{request.skillLevel}</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{:else}
				<!-- Booking Lesson Details -->
				<div>
					<h3 class="mb-3 font-semibold">Lesson Details</h3>
					<div class="grid gap-4 sm:grid-cols-2 text-sm">
						<div>
							<span class="text-muted-foreground">Start Date:</span>
							<p class="font-medium">{formatDate(new Date(request.startDate))}</p>
						</div>
						{#if request.endDate}
							<div>
								<span class="text-muted-foreground">End Date:</span>
								<p class="font-medium">{formatDate(new Date(request.endDate))}</p>
							</div>
						{/if}
						<div>
							<span class="text-muted-foreground">Number of Students:</span>
							<p class="font-medium">{request.numberOfStudents}</p>
						</div>
						<div>
							<span class="text-muted-foreground">Hours per Day:</span>
							<p class="font-medium">{request.hoursPerDay}h</p>
						</div>
						<div>
							<span class="text-muted-foreground">Skill Level:</span>
							<p class="font-medium capitalize">{request.skillLevel}</p>
						</div>
						<div>
							<span class="text-muted-foreground">Sports:</span>
							<div class="mt-1 flex flex-wrap gap-1">
								{#each request.sports as sport}
									<Badge variant="outline" class="text-xs">
										{sport.sportName}
									</Badge>
								{/each}
							</div>
						</div>
					</div>

					{#if timeSlots.length > 0}
						<div class="mt-4">
							<span class="text-muted-foreground text-sm"
								>{$t('client_requested_times') || 'Requested Times'}</span
							>
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

				<!-- Price Estimate (Booking only) -->
				{#if request.estimatedPrice}
					<div class="rounded-lg bg-muted/50 p-4">
						<div class="flex items-center justify-between">
							<span class="font-medium">Estimated Price:</span>
							<span class="text-2xl font-bold text-primary">
								{request.estimatedPrice}{request.currency}
							</span>
						</div>
						<p class="mt-1 text-xs text-muted-foreground">
							This is an estimate. You can negotiate the final price with the client.
						</p>
					</div>
				{/if}
			{/if}

			<!-- Client Message -->
			{#if request.message}
				<div>
					<h3 class="mb-2 font-semibold">{$t('label_client_message') || 'Client Message'}</h3>
					<div class="rounded-md border bg-muted/30 p-3 text-sm">
						<p class="whitespace-pre-wrap">{request.message}</p>
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
			{#if type === 'lead'}
				<!-- Lead Actions: Status Dropdown -->
				<div class="space-y-3">
					<h3 class="text-sm font-semibold">{$t('label_update_status') || 'Update Status'}</h3>
					<Select.Root
						selected={{
							value: request.status,
							label: statusConfig[request.status]?.label || request.status
						}}
						onSelectedChange={async (selected) => {
							if (selected?.value && selected.value !== request.status) {
								await updateLeadStatus(selected.value);
							}
						}}
					>
						<Select.Trigger disabled={updatingStatus}>
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="new">{$t('status_new') || 'New'}</Select.Item>
							<Select.Item value="contacted">{$t('status_contacted') || 'Contacted'}</Select.Item>
							<Select.Item value="converted">{$t('status_converted') || 'Converted'}</Select.Item>
							<Select.Item value="spam">{$t('status_spam') || 'Spam'}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			{:else if request.status === 'pending' && !isInactiveBooking}
				<!-- Booking Actions: Accept/Reject -->
				<div class="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
					<div class="flex items-center gap-2 text-blue-800 mb-2">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="font-semibold">Next Steps</span>
					</div>
					<p class="text-sm text-blue-700 mb-3">
						Review the booking details and contact the client directly using the information above.
						You can accept this request to confirm your availability, or reject it if you're not
						interested.
					</p>
					<div class="flex gap-3">
						<form
							method="POST"
							action="?/acceptBooking"
							class="flex-1"
							use:enhance={() => {
								isSubmitting = true;
								return async ({ result, update }) => {
									isSubmitting = false;
									if (result.type === 'success') {
										actionResult = {
											success: true,
											message: 'Booking accepted! The client has been notified.'
										};
										setTimeout(() => {
											open = false;
											window.location.reload();
										}, 1500);
									}
									await update();
								};
							}}
						>
							<input type="hidden" name="bookingId" value={request.id} />
							<Button type="submit" class="w-full" disabled={isSubmitting}>
								{isSubmitting ? 'Accepting...' : 'Accept Request'}
							</Button>
						</form>
						<Button
							variant="outline"
							class="flex-1"
							onclick={() => (showRejectConfirm = true)}
							disabled={isSubmitting}
						>
							Reject
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Rejection Confirmation Dialog (for bookings) -->
{#if type === 'booking'}
	<Dialog.Root bind:open={showRejectConfirm}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Reject Booking Request?</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to reject this booking request?
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4 py-4">
				<div
					class="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4"
				>
					<div class="flex gap-3">
						<svg
							class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
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
				<Button variant="outline" onclick={() => (showRejectConfirm = false)}> Cancel </Button>

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
					<input type="hidden" name="bookingId" value={request.id} />
					<Button type="submit" variant="destructive" disabled={isSubmitting}>
						{isSubmitting ? 'Rejecting...' : 'Yes, Reject Booking'}
					</Button>
				</form>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
