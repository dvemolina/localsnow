<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { route } from '$lib/i18n/routeHelpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { school, baseLesson, groupTiers, durationPackages, promoCodes } = $derived(data);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">School Lessons & Pricing</h1>
			<p class="text-muted-foreground mt-1">
				Manage pricing for all instructors in {school.name}
			</p>
		</div>
	</div>

	<!-- Info Card -->
	<Card.Root class="border-blue-200 bg-blue-50">
		<Card.Header>
			<Card.Title class="text-blue-900">School Pricing</Card.Title>
			<Card.Description class="text-blue-700">
				The pricing you set here will automatically apply to all instructors in your school. Instructors cannot set their own prices while part of your school.
			</Card.Description>
		</Card.Header>
	</Card.Root>

	<!-- Placeholder for Full Lessons UI -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Lesson Pricing Configuration</Card.Title>
			<Card.Description>
				Full pricing management interface coming soon
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if baseLesson}
				<div class="rounded-lg border p-4">
					<h3 class="font-semibold mb-2">Current Base Lesson</h3>
					<p class="text-sm text-muted-foreground mb-2">
						{baseLesson.title || 'Base Lesson'} - {baseLesson.description || 'No description'}
					</p>
					<p class="text-lg font-bold">
						{baseLesson.currency === 'EUR' ? '€' : '$'}{(baseLesson.basePrice / 100).toFixed(2)}/hour
					</p>
				</div>

				{#if groupTiers.length > 0}
					<div class="rounded-lg border p-4">
						<h3 class="font-semibold mb-2">Group Pricing Tiers ({groupTiers.length})</h3>
						<div class="space-y-2">
							{#each groupTiers as tier}
								<div class="flex justify-between text-sm">
									<span>{tier.minStudents}-{tier.maxStudents} students</span>
									<span class="font-medium">€{(tier.pricePerHour / 100).toFixed(2)}/hour</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if durationPackages.length > 0}
					<div class="rounded-lg border p-4">
						<h3 class="font-semibold mb-2">Duration Packages ({durationPackages.length})</h3>
						<div class="space-y-2">
							{#each durationPackages as pkg}
								<div class="flex justify-between text-sm">
									<span>{pkg.name} ({pkg.hours}h)</span>
									<span class="font-medium">€{(pkg.price / 100).toFixed(2)}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if promoCodes.length > 0}
					<div class="rounded-lg border p-4">
						<h3 class="font-semibold mb-2">Active Promo Codes ({promoCodes.length})</h3>
						<div class="space-y-2">
							{#each promoCodes as promo}
								<div class="flex justify-between text-sm">
									<span class="font-mono">{promo.code}</span>
									<span class="font-medium">{promo.discountPercent}% off</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				<div class="text-center py-12">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto h-12 w-12 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-medium">No pricing configured yet</h3>
					<p class="text-muted-foreground mt-2">
						Set up your school's lesson pricing to get started
					</p>
					<div class="mt-6">
						<p class="text-sm text-muted-foreground mb-4">
							To configure full pricing with group tiers, packages, and promo codes,<br />
							you can use the same interface as independent instructors.
						</p>
						<p class="text-sm font-medium">
							Note: Full lesson pricing UI will be implemented in the next update.
						</p>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Quick Instructions -->
	<Card.Root>
		<Card.Header>
			<Card.Title>How School Pricing Works</Card.Title>
		</Card.Header>
		<Card.Content>
			<ul class="space-y-2 text-sm">
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Set base hourly rates for your school's lessons</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Create group pricing tiers (e.g., 1-2 students, 3-4 students)</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Offer duration packages (e.g., half-day, full-day)</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Create promo codes for special discounts</span>
				</li>
				<li class="flex gap-2">
					<span class="text-blue-600">→</span>
					<span>All pricing automatically applies to your school instructors' profiles</span>
				</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>
