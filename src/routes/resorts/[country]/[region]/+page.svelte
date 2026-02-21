<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Mountain, MapPin, ExternalLink } from '@lucide/svelte';
  import { t } from '$lib/i18n/i18n';

  let { data } = $props();
  const { regionData, seo } = data;
  const defaultAlternate = seo.alternates?.find((alt: { locale: string }) => alt.locale === 'en');

  let showWithInstructors = $state(false);

  const filteredResorts = $derived(
    showWithInstructors
      ? regionData.resorts.filter((r: { instructorCount: number }) => r.instructorCount > 0)
      : regionData.resorts
  );
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
  <!-- Breadcrumb -->
  <nav class="text-muted-foreground mb-4 text-sm">
    <a href="/resorts" class="hover:text-foreground transition-colors">{$t('resorts_listing_title')}</a>
    <span class="mx-2">›</span>
    <a
      href="/resorts/{regionData.country.countrySlug}"
      class="hover:text-foreground transition-colors"
    >{regionData.country.country}</a>
    <span class="mx-2">›</span>
    <span>{regionData.region.region}</span>
  </nav>

  <!-- Header + toggle -->
  <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="title2 mb-1">
        {$t('resorts_region_title', { region: regionData.region.region })}
      </h1>
      <p class="text-muted-foreground flex items-center gap-2">
        <MapPin class="h-4 w-4" />
        {$t('resorts_region_subtitle', {
          region: regionData.region.region,
          country: regionData.country.country,
          count: regionData.totalResorts
        })}
      </p>
    </div>

    <label class="flex cursor-pointer items-center gap-3">
      <span class="text-sm text-muted-foreground">{$t('resorts_listing_filter_with_instructors')}</span>
      <button
        role="switch"
        aria-checked={showWithInstructors}
        onclick={() => (showWithInstructors = !showWithInstructors)}
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background {showWithInstructors
          ? 'bg-primary'
          : 'bg-input'}"
      >
        <span
          class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform {showWithInstructors
            ? 'translate-x-5'
            : 'translate-x-0'}"
        ></span>
      </button>
    </label>
  </div>

  <!-- Resorts grid -->
  {#if filteredResorts && filteredResorts.length > 0}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each filteredResorts as resort}
        <a
          href="/resorts/{regionData.country.countrySlug}/{regionData.region.regionSlug}/{resort.slug}"
          class="transition-transform hover:scale-[1.02]"
        >
          <Card class="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base">
                <Mountain class="h-4 w-4" />
                {resort.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {#if resort.minElevation && resort.maxElevation}
                <p class="text-muted-foreground mb-2 text-sm">
                  {$t('resorts_region_elevation', { min: resort.minElevation, max: resort.maxElevation })}
                </p>
              {/if}
              {#if resort.website}
                <a
                  href={resort.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                  onclick={(e) => e.stopPropagation()}
                >
                  {$t('resorts_region_visit_website')}
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
        <p class="text-muted-foreground">
          {showWithInstructors
            ? $t('resorts_listing_no_results_instructors')
            : $t('resorts_region_no_resorts')}
        </p>
      </CardContent>
    </Card>
  {/if}
</section>
