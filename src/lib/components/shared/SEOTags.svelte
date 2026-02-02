<script lang="ts">
	/**
	 * SEO Tags Component
	 *
	 * Automatically generates proper hreflang tags and canonical URLs
	 * for multilingual SEO optimization.
	 *
	 * Usage in +page.svelte:
	 *   <SEOTags title="About Us" description="Learn about Local Snow" />
	 */

	import { page } from '$app/state';
	import { getAlternateUrls, getCanonicalUrl } from '$lib/i18n/routeHelpers';
	import { extractLocale, type Locale } from '$lib/i18n/routes';

	interface Props {
		title?: string;
		description?: string;
		keywords?: string;
		image?: string;
		noindex?: boolean;
		canonical?: string; // Override canonical URL if needed
	}

	let { title, description, keywords, image, noindex = false, canonical }: Props = $props();

	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const currentUrl = $derived(page.url);
	const canonicalUrl = $derived(canonical || getCanonicalUrl(currentUrl, currentLocale));
	const alternateUrls = $derived(getAlternateUrls(page.url.pathname));

	// Build full page title
	const fullTitle = $derived(title ? `${title} | Local Snow` : 'Local Snow');

	// Default OG image
	const ogImage = $derived(image || `${currentUrl.origin}/og-image.jpg`);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- Hreflang Tags for Multilingual SEO -->
	{#each alternateUrls as { locale, url }}
		<link rel="alternate" hreflang={locale} href={`${currentUrl.origin}${url}`} />
	{/each}
	<!-- x-default hreflang (points to English version) -->
	<link
		rel="alternate"
		hreflang="x-default"
		href={`${currentUrl.origin}${alternateUrls.find((a) => a.locale === 'en')?.url || '/'}`}
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={fullTitle} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content={currentLocale === 'es' ? 'es_ES' : 'en_US'} />
	{#each alternateUrls.filter((a) => a.locale !== currentLocale) as { locale }}
		<meta property="og:locale:alternate" content={locale === 'es' ? 'es_ES' : 'en_US'} />
	{/each}

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={fullTitle} />
	{#if description}
		<meta property="twitter:description" content={description} />
	{/if}
	<meta property="twitter:image" content={ogImage} />

	<!-- Language -->
	<meta property="og:locale" content={currentLocale === 'es' ? 'es_ES' : 'en_US'} />

	<!-- Robots -->
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>
