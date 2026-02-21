<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search } from '@lucide/svelte';
	import { t } from '$lib/i18n/i18n';

	let { data } = $props();
	const { countries, totalCountries, totalResorts, seo } = data;
	const defaultAlternate = seo.alternates?.find((alt: { locale: string }) => alt.locale === 'en');

	let searchQuery = $state('');

	function countryFlag(code: string): string {
		if (!code || code.length < 2) return '🏔️';
		return [...code.toUpperCase().slice(0, 2)]
			.map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
			.join('');
	}

	const filteredCountries = $derived(
		searchQuery.trim() === ''
			? countries
			: countries.filter((c: { country: string }) =>
					c.country.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);
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
</svelte:head>

<section class="w-full">
	<!-- Header -->
	<div class="mb-6 mt-4 text-center">
		<h1 class="title2 mb-2">{$t('resorts_listing_title')}</h1>
		<p class="text-muted-foreground">
			{$t('resorts_listing_subtitle', { count: totalCountries, resorts: totalResorts })}
		</p>
	</div>

	<!-- Search -->
	<div class="mb-8">
		<div class="relative mx-auto max-w-md">
			<Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				placeholder={$t('resorts_listing_search_placeholder')}
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
	</div>

	<!-- Country Grid -->
	{#if filteredCountries.length === 0}
		<div class="py-12 text-center">
			<p class="text-muted-foreground">
				{$t('resorts_listing_no_results_search', { query: searchQuery })}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
			{#each filteredCountries as country}
				<a
					href="/resorts/{country.countrySlug}"
					class="border-border bg-card hover:shadow-md group rounded-lg border p-4 text-center transition-shadow"
				>
					<div class="mb-2 text-3xl md:text-4xl">{countryFlag(country.countryCode)}</div>
					<h2 class="mb-1 text-sm font-semibold md:text-base">{country.country}</h2>
					<p class="text-muted-foreground text-xs">
						{$t('resorts_listing_resort_count', { count: country.resortCount })}
					</p>
				</a>
			{/each}
		</div>
	{/if}
</section>
