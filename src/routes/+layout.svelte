<script lang="ts">
	import { page } from '$app/state';
	import { locales } from '$lib/paraglide/runtime';
	import { getCanonicalUrl } from '$lib/utils/seo';
	import Header from '$src/lib/components/shared/Header.svelte';
	import '../app.css';
	import ScreenSize from '$src/lib/components/shared/ScreenSize.svelte';
	import Footer from '$src/lib/components/shared/Footer.svelte';

	let { children } = $props();
	let isDashboard = $state(page.url.pathname.includes('/dashboard'));

	$effect(() => {
		isDashboard = page.url.pathname.includes('/dashboard');
	});
</script>

<svelte:head>
	<!-- hreflang implementation -->
	{#each locales as lang}
		<link rel="alternate" hreflang={lang} href={getCanonicalUrl(page.url, lang)} />
	{/each}

	<!-- x-default for unspecified languages -->
	<link rel="alternate" hreflang="x-default" href={getCanonicalUrl(page.url, 'en')} />
</svelte:head>

<!-- 
<ModeWatcher /> -->

	{#if !isDashboard}
		<Header />
	{/if}
	<main class="wrapper h-full flex w-full flex-col items-center justify-center">
		<div class=" w-full {isDashboard ? '' : 'max-w-4xl px-4 pt-32'}">
			{@render children()}
		</div>
	</main>
	{#if !isDashboard}
	<div class="flex w-full flex-col items-center justify-center">
		<div class="flex w-full max-w-4xl flex-col items-center justify-center px-4">
			<Footer />
		</div>
	</div>
	{/if}
	<ScreenSize />



