<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Mountain, MapPin } from '@lucide/svelte';

  let { data } = $props();
  const { countryData, seo } = data;
</script>

<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <link rel="canonical" href={seo.canonicalUrl} />

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
  <div class="mb-6">
    <h1 class="title2 mb-2">
      Ski Resorts in {countryData.country.country}
    </h1>
    <p class="text-muted-foreground">
      Browse {countryData.totalResorts} ski resorts across {countryData.country.country}
    </p>
  </div>

  <!-- Resorts grouped by region -->
  {#if countryData.resortsByRegion && countryData.resortsByRegion.length > 0}
    {#each countryData.resortsByRegion as regionGroup}
      <div class="mb-8">
        <h2 class="mb-4 text-xl font-semibold">
          {#if regionGroup.regionSlug}
            <a
              href="/resorts/{countryData.country.countrySlug}/{regionGroup.regionSlug}"
              class="hover:text-primary transition-colors"
            >
              {regionGroup.region}
            </a>
          {:else}
            {regionGroup.region}
          {/if}
        </h2>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {#each regionGroup.resorts as resort}
            <a
              href="/resorts/{countryData.country.countrySlug}/{regionGroup.regionSlug}/{resort.slug}"
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
                    <p class="text-sm text-muted-foreground">
                      {resort.minElevation}m - {resort.maxElevation}m
                    </p>
                  {/if}
                </CardContent>
              </Card>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <Card>
      <CardContent class="p-6">
        <p class="text-muted-foreground">No resorts found in this country.</p>
      </CardContent>
    </Card>
  {/if}
</section>
