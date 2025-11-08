<script lang="ts">
	import { page } from '$app/stores';
	import InstructorCard from '$src/features/Instructors/components/InstructorCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Generate breadcrumb JSON-LD
	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://localsnow.com'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: data.country.country,
				item: `https://localsnow.com/${data.country.countrySlug}`
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: data.region.region,
				item: `https://localsnow.com/${data.country.countrySlug}/${data.region.regionSlug}`
			},
			{
				'@type': 'ListItem',
				position: 4,
				name: data.resort.name,
				item: `https://localsnow.com/${data.country.countrySlug}/${data.region.regionSlug}/${data.resort.slug}`
			},
			{
				'@type': 'ListItem',
				position: 5,
				name: `${data.sport.name} Instructors`,
				item: `https://localsnow.com/${data.country.countrySlug}/${data.region.regionSlug}/${data.resort.slug}/${data.sport.slug}`
			}
		]
	};

	// Generate SkiResort Schema
	const resortSchema = {
		'@context': 'https://schema.org',
		'@type': 'SkiResort',
		name: data.resort.name,
		address: {
			'@type': 'PostalAddress',
			addressRegion: data.region.region,
			addressCountry: data.country.countryCode
		},
		...(data.resort.website && { url: data.resort.website }),
		...(data.resort.lat &&
			data.resort.lon && {
				geo: {
					'@type': 'GeoCoordinates',
					latitude: data.resort.lat,
					longitude: data.resort.lon
				}
			}),
		...(data.resort.maxElevation && {
			maximumElevation: {
				'@type': 'QuantitativeValue',
				value: data.resort.maxElevation,
				unitCode: 'MTR'
			}
		}),
		...(data.resort.minElevation && {
			minimumElevation: {
				'@type': 'QuantitativeValue',
				value: data.resort.minElevation,
				unitCode: 'MTR'
			}
		})
	};

	// Generate Service Schema for lessons
	const serviceSchema = {
		'@context': 'https://schema.org',
		'@type': 'Service',
		serviceType: `${data.sport.name} Lessons`,
		provider: {
			'@type': 'Organization',
			name: 'Local Snow'
		},
		areaServed: {
			'@type': 'Place',
			name: data.resort.name,
			address: {
				'@type': 'PostalAddress',
				addressRegion: data.region.region,
				addressCountry: data.country.country
			}
		},
		...(data.priceRange && {
			offers: {
				'@type': 'AggregateOffer',
				priceCurrency: data.priceRange.currency,
				lowPrice: data.priceRange.min,
				highPrice: data.priceRange.max
			}
		})
	};
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	<meta name="keywords" content={data.meta.keywords} />

	<!-- Open Graph -->
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:type" content="website" />
	<meta
		property="og:url"
		content={`https://localsnow.com/${data.country.countrySlug}/${data.region.regionSlug}/${data.resort.slug}/${data.sport.slug}`}
	/>

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />

	<!-- Canonical URL -->
	<link
		rel="canonical"
		href={`https://localsnow.com/${data.country.countrySlug}/${data.region.regionSlug}/${data.resort.slug}/${data.sport.slug}`}
	/>

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(resortSchema)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>`}
</svelte:head>

<section class="w-full">
	<!-- Breadcrumbs -->
	<nav class="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
		<ol class="flex flex-wrap items-center gap-2">
			<li><a href="/" class="hover:text-foreground">Home</a></li>
			<li>/</li>
			<li>
				<a href="/{data.country.countrySlug}" class="hover:text-foreground"
					>{data.country.country}</a
				>
			</li>
			<li>/</li>
			<li>
				<a
					href="/{data.country.countrySlug}/{data.region.regionSlug}"
					class="hover:text-foreground">{data.region.region}</a
				>
			</li>
			<li>/</li>
			<li>
				<a
					href="/{data.country.countrySlug}/{data.region.regionSlug}/{data.resort.slug}"
					class="hover:text-foreground">{data.resort.name}</a
				>
			</li>
			<li>/</li>
			<li class="font-medium text-foreground">{data.sport.name} Instructors</li>
		</ol>
	</nav>

	<!-- Header Section -->
	<div class="mb-8">
		<h1 class="title2 mb-4">
			{data.sport.name} Instructors in {data.resort.name}
		</h1>
		<p class="mb-2 text-lg text-muted-foreground">
			{data.region.region}, {data.country.country}
		</p>

		<!-- Resort Info -->
		<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
			{#if data.resort.minElevation && data.resort.maxElevation}
				<div class="flex items-center gap-1">
					<svg
						class="size-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 15l7-7 7 7"
						></path>
					</svg>
					<span>{data.resort.minElevation}m - {data.resort.maxElevation}m</span>
				</div>
			{/if}

			{#if data.resort.website}
				<div>
					<a
						href={data.resort.website}
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline"
					>
						Visit resort website →
					</a>
				</div>
			{/if}
		</div>

		<!-- Price Range -->
		{#if data.priceRange}
			<div class="mt-4 rounded-lg border border-border bg-card p-4">
				<p class="text-sm font-medium">Typical Lesson Prices</p>
				<p class="text-2xl font-bold">
					{data.priceRange.currency === 'EUR' ? '€' : '$'}{data.priceRange.min} - {data
						.priceRange.currency === 'EUR'
						? '€'
						: '$'}{data.priceRange.max}
					<span class="text-sm font-normal text-muted-foreground">per hour</span>
				</p>
			</div>
		{/if}
	</div>

	<!-- About Section -->
	<div class="mb-8 rounded-lg border border-border bg-card p-6">
		<h2 class="title4 mb-4">About {data.sport.name} Lessons at {data.resort.name}</h2>
		<div class="prose prose-sm max-w-none dark:prose-invert">
			<p>
				Find certified {data.sport.name.toLowerCase()} instructors at {data.resort.name}, one
				of {data.region.region}'s premier ski resorts. Our platform connects you directly with
				professional instructors - no booking fees, no middlemen.
			</p>
			<p>
				Whether you're a beginner looking to learn the basics or an advanced skier wanting to
				perfect your technique, our instructors offer personalized {data.sport.name.toLowerCase()}
				lessons tailored to your skill level and goals.
			</p>
			<p class="font-medium">
				Book directly with instructors and save on booking fees while supporting local
				professionals.
			</p>
		</div>
	</div>

	<!-- Instructors Section -->
	<div class="mb-8">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="title3">
				{#if data.instructors.length === 0}
					No Instructors Found
				{:else if data.instructors.length === 1}
					1 Instructor Available
				{:else}
					{data.instructors.length} Instructors Available
				{/if}
			</h2>

			<Button href="/instructors?resort={data.resort.slug}&sport={data.sport.slug}" variant="outline">
				View All Filters
			</Button>
		</div>

		<!-- Instructors Grid -->
		{#if data.instructors.length > 0}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
				{#each data.instructors as instructor}
					<InstructorCard instructorData={instructor} baseLesson={instructor.baseLesson} />
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div
				class="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mb-4 size-16 text-muted-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<h3 class="title4 mb-2">No Instructors Yet</h3>
				<p class="mb-4 text-muted-foreground">
					We don't have any {data.sport.name.toLowerCase()} instructors at {data.resort.name}
					yet.
				</p>
				<Button href="/instructors">Browse All Instructors</Button>
			</div>
		{/if}
	</div>

	<!-- CTA Section -->
	<div class="rounded-lg border border-primary bg-primary/5 p-8 text-center">
		<h2 class="title3 mb-4">Are you a {data.sport.name} instructor at {data.resort.name}?</h2>
		<p class="mb-6 text-muted-foreground">
			Join Local Snow and start receiving direct bookings from clients. No commissions, no fees.
		</p>
		<Button href="/dashboard/choose-role/instructor" size="lg">Become an Instructor</Button>
	</div>
</section>
