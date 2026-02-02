<script lang="ts">
	import SchoolCard from '$src/features/Schools/components/SchoolCard.svelte';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SortBySelect from '$src/lib/components/shared/SortBySelect.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { goto } from '$app/navigation';
	import { Button } from '$src/lib/components/ui/button';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';
	import { Badge } from '$src/lib/components/ui/badge';
	import { t } from '$lib/i18n/i18n';
	import { page } from '$app/state';
	import { extractLocale, type Locale } from '$lib/i18n/routes';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

	let { data } = $props();
	const PRIMARY_ORIGIN = 'https://localsnow.org';
	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const schoolsBase = $derived(route('/schools', currentLocale));
	const canonicalPath = $derived(schoolsBase);
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	})));
	const defaultAlternate = $derived(alternates.find((alt) => alt.locale === 'en'));

	// Filter schema for the search form
	const filterSchema = z.object({
		resort: z.number().optional(),
		sortBy: z.string().optional()
	});

	// Initialize form for filters
	const form = superForm(
		{
			resort: data.filters.resort,
			sortBy: data.filters.sortBy
		},
		{
			validators: zodClient(filterSchema),
			SPA: true,
			dataType: 'json'
		}
	);

	const { form: formData } = form;

	// Verified only checkbox (separate from superform since it's a simple boolean)
	let verifiedOnly = $state(data.filters.verifiedOnly === 'true');

	// Apply filters function
	async function applyFilters() {
		const params = new URLSearchParams();

		if ($formData.resort) params.set('resort', $formData.resort.toString());
		if ($formData.sortBy) params.set('sortBy', $formData.sortBy);
		if (verifiedOnly) params.set('verifiedOnly', 'true');

		goto(`/schools?${params.toString()}`);
	}

	// Clear all filters
	function clearFilters() {
		$formData.resort = undefined;
		$formData.sortBy = undefined;
		verifiedOnly = false;
		goto('/schools');
	}

	// Remove individual filter
	function removeFilter(filterName: string) {
		if (filterName === 'verifiedOnly') {
			verifiedOnly = false;
		} else {
			($formData as any)[filterName] = undefined;
		}
		applyFilters();
	}

	const hasActiveFilters = $derived(!!$formData.resort || verifiedOnly);

	// Get filter labels for display
	function getResortName(resortId: number | undefined) {
		return resortId ? `Resort #${resortId}` : '';
	}

	// ItemList schema for SEO
	const itemListSchema = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Ski and Snowboard Schools',
		description: 'Browse certified ski and snowboard schools at top resorts worldwide',
		numberOfItems: data.schools.length,
		itemListElement: data.schools.slice(0, 20).map((school, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'Organization',
				name: school.name,
				url: `${PRIMARY_ORIGIN}${schoolsBase}/${school.slug}`
			}
		}))
	};

	// Organization schema
	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Local Snow',
		url: 'https://localsnow.org',
		logo: 'https://localsnow.org/local-snow-head.png',
		description: 'Free directory of ski and snowboard schools worldwide',
		sameAs: []
	};

	// Breadcrumb schema
	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: `${PRIMARY_ORIGIN}${route('/', currentLocale)}`
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Schools',
				item: canonicalUrl
			}
		]
	};
</script>

<svelte:head>
	<title>Ski & Snowboard Schools Directory | LocalSnow</title>
	<meta
		name="description"
		content="Find certified ski and snowboard schools at top resorts worldwide. Browse profiles, compare services, and connect with professional ski schools."
	/>

	<!-- Open Graph -->
	<meta property="og:title" content="Ski & Snowboard Schools Directory | LocalSnow" />
	<meta
		property="og:description"
		content="Find certified ski and snowboard schools at top resorts worldwide."
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="https://localsnow.org/ski-instructor-turn.webp" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Ski & Snowboard Schools Directory | LocalSnow" />
	<meta
		name="twitter:description"
		content="Find certified ski and snowboard schools at top resorts worldwide."
	/>
	<meta name="twitter:image" content="https://localsnow.org/ski-instructor-turn.webp" />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(itemListSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}<\/script>`}

	<!-- Canonical tag: always point to clean URL without query params -->
	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	{#if defaultAlternate}
		<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
	{/if}
</svelte:head>

<section class="w-full">
	<!-- Header -->
	<div class="mb-6 text-center">
		<h1 class="title2 mb-2">Ski & Snowboard Schools</h1>
		<p class="text-muted-foreground text-sm">
			Find certified ski and snowboard schools at top resorts worldwide
		</p>
	</div>

	<!-- Filters Section -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm overflow-visible">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-base font-semibold">Filter & Sort</h2>
			{#if hasActiveFilters}
				<Button type="button" variant="ghost" size="sm" onclick={clearFilters}>
					Clear All
				</Button>
			{/if}
		</div>

		<!-- Main Filters -->
		<div class="grid gap-3 md:grid-cols-3 overflow-visible mb-4">
			<SearchResort {form} name="resort" label="Resort" />
			<SortBySelect {form} name="sortBy" />
			<div class="flex items-center space-x-2 pt-6">
				<Checkbox id="verified" bind:checked={verifiedOnly} />
				<Label for="verified" class="text-sm font-medium leading-none cursor-pointer">
					Verified Only
				</Label>
			</div>
		</div>

		<!-- Search Button -->
		<div class="flex items-center gap-3">
			<Button type="button" onclick={applyFilters} class="flex-1 md:flex-none">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-4 w-4"
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
				Search
			</Button>
		</div>
	</div>

	<!-- Active Filters Chips -->
	{#if hasActiveFilters}
		<div class="mb-4 flex flex-wrap items-center gap-2">
			<span class="text-muted-foreground text-sm">Active filters:</span>
			{#if $formData.resort}
				<Badge variant="secondary" class="gap-1">
					{getResortName($formData.resort)}
					<button
						type="button"
						onclick={() => removeFilter('resort')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			{#if verifiedOnly}
				<Badge variant="secondary" class="gap-1">
					Verified Only
					<button
						type="button"
						onclick={() => removeFilter('verifiedOnly')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			<Button variant="ghost" size="sm" onclick={clearFilters} class="h-6 px-2 text-xs">
				Clear All
			</Button>
		</div>
	{/if}

	<!-- Results Section -->
	{#if !data.hasFilters}
		<!-- Prompt-First UI: Show before any search is performed -->
		<div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="text-primary mb-3 h-12 w-12"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<h3 class="mb-2 text-lg font-semibold">Find Ski & Snowboard Schools</h3>
			<p class="text-muted-foreground text-sm mb-5 max-w-md">
				Search our directory of certified ski and snowboard schools. Use the filters above to find schools by resort, or browse verified schools only.
			</p>
			<div class="flex flex-col gap-2 sm:flex-row">
				<Button href="/resorts" variant="default" size="sm">Browse by Resort</Button>
				<Button href="/instructors" variant="outline" size="sm">View Instructors</Button>
			</div>
		</div>
	{:else}
		<!-- Results with filters applied -->
		<!-- Results Count -->
		<div class="mb-4 flex items-center justify-between">
			<p class="text-muted-foreground text-sm">
				{#if data.schools.length === 0}
					No schools found
				{:else if data.schools.length === 1}
					1 school found
				{:else}
					{data.schools.length} schools found
				{/if}
			</p>
		</div>

		<!-- School Cards Grid or Empty State -->
		{#if data.schools.length === 0}
			<div class="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 sm:p-12 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="text-muted-foreground mb-3 h-12 w-12"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<h3 class="mb-2 text-base font-semibold">No schools match your search</h3>
				<p class="text-muted-foreground text-sm mb-4">Try adjusting your filters or search criteria to see more results.</p>
				<div class="flex gap-2">
					<Button onclick={clearFilters} variant="default" size="sm">Clear all filters</Button>
					<Button href="/resorts" variant="outline" size="sm">Browse by resort</Button>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
				{#each data.schools as school (school.id)}
					<SchoolCard schoolData={school} preserveFilters={hasActiveFilters} />
				{/each}
			</div>
		{/if}
	{/if}
</section>
