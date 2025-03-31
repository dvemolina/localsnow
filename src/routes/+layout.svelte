<script lang="ts">
	import { page } from '$app/state';
	import { locales } from '$lib/paraglide/runtime';
	import { getCanonicalUrl } from '$lib/utils/seo';
	import Header from '$src/lib/components/shared/Header.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import ScreenSize from '$src/lib/components/shared/ScreenSize.svelte';
	import Footer from '$src/lib/components/shared/Footer.svelte';
	
	let { children } = $props();
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
<div class="dots">
	<Header /> 
	<div class="wrapper flex w-full flex-col items-center justify-center">
		<main class="h-full w-full max-w-4xl pt-36 px-2 min-h-screen">
			{@render children()}
		</main>
	</div>
	<Footer/>
	<ScreenSize/>
</div>
