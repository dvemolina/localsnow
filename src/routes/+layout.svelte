<script lang="ts">
	import { page } from '$app/state';
	import { getCanonicalUrl, getAlternateUrls, isRoute } from '$lib/i18n/routeHelpers';
	import type { Locale } from '$lib/i18n/routes';
	import Header from '$src/lib/components/shared/Header.svelte';
	import '../app.css';
	import ScreenSize from '$src/lib/components/shared/ScreenSize.svelte';
	import Footer from '$src/lib/components/shared/Footer.svelte';
	import CookieConsent from '$src/lib/components/shared/CookieConsent.svelte';
	import { Toaster } from 'svelte-sonner';

	let { data, children } = $props();

	// Use isRoute helper to check dashboard/admin - works with translated URLs
	// This automatically handles /dashboard (en) and /panel (es) and /admin in both languages
	const isDashboard = $derived(
		isRoute(page.url.pathname, '/dashboard') || isRoute(page.url.pathname, '/admin')
	);

	// Get alternate URLs for hreflang
	const alternateUrls = $derived(getAlternateUrls(page.url.pathname));
</script>

<Toaster position="top-right" />

<svelte:head>
	<!-- hreflang implementation for multilingual SEO -->
	{#each alternateUrls as { locale, url }}
		<link rel="alternate" hreflang={locale} href={`${page.url.origin}${url}`} />
	{/each}

	<!-- x-default for unspecified languages (points to English) -->
	<link
		rel="alternate"
		hreflang="x-default"
		href={`${page.url.origin}${alternateUrls.find((a) => a.locale === 'en')?.url || '/en'}`}
	/>
</svelte:head>

<!-- 
<ModeWatcher /> -->

	{#if !isDashboard}
		<Header user={data.user} />
	{/if}
	<main class="wrapper h-full flex w-full flex-col items-center justify-center">
		<div class=" w-full {isDashboard ? '' : 'max-w-4xl px-4 pt-32'}">
			{@render children?.()}
		</div>
	</main>
	{#if !isDashboard}
	<div class="flex w-full flex-col items-center justify-center">
		<div class="flex w-full max-w-4xl flex-col items-center justify-center px-4">
			<Footer />
		</div>
	</div>
	{/if}
	<!-- <ScreenSize />-->
	<CookieConsent />
