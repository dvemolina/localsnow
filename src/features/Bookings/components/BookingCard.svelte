<script lang="ts">
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { formatDate } from '$src/lib/utils/generics';

	let {
		booking,
		onViewDetails
	}: {
		booking: any;
		onViewDetails: () => void;
	} = $props();

	const statusConfig = {
		pending: {
			label: 'Pending Review',
			variant: 'secondary' as const,
			color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
		},
		accepted: {  // Combined unlocked + accepted
			label: 'Accepted',
			variant: 'default' as const,
			color: 'bg-green-100 text-green-800 border-green-200'
		},
		rejected: {
			label: 'Rejected',
			variant: 'outline' as const,
			color: 'bg-red-100 text-red-800 border-red-200'
		}
	};

	const getStatus = () => {
		if (booking.status === 'rejected') return 'rejected';
		if (booking.contactInfoUnlocked) return 'accepted';  // Payment = Accepted
		return 'pending';
	};


	const currentStatus = $derived(getStatus());
	const statusInfo = $derived(statusConfig[currentStatus]);
</script>

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
				<Button onclick={onViewDetails} class="flex-1" variant="outline">
					View Details
				</Button>
				
				{#if !booking.contactInfoUnlocked && booking.status === 'pending'}
					<Button
						onclick={() => (window.location.href = `/leads/payment/${booking.id}`)}
						class="flex-1"
					>
						Pay €5 to Unlock
					</Button>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>