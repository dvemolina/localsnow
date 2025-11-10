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

<div class="min-h-screen bg-gray-50">
	<!-- Breadcrumbs -->
	<div class="border-b bg-white">
		<div class="container mx-auto max-w-7xl px-2 py-3 md:px-4">
			<div class="overflow-x-auto scrollbar-hide">
				<Breadcrumb page={$page} items={breadcrumbItems} />
			</div>
		</div>
	</div>

	<!-- Hero Section -->
	<div class="bg-gradient-to-b from-blue-600 to-blue-800 text-white">
		<div class="container mx-auto max-w-7xl px-4 py-16">
			<div class="max-w-3xl">
				<h1 class="mb-4 text-4xl font-bold md:text-5xl">
					{resort.name}
				</h1>
				<p class="mb-6 text-xl text-blue-100">
					Book professional ski and snowboard instructors at {resort.name}
				</p>

				<div class="flex flex-wrap items-center gap-4 text-sm">
					<div class="flex items-center gap-2">
						<MapPin class="h-5 w-5" />
						<span>{location.region?.region || location.country.country}, {location.country.country}</span>
					</div>
					{#if resort.minElevation && resort.maxElevation}
						<div class="flex items-center gap-2">
							<Mountain class="h-5 w-5" />
							<span>{resort.minElevation}m - {resort.maxElevation}m</span>
						</div>
					{/if}
					{#if resort.website}
						<a
							href={resort.website}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 hover:text-blue-200"
						>
							<ExternalLink class="h-4 w-4" />
							<span>Official Website</span>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto max-w-7xl px-4 py-12">
		<!-- Find Instructors Section -->
		<div class="mb-12">
			<h2 class="mb-6 text-3xl font-bold">Find Instructors at {resort.name}</h2>

			<div class="grid gap-4 md:grid-cols-3">
				{#each sportsAvailable as sport}
					<Card class="overflow-hidden transition-shadow hover:shadow-lg">
						<CardContent class="p-6">
							<h3 class="mb-2 text-xl font-semibold">{sport.sport} Instructors</h3>

							{#if sport.instructorCount > 0}
								<p class="mb-4 text-sm text-muted-foreground">
									{sport.instructorCount} verified {sport.instructorCount === 1 ? 'instructor' : 'instructors'} available
								</p>
								<Button
									href="/resorts/{location.country.countrySlug}/{location.region?.regionSlug || location.country.countrySlug}/{resort.slug}/{sport.sportSlug}-instructors"
									class="w-full"
								>
									View {sport.sport} Instructors
									<ArrowRight class="ml-2 h-4 w-4" />
								</Button>
							{:else}
								<p class="mb-4 text-sm text-muted-foreground">
									No instructors available yet
								</p>
								<Button variant="outline" disabled class="w-full">
									Coming Soon
								</Button>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>

		<!-- About the Resort -->
		<div class="mb-12">
			<Card>
				<CardHeader>
					<CardTitle>About {resort.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground">
						{resort.name} is located in {location.region?.region || location.country.country}, {location.country.country}.
						{#if resort.minElevation && resort.maxElevation}
							The resort features slopes ranging from {resort.minElevation} to {resort.maxElevation} meters in elevation,
							offering terrain suitable for all skill levels.
						{/if}
						Whether you're a beginner looking to learn or an experienced rider wanting to refine your technique,
						our verified instructors can help you make the most of your time on the mountain.
					</p>
				</CardContent>
			</Card>
		</div>

		<!-- Nearby Resorts -->
		{#if nearbyResorts && nearbyResorts.length > 0}
			<div>
				<h2 class="mb-6 text-2xl font-bold">
					Other Resorts in {location.region?.region || location.country.country}
				</h2>
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each nearbyResorts as nearby}
						<a
							href="/resorts/{nearby.countrySlug}/{nearby.regionSlug || location.country.countrySlug}/{nearby.slug}"
							class="group block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
						>
							<h3 class="mb-2 font-semibold group-hover:text-blue-600">
								{nearby.name}
							</h3>
							{#if nearby.minElevation && nearby.maxElevation}
								<p class="text-sm text-muted-foreground">
									{nearby.minElevation}m - {nearby.maxElevation}m
								</p>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
