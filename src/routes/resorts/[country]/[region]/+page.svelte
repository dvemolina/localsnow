<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Mountain, MapPin, ExternalLink } from '@lucide/svelte';

  let { data } = $props();
  const { regionData, seo } = data;
  const defaultAlternate = seo.alternates?.find((alt) => alt.locale === 'en');
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

  <!-- Open Graph -->
  <meta property="og:type" content={seo.openGraph.type} />
  <meta property="og:url" content={seo.openGraph.url} />
  <meta property="og:title" content={seo.openGraph.title} />
  <meta property="og:description" content={seo.openGraph.description} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
</svelte:head>

<section class="w-full">
  <div class="mb-6 mt-4">
    <h1 class="title2 mb-2">
      Ski Resorts in {regionData.region.region}
    </h1>
    <p class="text-muted-foreground flex items-center gap-2">
      <MapPin class="h-4 w-4" />
      {regionData.region.region}, {regionData.country.country} • {regionData.totalResorts} resorts
    </p>
  </div>

  <!-- Resorts grid -->
  {#if regionData.resorts && regionData.resorts.length > 0}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each regionData.resorts as resort}
        <a
          href="/resorts/{regionData.country.countrySlug}/{regionData.region.regionSlug}/{resort.slug}"
          class="transition-transform hover:scale-[1.02]"
        >
          <Card class="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <Mountain class="h-4 w-4" />
                {resort.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {#if resort.minElevation && resort.maxElevation}
                <p class="text-sm text-muted-foreground mb-2">
                  Elevation: {resort.minElevation}m - {resort.maxElevation}m
                </p>
              {/if}
              {#if resort.website}
                <a
                  href={resort.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  onclick={(e) => e.stopPropagation()}
                >
                  Visit website
                  <ExternalLink class="h-3 w-3" />
                </a>
              {/if}
            </CardContent>
          </Card>
        </a>
      {/each}
    </div>
  {:else}
    <Card>
      <CardContent class="p-6">
        <p class="text-muted-foreground">No resorts found in this region.</p>
      </CardContent>
    </Card>
  {/if}
</section>
