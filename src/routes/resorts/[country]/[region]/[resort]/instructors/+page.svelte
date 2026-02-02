<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { MapPin, Mountain, ExternalLink, Users } from '@lucide/svelte';
	import Breadcrumb from '$lib/components/shared/Breadcrumb.svelte';
	import InstructorCard from '$src/features/Instructors/components/InstructorCard.svelte';
	import * as Accordion from '$lib/components/ui/accordion';

	let { data } = $props();
	const { location, instructors, totalInstructors, faqs, seo } = data;
	const defaultAlternate = seo.alternates?.find((alt) => alt.locale === 'en');

	const breadcrumbItems = seo.breadcrumbs.map((crumb) => ({
		href: crumb.url.replace('https://localsnow.org', ''),
		label: crumb.name
	}));
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonicalUrl} />
	{#if seo.alternates}
		{#each seo.alternates as alt}
			<link rel="alternate" hreflang={alt.locale} href={alt.url} />
		{/each}
		{#if defaultAlternate}
			<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
		{/if}
	{/if}

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
	{#if seo.faqSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(seo.faqSchema)}<\/script>`}
	{/if}
</svelte:head>

<section class="w-full">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">
			Ski & Snowboard Instructors in {location.resort?.name}
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
					<span>Resort Website</span>
				</a>
			{/if}
		</div>
	</div>

	<!-- Results Summary -->
	<div class="mb-6">
		<Card>
			<CardContent class="p-4">
				<div class="flex items-center gap-3">
					<Users class="h-5 w-5 text-primary" />
					<div>
						<p class="font-semibold">
							{totalInstructors} Verified Instructor{totalInstructors === 1 ? '' : 's'}
						</p>
						<p class="text-sm text-muted-foreground">
							Book directly with professional ski and snowboard instructors. No commission, no hidden fees.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Instructors Grid -->
	{#if instructors.length > 0}
		<div class="mb-8">
			<h2 class="mb-4 text-xl font-semibold">Available Instructors</h2>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
				{#each instructors as instructor}
					<InstructorCard instructorData={instructor} />
				{/each}
			</div>
		</div>
	{:else}
		<Card class="mb-8">
			<CardContent class="p-8 text-center">
				<p class="mb-2 text-lg font-semibold">No Instructors Available Yet</p>
				<p class="text-sm text-muted-foreground">
					We're working on adding instructors for {location.resort?.name}. Check back soon!
				</p>
			</CardContent>
		</Card>
	{/if}

	<!-- FAQs Section -->
	{#if faqs.length > 0}
		<div class="mb-8">
			<h2 class="mb-4 text-xl font-semibold">Frequently Asked Questions</h2>
			<Card>
				<CardContent class="p-0">
					<Accordion.Root>
						{#each faqs as faq, index}
							<Accordion.Item value="faq-{index}">
								<Accordion.Trigger class="px-6 text-left hover:no-underline">
									{faq.question}
								</Accordion.Trigger>
								<Accordion.Content class="px-6 pb-4">
									<p class="text-muted-foreground">{faq.answer}</p>
								</Accordion.Content>
							</Accordion.Item>
						{/each}
					</Accordion.Root>
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- Why Book Section -->
	<div class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>Why Book a Ski Instructor in {location.resort?.name}?</CardTitle>
			</CardHeader>
			<CardContent>
				<ul class="space-y-2 text-muted-foreground">
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>All instructors are certified and verified by our team</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Book directly with instructors - zero commission fees</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Flexible scheduling and personalized lessons for all skill levels</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Read verified reviews from real students before booking</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Local expertise - instructors know {location.resort?.name} inside and out</span>
					</li>
				</ul>
			</CardContent>
		</Card>
	</div>

	<!-- Back to Resort Link -->
	<div class="text-center">
		<Button href="/resorts/{location.country.countrySlug}/{location.region?.regionSlug || location.country.countrySlug}/{location.resort?.slug}" variant="outline">
			← Back to {location.resort?.name} Overview
		</Button>
	</div>
</section>
