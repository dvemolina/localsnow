<script lang="ts">
	import { page } from '$app/state';
	import { locales } from '$lib/paraglide/runtime';
	import { getCanonicalUrl } from '$lib/utils/seo';
	import Header from '$src/lib/components/shared/Header.svelte';
	import '../app.css';
	import ScreenSize from '$src/lib/components/shared/ScreenSize.svelte';
	import Footer from '$src/lib/components/shared/Footer.svelte';

	let { children } = $props();
	let isDashboard = $state(page.url.pathname.includes('/dashboard'))

	$effect(()=> {
		isDashboard = page.url.pathname.includes('/dashboard')
	})
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
	{#if !isDashboard}
		<Header />
	{/if}
	<div class="wrapper flex w-full flex-col items-center justify-center">
		<main class="h-full min-h-screen w-full  {isDashboard ? '' : 'max-w-4xl px-4 pt-32'}">
			{@render children()}
		</main>
	</div>
	{#if !isDashboard}
		<Footer />
	{/if}
	<ScreenSize />
</div>

<style>
	.dots {
		content: none;
		background-image: url('/dots-25.svg');
		background-repeat: repeat;
		background-size: 258px;
		width: 100%;
		height: 100%;
		position: fixed;
		overflow-y: auto;
	}

	/* .topo {
		content: none;
		background-image: url('/topomap.png');
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		width: 100%;
		height: 100%;
		position: fixed;
		overflow-y: auto;
	} */
</style>
