<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { MapPin, Mountain, ExternalLink } from '@lucide/svelte';
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/shared/Breadcrumb.svelte';
	import * as m from '$src/lib/paraglide/messages.js';
	import InstructorCard from '$src/features/Instructors/components/InstructorCard.svelte'

	let { data } = $props();
	const { landingData, seo } = data;
	const { location, sport, instructors, relatedResorts, totalInstructors } = landingData;

	const breadcrumbItems = seo.breadcrumbs.map((crumb) => ({
		href: crumb.url.replace('https://localsnow.com', ''),
		label: crumb.name
	}));
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={seo.openGraph.title} />
	<meta property="og:description" content={seo.openGraph.description} />
	<meta property="og:url" content={seo.openGraph.url} />
	<meta property="og:type" content={seo.openGraph.type} />
	<meta property="og:image" content={seo.openGraph.image} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.openGraph.title} />
	<meta name="twitter:description" content={seo.openGraph.description} />
	<meta name="twitter:image" content={seo.openGraph.image} />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(seo.structuredData)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: seo.breadcrumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: crumb.url
		}))
	})}<\/script>`}
</svelte:head>

<section class="w-full">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">
			{sport.sport} Instructors in {location.resort?.name}
		</h1>
		<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
			<div class="flex items-center gap-1.5">
				<MapPin class="h-4 w-4" />
				<span>{location.region?.region || location.country.country}, {location.country.country}</span>
			</div>
			{#if location.resort?.minElevation && location.resort?.maxElevation}
				<div class="flex items-center gap-1.5">
					<Mountain class="h-4 w-4" />
					<span>{location.resort.minElevation}m - {location.resort.maxElevation}m</span>
				</div>
			{/if}
			{#if location.resort?.website}
				<a
					href={location.resort.website}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-1.5 hover:text-foreground"
				>
					<ExternalLink class="h-4 w-4" />
					<span>Website</span>
				</a>
			{/if}
		</div>
	</div>

	<!-- Results Summary -->
	<div class="mb-6">
		<p class="text-sm text-muted-foreground">
			{#if totalInstructors > 0}
				{totalInstructors} verified {totalInstructors === 1 ? 'instructor' : 'instructors'} available
			{:else}
				No instructors available yet
			{/if}
		</p>
	</div>

	<!-- Instructors Grid -->
	{#if instructors.length > 0}
		<div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
			{#each instructors as instructor}
				<InstructorCard instructorData={instructor}/>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="mb-8">
			<Card>
				<CardContent class="p-8 text-center">
					<h3 class="mb-2 font-semibold">No Instructors Available Yet</h3>
					<p class="text-sm text-muted-foreground">
						We're currently onboarding instructors in this area. Check back soon or
						<a href="/contact" class="text-primary hover:underline">contact us</a> if you're an instructor.
					</p>
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- About Section -->
	<div class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>About {location.resort?.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-muted-foreground">
					{location.resort?.name} is a premier destination for {sport.sport.toLowerCase()} enthusiasts.
					{#if location.resort?.minElevation && location.resort?.maxElevation}
						With slopes ranging from {location.resort.minElevation}m to {location.resort.maxElevation}m,
					{/if}
					the resort offers terrain suitable for all skill levels. Book professional lessons with verified instructors.
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Related Resorts -->
	{#if relatedResorts && relatedResorts.length > 0}
		<div class="mb-8">
			<h2 class="mb-4 text-xl font-semibold">
				Other Resorts in {location.region?.region || location.country.country}
			</h2>
			<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				{#each relatedResorts as related}
					<a
						href="/resorts/{related.countrySlug}/{related.regionSlug || location.country.countrySlug}/{related.slug}/{sport.sportSlug}-instructors"
						data-sveltekit-reload
						class="group"
					>
						<Card class="h-full transition-shadow hover:shadow-md">
							<CardContent class="p-4">
								<h3 class="mb-1 font-semibold group-hover:text-primary">
									{related.name}
								</h3>
								<p class="text-sm text-muted-foreground">
									{sport.sport} Instructors →
								</p>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- FAQ Section -->
	<div>
		<h2 class="mb-4 text-xl font-semibold">Frequently Asked Questions</h2>
		<div class="space-y-3">
			<Card>
				<CardContent class="p-4">
					<h3 class="mb-2 font-semibold text-sm">
						How do I book a {sport.sport.toLowerCase()} lesson in {location.resort?.name}?
					</h3>
					<p class="text-sm text-muted-foreground">
						Browse verified instructors above, view their profiles to check availability,
						and submit a booking request. Instructors respond within 24 hours.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardContent class="p-4">
					<h3 class="mb-2 font-semibold text-sm">
						Are all instructors certified?
					</h3>
					<p class="text-sm text-muted-foreground">
						Yes, all instructors with the "Verified" badge have been verified by LocalSnow.
						We review certifications before approving profiles.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardContent class="p-4">
					<h3 class="mb-2 font-semibold text-sm">
						What should I bring to my lesson?
					</h3>
					<p class="text-sm text-muted-foreground">
						Bring your ski pass, appropriate clothing, and personal equipment.
						Your instructor can advise on equipment rentals if needed.
					</p>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
