<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { MapPin, Mountain, ExternalLink } from '@lucide/svelte';
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/shared/Breadcrumb.svelte';
	import InstructorCard from '$src/features/Instructors/components/InstructorCard.svelte'
	import { t } from '$lib/i18n/i18n';

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
			{$t('resort_sport_page_title', { values: { sport: sport.sport, resort: location.resort?.name } })}
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
					<span>{$t('resort_page_official_website')}</span>
				</a>
			{/if}
		</div>
	</div>

	<!-- Results Summary -->
	<div class="mb-6">
		<p class="text-sm text-muted-foreground">
			{#if totalInstructors > 0}
				{totalInstructors === 1
					? $t('resort_sport_page_results_single', { values: { count: totalInstructors } })
					: $t('resort_sport_page_results_plural', { values: { count: totalInstructors } })}
			{:else}
				{$t('resort_sport_page_results_none')}
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
					<h3 class="mb-2 font-semibold">{$t('resort_sport_page_empty_title')}</h3>
					<p class="text-sm text-muted-foreground">
						{$t('resort_sport_page_empty_desc')}
						<a href="/contact" class="text-primary hover:underline">{$t('resort_sport_page_empty_contact')}</a>
						{$t('resort_sport_page_empty_desc_suffix')}
					</p>
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- About Section -->
	<div class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>{$t('resort_page_about_title', { values: { resort: location.resort?.name } })}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-muted-foreground">
					{$t('resort_sport_page_about_intro', {
						values: { resort: location.resort?.name, sport: sport.sport.toLowerCase() }
					})}
					{#if location.resort?.minElevation && location.resort?.maxElevation}
						{$t('resort_page_fallback_elevation', {
							values: { min: location.resort.minElevation, max: location.resort.maxElevation }
						})}
					{/if}
					{$t('resort_sport_page_about_outro')}
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Related Resorts -->
	{#if relatedResorts && relatedResorts.length > 0}
		<div class="mb-8">
			<h2 class="mb-4 text-xl font-semibold">
				{$t('resort_page_other_resorts_title', {
					values: { region: location.region?.region || location.country.country }
				})}
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
									{$t('resort_sport_page_related_label', { values: { sport: sport.sport } })}
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
		<h2 class="mb-4 text-xl font-semibold">{$t('resort_sport_page_faq_title')}</h2>
		<div class="space-y-3">
			<Card>
				<CardContent class="p-4">
					<h3 class="mb-2 font-semibold text-sm">
						{$t('resort_sport_page_faq_booking_q', {
							values: { sport: sport.sport.toLowerCase(), resort: location.resort?.name }
						})}
					</h3>
					<p class="text-sm text-muted-foreground">
						{$t('resort_sport_page_faq_booking_a')}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardContent class="p-4">
					<h3 class="mb-2 font-semibold text-sm">
						{$t('resort_sport_page_faq_certified_q')}
					</h3>
					<p class="text-sm text-muted-foreground">
						{$t('resort_sport_page_faq_certified_a')}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardContent class="p-4">
					<h3 class="mb-2 font-semibold text-sm">
						{$t('resort_sport_page_faq_bring_q')}
					</h3>
					<p class="text-sm text-muted-foreground">
						{$t('resort_sport_page_faq_bring_a')}
					</p>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
