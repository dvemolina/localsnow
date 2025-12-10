<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { MapPin, Mountain, ExternalLink, ArrowRight } from '@lucide/svelte';
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/shared/Breadcrumb.svelte';

	let { data } = $props();
	const { resort, location, sportsAvailable, nearbyResorts, seo } = data;

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
	<!-- Hero Banner -->
	<div class="relative mb-8 mt-4 overflow-hidden rounded-lg shadow-xl">
		<div class="relative h-[300px] md:h-[400px]">
			<!-- Background Image -->
			<img
				src={resort.image || 'https://assets.localsnow.org/resorts/default-resort-landscape.webp'}
				alt="{resort.name} ski resort"
				class="h-full w-full object-cover {resort.image ? 'object-center' : 'object-bottom'}"
				loading="eager"
			/>
			<!-- Gradient Overlay -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

			<!-- Content Overlay -->
			<div class="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-8">
				<h1 class="title2 mb-3 text-white drop-shadow-2xl">{resort.name}</h1>
				<div class="flex flex-wrap items-center gap-3 text-sm text-white/95 drop-shadow-lg md:gap-4 md:text-base">
					<div class="flex items-center gap-1.5">
						<MapPin class="h-4 w-4 md:h-5 md:w-5" />
						<span>{location.region?.region || location.country.country}, {location.country.country}</span>
					</div>
					{#if resort.minElevation && resort.maxElevation}
						<div class="flex items-center gap-1.5">
							<Mountain class="h-4 w-4 md:h-5 md:w-5" />
							<span>{resort.minElevation}m - {resort.maxElevation}m</span>
						</div>
					{/if}
					{#if resort.website}
						<a
							href={resort.website}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1.5 transition-colors hover:text-white"
						>
							<ExternalLink class="h-4 w-4 md:h-5 md:w-5" />
							<span>Official Website</span>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Find Instructors Section -->
	<div class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Find Instructors</h2>
		<div class="grid gap-4 md:grid-cols-3">
			{#each sportsAvailable as sport}
				<Card>
					<CardContent class="p-4">
						<h3 class="mb-2 font-semibold">{sport.sport} Instructors</h3>
						{#if sport.instructorCount > 0}
							<p class="mb-3 text-sm text-muted-foreground">
								{sport.instructorCount} verified {sport.instructorCount === 1 ? 'instructor' : 'instructors'}
							</p>
							<Button
								href="/resorts/{location.country.countrySlug}/{location.region?.regionSlug || location.country.countrySlug}/{resort.slug}/{sport.sportSlug}-instructors"
								class="w-full"
								size="sm"
							>
								View Instructors
								<ArrowRight class="ml-2 h-4 w-4" />
							</Button>
						{:else}
							<p class="mb-3 text-sm text-muted-foreground">No instructors available</p>
							<Button variant="outline" disabled class="w-full" size="sm">
								Coming Soon
							</Button>
						{/if}
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>

	<!-- About Section -->
	<div class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>About {resort.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-muted-foreground">
					{#if resort.description}
						{resort.description}
					{:else}
						{resort.name} is located in {location.region?.region || location.country.country}, {location.country.country}.
						{#if resort.minElevation && resort.maxElevation}
							The resort features slopes ranging from {resort.minElevation} to {resort.maxElevation} meters in elevation,
							offering terrain suitable for all skill levels.
						{/if}
						Book professional ski and snowboard lessons with verified instructors.
					{/if}
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Nearby Resorts -->
	{#if nearbyResorts && nearbyResorts.length > 0}
		<div>
			<h2 class="mb-4 text-xl font-semibold">
				Other Resorts in {location.region?.region || location.country.country}
			</h2>
			<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				{#each nearbyResorts as nearby}
					<a
						href="/resorts/{nearby.countrySlug}/{nearby.regionSlug || location.country.countrySlug}/{nearby.slug}"
						data-sveltekit-reload
						class="group"
					>
						<Card class="h-full transition-shadow hover:shadow-md">
							<CardContent class="p-4">
								<h3 class="mb-1 font-semibold group-hover:text-primary">
									{nearby.name}
								</h3>
								{#if nearby.minElevation && nearby.maxElevation}
									<p class="text-sm text-muted-foreground">
										{nearby.minElevation}m - {nearby.maxElevation}m
									</p>
								{/if}
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</section>
