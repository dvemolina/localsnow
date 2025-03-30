<script lang="ts">
	import { page } from '$app/state'; 
	import { locales } from '$lib/paraglide/runtime'; 
	import { getCanonicalUrl } from '$lib/utils/seo';

	let { children } = $props();
</script>

<svelte:head>
	<!-- Proper hreflang implementation -->
	{#each locales as lang}
	  <link 
		rel="alternate"
		hreflang={lang}
		href={getCanonicalUrl(page.url, lang)}
	  />
	{/each}

	<!-- x-default for unspecified languages -->
	<link
	  rel="alternate"
	  hreflang="x-default"
	  href={getCanonicalUrl(page.url, 'en')} 
	/>
</svelte:head>

<!-- Don't set lang attribute here, it's handled in hooks.server.ts -->
{@render children()}