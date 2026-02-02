<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { MapPin, Mountain, ExternalLink, Building2, Check } from '@lucide/svelte';
	import Breadcrumb from '$lib/components/shared/Breadcrumb.svelte';
	import * as Accordion from '$lib/components/ui/accordion';

	let { data } = $props();
	const { location, schools, totalSchools, faqs, seo } = data;
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
			Ski Schools in {location.resort?.name}
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
					<Building2 class="h-5 w-5 text-primary" />
					<div>
						<p class="font-semibold">
							{totalSchools} Ski School{totalSchools === 1 ? '' : 's'}
						</p>
						<p class="text-sm text-muted-foreground">
							Professional ski and snowboard instruction for all levels. Group lessons, kids programs, and more.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Schools Grid -->
	{#if schools.length > 0}
		<div class="mb-8">
			<h2 class="mb-4 text-xl font-semibold">Available Schools</h2>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
				{#each schools as school}
					<a href="/schools/{school.slug}" class="group">
						<Card class="h-full transition-shadow hover:shadow-lg">
							<CardContent class="p-6">
								<div class="mb-4 flex items-start gap-4">
									<Avatar.Root class="h-16 w-16">
										<Avatar.Image src={school.logo || '/local-snow-head.png'} alt={school.name} />
										<Avatar.Fallback>{school.name.charAt(0)}</Avatar.Fallback>
									</Avatar.Root>
									<div class="flex-1">
										<h3 class="mb-1 font-semibold group-hover:text-primary">
											{school.name}
											{#if school.isVerified}
												<Badge variant="secondary" class="ml-2 text-xs">
													<Check class="mr-1 h-3 w-3" />
													Verified
												</Badge>
											{/if}
										</h3>
										{#if school.bio}
											<p class="line-clamp-2 text-sm text-muted-foreground">
												{school.bio}
											</p>
										{/if}
									</div>
								</div>

								<div class="flex flex-wrap gap-2">
									{#if school.sports && school.sports.length > 0}
										{#each school.sports as sport}
											<Badge variant="outline">{sport.sport}</Badge>
										{/each}
									{/if}
								</div>

								<Button variant="outline" class="mt-4 w-full">
									View School Profile
								</Button>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		</div>
	{:else}
		<Card class="mb-8">
			<CardContent class="p-8 text-center">
				<p class="mb-2 text-lg font-semibold">No Schools Available Yet</p>
				<p class="text-sm text-muted-foreground">
					We're working on adding ski schools for {location.resort?.name}. Check back soon!
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

	<!-- Why Choose a Ski School Section -->
	<div class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>Why Choose a Ski School in {location.resort?.name}?</CardTitle>
			</CardHeader>
			<CardContent>
				<ul class="space-y-2 text-muted-foreground">
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Structured curriculum designed for progressive learning</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Group lessons ideal for social learning and making friends</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Specialized kids programs with age-appropriate instruction</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Certified instructors with extensive teaching experience</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Cost-effective option compared to private lessons</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary">✓</span>
						<span>Equipment rental and lesson packages often available</span>
					</li>
				</ul>
			</CardContent>
		</Card>
	</div>

	<!-- Navigation Links -->
	<div class="flex flex-wrap justify-center gap-4">
		<Button href="/resorts/{location.country.countrySlug}/{location.region?.regionSlug || location.country.countrySlug}/{location.resort?.slug}/instructors" variant="outline">
			View Private Instructors →
		</Button>
		<Button href="/resorts/{location.country.countrySlug}/{location.region?.regionSlug || location.country.countrySlug}/{location.resort?.slug}" variant="outline">
			← Back to {location.resort?.name}
		</Button>
	</div>
</section>
