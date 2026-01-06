<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
	const { booking } = data;

	function getStatusBadge(status: string) {
		const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', class: string, label: string }> = {
			'pending': { variant: 'outline', class: 'border-yellow-500 text-yellow-700', label: m.status_pending() },
			'viewed': { variant: 'outline', class: 'border-blue-500 text-blue-700', label: m["dashboard.my-bookings.client_status_viewed"]() },
			'accepted': { variant: 'default', class: 'bg-green-600', label: m["dashboard.my-bookings.status_accepted"]() },
			'rejected': { variant: 'destructive', class: '', label: m["dashboard.my-bookings.status_rejected"]() },
			'cancelled': { variant: 'secondary', class: '', label: m["dashboard.my-bookings.client_status_cancelled"]() },
			'expired': { variant: 'secondary', class: '', label: m["dashboard.my-bookings.status_expired"]() }
		};

		return variants[status] || { variant: 'outline' as const, class: '', label: status };
	}

	const statusConfig = $derived(getStatusBadge(booking.status));

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

	const timeSlots = $derived(formatTimeSlots(booking.timeSlots));
</script>

<div class="container mx-auto max-w-4xl space-y-6">
	<!-- Header -->
	<div class="mb-8">
		<div class="mb-4">
			<Button href="/dashboard/my-bookings" variant="outline" size="sm">
				← {m["dashboard.my-bookings.client_back_to_bookings"]()}
			</Button>
		</div>
		<div class="flex items-start justify-between">
			<div>
				<h1 class="title2 mb-2">{m["dashboard.my-bookings.client_booking_request"]()} #{booking.id}</h1>
				<p class="text-muted-foreground">
					{m["dashboard.my-bookings.client_created_on"]({ date: new Date(booking.createdAt).toLocaleDateString() })}
				</p>
				<p class="text-xs text-muted-foreground mt-1">
					{new Date(booking.createdAt).toLocaleString()}
				</p>
			</div>
			<Badge variant={statusConfig.variant} class={statusConfig.class}>
				{statusConfig.label}
			</Badge>
		</div>
	</div>

	<!-- Instructor Information -->
	<Card>
		<CardHeader>
			<CardTitle>{m["dashboard.my-bookings.client_instructor_info"]()}</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_name"]()}</p>
					<p class="text-base">
						{booking.instructor?.name} {booking.instructor?.lastName}
					</p>
				</div>
				{#if booking.contactInfoUnlocked}
					<div>
						<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_email"]()}</p>
						<p class="text-base">{booking.instructor?.email}</p>
					</div>
				{:else}
					<div class="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
						<p class="font-medium">{m["dashboard.my-bookings.client_contact_locked_title"]()}</p>
						<p class="text-xs">{m["dashboard.my-bookings.client_contact_locked_desc"]()}</p>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Booking Details -->
	<Card>
		<CardHeader>
			<CardTitle>{m["dashboard.my-bookings.client_booking_details"]()}</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_start_date"]()}</p>
					<p class="text-base">{new Date(booking.startDate).toLocaleDateString()}</p>
				</div>
				{#if booking.endDate && booking.endDate !== booking.startDate}
					<div>
						<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_end_date"]()}</p>
						<p class="text-base">{new Date(booking.endDate).toLocaleDateString()}</p>
					</div>
				{/if}
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_number_of_students"]()}</p>
					<p class="text-base">{booking.numberOfStudents}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_hours_per_day"]()}</p>
					<p class="text-base">{booking.hoursPerDay}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_skill_level"]()}</p>
					<p class="text-base capitalize">{booking.skillLevel}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_sports"]()}</p>
					<div class="flex flex-wrap gap-1">
						{#each booking.sports as sport}
							<Badge variant="outline">{sport.sportName}</Badge>
						{/each}
					</div>
				</div>
			</div>

			{#if timeSlots.length > 0}
				<Separator />
				<div>
					<p class="mb-2 text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.client_requested_times"]()}</p>
					<div class="flex flex-wrap gap-2">
						{#each timeSlots as slot}
							<Badge variant="secondary">{slot}</Badge>
						{/each}
					</div>
				</div>
			{/if}

			{#if booking.message}
				<Separator />
				<div>
					<p class="mb-2 text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_message"]()}</p>
					<p class="text-base">{booking.message}</p>
				</div>
			{/if}

			{#if booking.estimatedPrice}
				<Separator />
				<div>
					<p class="mb-2 text-sm font-medium text-muted-foreground">{m["dashboard.my-bookings.label_estimated_price"]()}</p>
					<p class="text-2xl font-bold">
						{booking.estimatedPrice} {booking.currency || 'EUR'}
					</p>
				</div>
			{/if}

			{#if booking.usedLaunchCode}
				<Separator />
				<div class="rounded-md bg-blue-50 p-3">
					<p class="text-sm font-medium text-blue-900">{m["dashboard.my-bookings.client_beta_access_used"]()}</p>
					<p class="text-xs text-blue-800">
						{m["dashboard.my-bookings.client_beta_code"]()}: <code class="font-mono">{booking.usedLaunchCode}</code>
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Status Information -->
	<Card>
		<CardHeader>
			<CardTitle>{m["dashboard.my-bookings.client_status_info"]()}</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			{#if booking.status === 'pending'}
				<p class="text-sm">
					{m["dashboard.my-bookings.client_status_pending_desc"]()}
				</p>
			{:else if booking.status === 'viewed'}
				<p class="text-sm">
					{m["dashboard.my-bookings.client_status_viewed_desc"]()}
				</p>
			{:else if booking.status === 'accepted'}
				<div class="rounded-md bg-green-50 p-4">
					<p class="font-medium text-green-900">{m["dashboard.my-bookings.client_status_accepted_title"]()}</p>
					<p class="text-sm text-green-800">
						{m["dashboard.my-bookings.client_status_accepted_desc"]()}
					</p>
				</div>
			{:else if booking.status === 'rejected'}
				<div class="rounded-md bg-red-50 p-4">
					<p class="font-medium text-red-900">{m["dashboard.my-bookings.client_status_rejected_title"]()}</p>
					<p class="text-sm text-red-800">
						{m["dashboard.my-bookings.client_status_rejected_desc"]()}
					</p>
				</div>
			{:else if booking.status === 'cancelled'}
				<p class="text-sm text-muted-foreground">
					{m["dashboard.my-bookings.client_status_cancelled_desc"]()}
				</p>
			{:else if booking.status === 'expired'}
				<p class="text-sm text-muted-foreground">
					{m["dashboard.my-bookings.client_status_expired_desc"]()}
				</p>
			{/if}
		</CardContent>
	</Card>
</div>
