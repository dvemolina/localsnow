<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import { t } from '$lib/i18n/i18n';
	import { invalidateAll } from '$app/navigation';
	import { formatDate } from '$src/lib/utils/generics';

	let {
		requests,
		type = 'lead',
		instructorId,
		onViewDetails
	} = $props<{
		requests: any[] | null;
		type: 'lead' | 'booking';
		instructorId: number;
		onViewDetails?: (request: any) => void;
	}>();

	let updatingRequestId = $state<number | null>(null);

	// Status configurations for each type
	const statusConfig = {
		lead: {
			statuses: [
				{ value: 'new', label: $t('status_new') || 'New' },
				{ value: 'contacted', label: $t('status_contacted') || 'Contacted' },
				{ value: 'converted', label: $t('status_converted') || 'Converted' },
				{ value: 'spam', label: $t('status_spam') || 'Spam' }
			],
			colors: {
				new: 'default',
				contacted: 'secondary',
				converted: 'outline',
				spam: 'destructive'
			} as const
		},
		booking: {
			statuses: [
				{ value: 'pending', label: $t('status_pending_review') || 'Pending Review' },
				{ value: 'viewed', label: $t('status_unlocked') || 'Unlocked' },
				{ value: 'accepted', label: $t('status_accepted') || 'Accepted' },
				{ value: 'rejected', label: $t('status_rejected') || 'Rejected' },
				{ value: 'cancelled', label: $t('status_cancelled') || 'Cancelled' },
				{ value: 'expired', label: $t('status_expired') || 'Expired' }
			],
			colors: {
				pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
				viewed: 'bg-blue-100 text-blue-800 border-blue-200',
				accepted: 'bg-green-100 text-green-800 border-green-200',
				rejected: 'bg-red-100 text-red-800 border-red-200',
				cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
				expired: 'bg-gray-100 text-gray-800 border-gray-200'
			}
		}
	};

	async function updateStatus(requestId: number, newStatus: string) {
		updatingRequestId = requestId;

		try {
			const endpoint = type === 'lead'
				? `/api/leads/${requestId}/status`
				: `/api/bookings/${requestId}/status`;

			const response = await fetch(endpoint, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (!response.ok) {
				throw new Error(`Failed to update ${type} status`);
			}

			toast.success($t(`success_${type}_status_updated`) || `${type === 'lead' ? 'Inquiry' : 'Booking'} status updated successfully`);

			// Refresh data
			await invalidateAll();
		} catch (error) {
			console.error(`Error updating ${type} status:`, error);
			toast.error($t(`error_update_${type}_status`) || `Failed to update ${type === 'lead' ? 'inquiry' : 'booking'} status`);
		} finally {
			updatingRequestId = null;
		}
	}

	function getStatusColor(status: string): string {
		if (type === 'lead') {
			return statusConfig.lead.colors[status as keyof typeof statusConfig.lead.colors] || 'secondary';
		} else {
			return statusConfig.booking.colors[status as keyof typeof statusConfig.booking.colors] || 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}

	function getStatusLabel(status: string): string {
		const config = type === 'lead' ? statusConfig.lead : statusConfig.booking;
		return config.statuses.find(s => s.value === status)?.label || status;
	}

	function getBookingStatus(booking: any): string {
		if (booking.status === 'rejected') return 'rejected';
		if (booking.status === 'cancelled') return 'cancelled';
		if (booking.status === 'expired') return 'expired';
		if (booking.status === 'accepted') return 'accepted';
		if (booking.status === 'viewed' || booking.contactInfoUnlocked) return 'viewed';
		return 'pending';
	}
</script>

<Card.Root class="col-span-full">
	<Card.Header>
		<Card.Title>
			{type === 'lead'
				? ($t('dashboard_recent_inquiries') || 'Recent Inquiries')
				: ($t('dashboard_recent_bookings') || 'Recent Bookings')}
		</Card.Title>
		<Card.Description>
			{type === 'lead'
				? ($t('dashboard_recent_inquiries_description') || 'Contact requests from potential clients')
				: ($t('dashboard_recent_bookings_description') || 'Booking requests from clients')}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if requests && requests.length > 0}
			<div class="space-y-4">
				{#each requests as request}
					{@const currentStatus = type === 'booking' ? getBookingStatus(request) : request.status}
					<div class="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
						<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
							<!-- Request Info -->
							<div class="flex-1 space-y-2">
								<div class="flex items-center gap-2">
									<h4 class="font-semibold">
										{#if type === 'booking' && !request.contactInfoUnlocked}
											{$t('label_new_booking_request') || 'New Booking Request'}
										{:else}
											{request.clientName || $t('label_anonymous') || 'Anonymous'}
										{/if}
									</h4>
									<Badge
										variant={type === 'lead' ? getStatusColor(currentStatus) : undefined}
										class={type === 'booking' ? getStatusColor(currentStatus) + ' border' : ''}
									>
										{getStatusLabel(currentStatus)}
									</Badge>
								</div>

								<div class="space-y-1 text-sm text-muted-foreground">
									<!-- Contact info (for leads or unlocked bookings) -->
									{#if type === 'lead' || (type === 'booking' && request.contactInfoUnlocked)}
										<div class="flex items-center gap-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="size-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
											<a href={`mailto:${request.clientEmail}`} class="hover:underline">
												{request.clientEmail}
											</a>
										</div>

										{#if request.clientPhone}
											<div class="flex items-center gap-2">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="size-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
													/>
												</svg>
												<a href={`tel:${request.clientPhone}`} class="hover:underline">
													{request.clientPhone}
												</a>
											</div>
										{/if}
									{/if}

									<!-- Date info -->
									<div class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="size-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<span>
											{type === 'lead'
												? `${$t('label_received') || 'Received'}: ${formatDate(new Date(request.createdAt))}`
												: `${$t('label_requested') || 'Requested'}: ${formatDate(new Date(request.createdAt))}`}
										</span>
									</div>
								</div>

								<!-- Message (for leads) -->
								{#if type === 'lead' && request.message}
									<p class="mt-2 text-sm line-clamp-2">
										{request.message}
									</p>
								{/if}

								<!-- Lesson Details -->
								{#if type === 'lead' && (request.preferredDates || request.numberOfStudents || request.skillLevel)}
									<div class="mt-3 rounded-md bg-muted/50 p-3 space-y-1 text-xs">
										{#if request.preferredDates}
											<div class="flex items-center gap-2">
												<span class="font-medium">{$t('label_preferred_dates') || 'Preferred dates'}:</span>
												<span>{request.preferredDates}</span>
											</div>
										{/if}
										{#if request.numberOfStudents}
											<div class="flex items-center gap-2">
												<span class="font-medium">{$t('label_number_of_students') || 'Students'}:</span>
												<span>{request.numberOfStudents}</span>
											</div>
										{/if}
										{#if request.skillLevel}
											<div class="flex items-center gap-2">
												<span class="font-medium">{$t('label_skill_level') || 'Skill level'}:</span>
												<span class="capitalize">{request.skillLevel}</span>
											</div>
										{/if}
									</div>
								{:else if type === 'booking'}
									<div class="mt-3 grid grid-cols-2 gap-4 text-sm">
										<div>
											<span class="text-muted-foreground">{$t('label_start_date') || 'Start Date'}:</span>
											<p class="font-medium">{formatDate(new Date(request.startDate))}</p>
										</div>
										{#if request.endDate}
											<div>
												<span class="text-muted-foreground">{$t('label_end_date') || 'End Date'}:</span>
												<p class="font-medium">{formatDate(new Date(request.endDate))}</p>
											</div>
										{/if}
										<div>
											<span class="text-muted-foreground">{$t('label_students') || 'Students'}:</span>
											<p class="font-medium">{request.numberOfStudents}</p>
										</div>
										<div>
											<span class="text-muted-foreground">{$t('label_hours_per_day') || 'Hours/Day'}:</span>
											<p class="font-medium">{request.hoursPerDay}h</p>
										</div>
									</div>

									<!-- Price Estimate (for bookings) -->
									{#if request.estimatedPrice}
										<div class="mt-3 rounded-md bg-muted/50 p-3">
											<div class="flex items-center justify-between">
												<span class="text-sm text-muted-foreground">{$t('label_estimated_price') || 'Estimated Price'}:</span>
												<span class="text-lg font-bold">
													{request.estimatedPrice}{request.currency}
												</span>
											</div>
										</div>
									{/if}

									<!-- Sports (for bookings) -->
									{#if request.sports && request.sports.length > 0}
										<div class="mt-2">
											<span class="text-sm text-muted-foreground">{$t('label_sports') || 'Sports'}:</span>
											<div class="mt-1 flex flex-wrap gap-1">
												{#each request.sports as sport}
													<Badge variant="outline" class="text-xs">
														{sport.sportName}
													</Badge>
												{/each}
											</div>
										</div>
									{/if}
								{/if}
							</div>

							<!-- Status Actions -->
							<div class="flex flex-col gap-2">
								{#if type === 'lead'}
									<Select.Root
										onSelectedChange={async (selected) => {
											if (selected?.value && selected.value !== request.status) {
												await updateStatus(request.id, selected.value);
											}
										}}
									>
										<Select.Trigger class="w-[150px]" disabled={updatingRequestId === request.id}>
											<Select.Value placeholder={getStatusLabel(request.status)} />
										</Select.Trigger>
										<Select.Content>
											{#each statusConfig.lead.statuses as status}
												<Select.Item value={status.value}>{status.label}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								{:else if onViewDetails}
									<Button
										onclick={() => onViewDetails(request)}
										variant="outline"
										size="sm"
										class="w-full md:w-auto"
									>
										{$t('button_view_details') || 'View Details'}
									</Button>
								{/if}

								{#if updatingRequestId === request.id}
									<div class="flex items-center justify-center">
										<svg
											class="size-4 animate-spin text-muted-foreground"
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
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- View All Button -->
			{#if requests.length >= 10}
				<div class="mt-4 text-center">
					<Button
						href={type === 'lead' ? '/dashboard/leads' : '/dashboard/bookings'}
						variant="outline"
						size="sm"
					>
						{type === 'lead'
							? ($t('button_view_all_leads') || 'View All Inquiries')
							: ($t('button_view_all_bookings') || 'View All Bookings')}
					</Button>
				</div>
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center py-8 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mb-4 size-12 text-muted-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
				<h3 class="mb-2 font-semibold">
					{type === 'lead'
						? ($t('dashboard_no_inquiries') || 'No inquiries yet')
						: ($t('dashboard_no_bookings') || 'No bookings yet')}
				</h3>
				<p class="text-sm text-muted-foreground">
					{type === 'lead'
						? ($t('dashboard_no_inquiries_description') || 'When clients contact you through your profile, they will appear here')
						: ($t('dashboard_no_bookings_description') || 'When clients book lessons, they will appear here')}
				</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
