<script lang="ts">
	import { page } from '$app/state';
	import { locales } from '$lib/paraglide/runtime';
	import { getCanonicalUrl } from '$lib/utils/seo';
	import Header from 'src/lib/components/shared/Header.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
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

<ModeWatcher />
<Header />
<div class="wrapper flex h-full w-full flex-col items-center justify-center">
	<main class="h-full w-full max-w-4xl pt-[80px]">
		{@render children()}
	</main>
</div>
