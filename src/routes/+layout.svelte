<script lang="ts">
	import { page } from '$app/state'; // Fixed import
	import { languageTag, availableLanguageTags } from '$lib/paraglide/runtime';
	import { getCanonicalUrl } from '$lib/utils/seo';

	let { children } = $props();
  </script>
  
  <svelte:head>
	<!-- Dynamic HTML lang attribute -->
	<html lang={languageTag()} />
  
	<!-- Proper hreflang implementation -->
	{#each availableLanguageTags as lang}
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
  
  {@render children()}