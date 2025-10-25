<script lang="ts">
	import * as Card from '$src/lib/components/ui/card';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Users, Clock } from '@lucide/svelte';

	let {
		lesson,
		groupTiers = [],
		durationPackages = []
	}: {
		lesson: any;
		groupTiers?: any[];
		durationPackages?: any[];
	} = $props();

	// Get the lowest price available
	const lowestPrice = $derived(() => {
		const prices = [lesson.basePrice];
		groupTiers.forEach(tier => prices.push(tier.pricePerHour));
		return Math.min(...prices);
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Pricing</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Hourly Pricing Section -->
		<div>
			<div class="flex items-center gap-2 mb-3">
				<Clock class="h-4 w-4 text-muted-foreground" />
				<h3 class="font-medium">Hourly Rates</h3>
			</div>
			
			<!-- Base Price (1-2 students) -->
			<div class="rounded-lg border bg-card p-3 mb-2">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Users class="h-4 w-4 text-muted-foreground" />
						<span class="text-sm">1-2 students</span>
					</div>
					<div class="flex items-baseline gap-1">
						<span class="text-lg font-bold">{lesson.basePrice}</span>
						<span class="text-sm text-muted-foreground">{lesson.currency}/hr</span>
					</div>
				</div>
			</div>

			<!-- Group Tiers -->
			{#if groupTiers.length > 0}
				{#each groupTiers as tier}
					<div class="rounded-lg border bg-muted/30 p-3 mb-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Users class="h-4 w-4 text-muted-foreground" />
								<span class="text-sm">{tier.minStudents}-{tier.maxStudents} students</span>
								{#if tier.pricePerHour < lesson.basePrice}
									<Badge variant="secondary" class="text-xs">Group discount</Badge>
								{/if}
							</div>
							<div class="flex items-baseline gap-1">
								<span class="text-lg font-bold">{tier.pricePerHour}</span>
								<span class="text-sm text-muted-foreground">{lesson.currency}/hr</span>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Duration Packages -->
		{#if durationPackages.length > 0}
			<div>
				<div class="flex items-center gap-2 mb-3">
					<Clock class="h-4 w-4 text-muted-foreground" />
					<h3 class="font-medium">Package Deals</h3>
				</div>
				
				{#each durationPackages as pkg}
					<div class="rounded-lg border bg-card p-3 mb-2">
						<div class="flex items-center justify-between mb-1">
							<div class="flex items-center gap-2">
								<span class="font-medium text-sm">{pkg.name}</span>
								<Badge variant="outline" class="text-xs">{pkg.hours}h</Badge>
							</div>
							<div class="flex items-baseline gap-1">
								<span class="text-lg font-bold">{pkg.price}</span>
								<span class="text-sm text-muted-foreground">{lesson.currency}</span>
							</div>
						</div>
						{#if pkg.description}
							<p class="text-xs text-muted-foreground">{pkg.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Info Notice -->
		<div class="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
			<p class="font-medium mb-1">💡 Pricing Information</p>
			<ul class="space-y-1 list-disc list-inside">
				<li>Prices shown are per hour unless specified as a package</li>
				<li>Group pricing applies to the total rate, not per person</li>
				<li>Final details confirmed when you book</li>
			</ul>
		</div>
	</Card.Content>
</Card.Root>