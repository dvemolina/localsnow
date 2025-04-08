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
		<main class="h-full w-full max-w-4xl pt-32 px-4 min-h-screen">
			{@render children()}
		</main>
	</div>
	<Footer/>
	<ScreenSize/>
</div>

<style>
	.dots {
		content: none;
		background-image: url('/dots-25.svg');
		background-repeat: repeat;
		background-size:  258px;
		width:100%;
		height: 100%;
		position: fixed;
		overflow-y: auto;
	}

	.topo {
		content: none;
		background-image: url('/topomap.png');
		background-repeat: no-repeat;
		background-size:  cover;
		background-position: center;
		width:100%;
		height: 100%;
		position: fixed;
		overflow-y: auto;
	}
</style>