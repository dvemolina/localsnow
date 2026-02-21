<script lang="ts">
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import { heroResortSearchSchema } from '$src/features/Resorts/lib/resortSchemas';
	import SportSelect from '$src/features/Resorts/components/SportSelect.svelte';
	import SearchTypeToggle from '$src/lib/components/shared/SearchTypeToggle.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { t } from '$lib/i18n/i18n';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
	import { page } from '$app/state';
	import { extractLocale, type Locale } from '$lib/i18n/routes';
	let { data } = $props();
	const PRIMARY_ORIGIN = 'https://localsnow.org';

	// Search type state for toggle
	let searchType = $state<'instructors' | 'schools'>('instructors');

	// Get current locale for form submission
	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const canonicalPath = $derived(route('/', currentLocale));
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(
		getAlternateUrls(canonicalPath).map((alt) => ({
			locale: alt.locale,
			url: `${PRIMARY_ORIGIN}${alt.url}`
		}))
	);
	const defaultAlternate = $derived(alternates.find((alt) => alt.locale === 'en'));

	// Top resorts for homepage - use $derived for translation reactivity
	// Showcasing global coverage across continents
	const topResorts = $derived([
		{
			name: 'Baqueira-Beret',
			slug: 'baqueira-beret',
			region: $t('home_resort_regions_baqueira'),
			description: $t('home_resort_descriptions_baqueira'),
			image: 'https://assets.localsnow.org/resorts/baqueira-beret'
		},
		{
			name: 'Verbier',
			slug: 'verbier',
			region: $t('home_resort_regions_verbier'),
			description: $t('home_resort_descriptions_verbier'),
			image: 'https://assets.localsnow.org/resorts/verbier'
		},
		{
			name: 'Cerro Catedral',
			slug: 'cerro-catedral',
			region: $t('home_resort_regions_cerro_catedral'),
			description: $t('home_resort_descriptions_cerro_catedral'),
			image: 'https://assets.localsnow.org/resorts/cerro-catedral'
		},
		{
			name: 'Niseko',
			slug: 'niseko-moiwa-ski-resort',
			region: $t('home_resort_regions_niseko'),
			description: $t('home_resort_descriptions_niseko'),
			image: 'https://assets.localsnow.org/resorts/niseko-united'
		}
	]);

	// Schema markup for SEO
	const websiteSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Local Snow',
		description:
			'Curated directory of ski and snowboard instructors. Browse profiles with real details, check specialties and languages, send lesson requests directly. Free to use, no platform fees.',
		url: 'https://localsnow.org',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://localsnow.org/instructors?q={search_term_string}',
			'query-input': 'required name=search_term_string'
		}
	};

	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Local Snow',
		url: 'https://localsnow.org',
		logo: 'https://localsnow.org/localsnow-logo-v-black.png',
		description:
			'Curated directory of ski and snowboard instructors worldwide. Browse profiles by resort, specialty, and language. Send lesson requests and connect directly. Zero platform fees, community-driven, built for local discovery.',
		email: 'admin@localsnow.org',
		serviceType: 'Ski Instructor Directory',
		foundingDate: '2024',
		sameAs: []
	};

	// FAQ Schema for SEO
	const faqSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{ '@type': 'Question', name: $t('home_faq_q1'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a1') } },
			{ '@type': 'Question', name: $t('home_faq_q2'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a2') } },
			{ '@type': 'Question', name: $t('home_faq_q3'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a3') } },
			{ '@type': 'Question', name: $t('home_faq_q4'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a4') } },
			{ '@type': 'Question', name: $t('home_faq_q5'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a5') } },
			{ '@type': 'Question', name: $t('home_faq_q6'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a6') } },
			{ '@type': 'Question', name: $t('home_faq_q7'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a7') } },
			{ '@type': 'Question', name: $t('home_faq_q8'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a8') } },
			{ '@type': 'Question', name: $t('home_faq_q9'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a9') } },
			{ '@type': 'Question', name: $t('home_faq_q10'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a10') } },
			{ '@type': 'Question', name: $t('home_faq_q11'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a11') } },
			{ '@type': 'Question', name: $t('home_faq_q12'), acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a12') } }
		]
	});

	// Base path for resort country pages
	const resortsBase = $derived(route('/resorts', currentLocale));

	// Hero Resort Search Form
	const form = superForm(data.form, {
		validators: zodClient(heroResortSearchSchema)
	});

	const { form: formData, enhance } = form;
</script>

<svelte:head>
	<title>{$t('seo_meta_home_title')}</title>
	<meta name="description" content={$t('seo_meta_home_description')} />

	<!-- Open Graph -->
	<meta property="og:title" content={$t('seo_meta_home_title')} />
	<meta property="og:description" content={$t('seo_meta_home_description')} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="https://localsnow.org/ski-instructor-powder.webp" />
	<meta property="og:image:alt" content="Ski instructor teaching in powder snow" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card -->
	<meta name="twitter:title" content={$t('seo_meta_home_title')} />
	<meta name="twitter:description" content={$t('seo_meta_home_description')} />
	<meta name="twitter:image" content="https://localsnow.org/ski-instructor-powder.webp" />

	{@html `<script type="application/ld+json">${JSON.stringify(websiteSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}<\/script>`}
	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	{#if defaultAlternate}
		<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
	{/if}
</svelte:head>

<section class="hero relative h-full w-full" itemscope itemtype="http://schema.org/WPHeader">
	<!-- Hero image -->
	<div class="overlay absolute inset-0 z-0 max-h-[400px] rounded-lg shadow-md">
		<picture>
			<source srcset="/ski-instructor-powder.webp" type="image/webp" />
			<img
				src="/ski-instructor-powder.jpeg"
				alt="Ski instructor teaching in powder snow"
				width="1195"
				height="721"
				loading="eager"
				fetchpriority="high"
				decoding="async"
				class="h-full w-full rounded-md object-cover object-right"
				itemprop="primaryImageOfPage"
			/>
		</picture>
	</div>

	<!-- Content overlay with search -->
	<div
		class="relative z-10 container flex h-full flex-col items-center justify-center rounded-md px-4 py-6 text-white"
	>
		<div class="flex h-full w-full flex-col justify-between gap-4">
			<h1
				itemprop="headline"
				class="text-shadow mb-4 text-3xl font-bold sm:text-5xl md:text-6xl lg:text-6xl"
			>
				{$t('home_hero_title_v2')}
			</h1>
			<div class="flex h-full flex-col justify-center align-bottom">
				<div class="flex flex-wrap items-center justify-start gap-3 md:gap-4 p-0 mb-1 text-white/90 text-xs md:text-sm">
					<div class="flex items-center gap-1.5">
						<svg class="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
						</svg>
						<span>{$t('home_trust_metric_global')}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<svg class="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
						</svg>
						<span>{$t('home_trust_metric_resorts')}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<svg class="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
						</svg>
						<span>{$t('home_trust_metric_certified')}</span>
					</div>
				</div>
				<p class="text-shadow mb-6 max-w-[600px] text-lg text-white sm:text-xl md:text-2xl">
					{$t('home_hero_subtitle')}
				</p>

				<!-- Search form -->
				<form method="POST" use:enhance class="rounded-lg bg-white/90 p-4 shadow-lg">
					<input type="hidden" name="locale" value={currentLocale} />
					<input type="hidden" name="searchType" value={searchType} />

					<!-- Search Type Toggle -->
					<div class="mb-4">
						<SearchTypeToggle bind:value={searchType} />
					</div>

					<div class="flex flex-col gap-4 md:flex-row">
						<div class="flex-1">
							<SearchResort {form} name="resort" id="location" />
						</div>
						<div class="text-foreground flex-1">
							<SportSelect {form} name="sport" isHero={true} />
						</div>
						<div class="flex items-center pt-4">
							<button
								type="submit"
								class="bg-primary h-12 w-full rounded-md p-3 font-medium whitespace-nowrap text-white md:w-auto"
							>
								{$t('home_hero_cta')}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

<!-- Free Forever Banner -->
<section
	class="mt-12 rounded-md border-2 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 px-5 py-10 shadow-sm"
>
	<div class="container">
		<div class="mx-auto max-w-4xl text-center">
			<div
				class="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-900"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg
				>
				{$t('home_free_banner_badge')}
			</div>

			<h2 class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
				{$t('home_free_banner_title')}
			</h2>

			<p class="mx-auto mb-6 max-w-2xl text-lg leading-relaxed text-gray-700">
				{$t('home_free_banner_description')}
			</p>

			<div class="mt-8 grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
				<div
					class="flex flex-col items-center gap-2 rounded-lg border-2 border-green-200 bg-white px-4 py-4 shadow-sm"
				>
					<div class="text-center">
						<div class="text-2xl font-bold text-green-900">
							{$t('home_free_banner_booking_fees')}
						</div>
						<div class="text-sm text-gray-600">{$t('home_free_banner_booking_fees_label')}</div>
					</div>
				</div>

				<div
					class="flex flex-col items-center gap-2 rounded-lg border-2 border-green-200 bg-white px-4 py-4 shadow-sm"
				>
					<div class="text-center">
						<div class="text-2xl font-bold text-green-900">{$t('home_free_banner_commission')}</div>
						<div class="text-sm text-gray-600">{$t('home_free_banner_commission_label')}</div>
					</div>
				</div>

				<div
					class="flex flex-col items-center gap-2 rounded-lg border-2 border-green-200 bg-white px-4 py-4 shadow-sm"
				>
					<div class="text-center">
						<div class="text-2xl font-bold text-green-900">{$t('home_free_banner_unlimited')}</div>
						<div class="text-sm text-gray-600">{$t('home_free_banner_unlimited_label')}</div>
					</div>
				</div>
			</div>

			<p class="mt-6 text-sm text-gray-600 italic">
				{$t('home_free_banner_tagline')}
			</p>
		</div>
	</div>
</section>

<!-- Top Resorts Section -->
<section class="section">
	<h2 class="mb-2 text-center text-3xl font-bold">{$t('home_resorts_title')}</h2>
	<p class="mb-8 text-center text-gray-600">{$t('home_resorts_subtitle')}</p>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each topResorts as resort}
			<a
				href={route('/instructors', currentLocale, { resort: resort.slug })}
				class="resort-card group border-border relative overflow-hidden rounded-lg border shadow-lg transition-all hover:shadow-xl"
			>
				<!-- Background Image -->
				<div class="absolute inset-0">
					<img
						src={resort.image}
						alt={resort.name}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
						onerror={(event) => {
							const target = event.currentTarget as HTMLImageElement;
							target.src = 'https://assets.localsnow.org/resorts/default-resort-landscape.webp';
						}}
					/>
					<!-- Gradient Overlay for better text readability -->
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/15"
					></div>
				</div>

				<!-- Content -->
				<div class="relative flex h-full min-h-[280px] flex-col justify-end p-6 text-white">
					<h3 class="mb-2 text-xl font-bold drop-shadow-lg">{resort.name}</h3>
					<p class="mb-1 text-sm text-white/95 drop-shadow-md">{resort.region}</p>
					<p class="mb-4 text-sm text-white/85 drop-shadow-md">{resort.description}</p>
					<span
						class="inline-flex items-center font-semibold text-white transition-transform group-hover:translate-x-1"
					>
						{$t('home_resorts_view_instructors')} →
					</span>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-8 text-center">
		<a
			href={route('/resorts')}
			class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white"
		>
			{$t('home_resorts_view_all')}
		</a>
	</div>
</section>

<!-- Browse by Region Section -->
<section class="grey-section">
	<div class="container">
		<h2 class="mb-2 text-center text-2xl md:text-3xl font-bold">{$t('home_regions_title')}</h2>
		<p class="mb-8 text-center text-sm md:text-base text-muted-foreground">{$t('home_regions_subtitle')}</p>

		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
			<a href="{resortsBase}/spain" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇪🇸</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_spain')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
			<a href="{resortsBase}/switzerland" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇨🇭</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_switzerland')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
			<a href="{resortsBase}/france" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇫🇷</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_france')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
			<a href="{resortsBase}/austria" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇦🇹</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_austria')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
			<a href="{resortsBase}/italy" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇮🇹</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_italy')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
			<a href="{resortsBase}/canada" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇨🇦</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_canada')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
			<a href="{resortsBase}/usa" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇺🇸</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_usa')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
			<a href="{resortsBase}/japan" class="group border-border bg-card hover:shadow-md transition-shadow rounded-lg border p-4 text-center">
				<div class="text-3xl md:text-4xl mb-2">🇯🇵</div>
				<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_region_japan')}</h3>
				<p class="text-xs text-muted-foreground">{$t('home_region_description')}</p>
			</a>
		</div>

		<div class="mt-8 text-center">
			<a href={resortsBase} class="inline-block rounded-md border border-primary px-6 py-3 text-sm md:text-base font-medium text-primary hover:bg-primary hover:text-white transition-all">
				{$t('home_regions_view_all')} →
			</a>
		</div>
	</div>
</section>

<!-- For Instructors Section -->
<section class="section">
	<div class="container max-w-6xl">
		<div class="mb-10 text-center">
			<h2 class="mb-3 text-2xl md:text-3xl font-bold">{$t('home_for_instructors_title')}</h2>
			<p class="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
				{$t('home_for_instructors_subtitle')}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<!-- Keep 100% of Earnings -->
			<div class="border-border bg-card rounded-lg border p-6 text-center shadow-sm">
				<div class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<h3 class="mb-2 text-lg md:text-xl font-semibold">{$t('home_instructors_keep_100_title')}</h3>
				<p class="text-sm text-muted-foreground mb-3">{$t('home_instructors_keep_100_desc')}</p>
				<div class="bg-green-50 rounded-lg p-3 text-sm">
					<div class="font-bold text-green-900 ">€100 lesson = €100 earned</div>
					<div class="text-xs text-green-700 mt-1">{$t('home_instructors_vs_platforms')}</div>
				</div>
			</div>

			<!-- Get Discovered -->
			<div class="border-border bg-card rounded-lg border p-6 text-center shadow-sm">
				<div class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
				</div>
				<h3 class="mb-2 text-lg md:text-xl font-semibold">{$t('home_instructors_get_discovered_title')}</h3>
				<p class="text-sm text-muted-foreground mb-3">{$t('home_instructors_get_discovered_desc')}</p>
				<ul class="text-left text-xs text-muted-foreground space-y-1">
					<li class="flex items-start gap-2"><span class="text-primary">✓</span><span>{$t('home_instructors_search_resort')}</span></li>
					<li class="flex items-start gap-2"><span class="text-primary">✓</span><span>{$t('home_instructors_search_language')}</span></li>
					<li class="flex items-start gap-2"><span class="text-primary">✓</span><span>{$t('home_instructors_search_specialty')}</span></li>
				</ul>
			</div>

			<!-- Control Your Business -->
			<div class="border-border bg-card rounded-lg border p-6 text-center shadow-sm">
				<div class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
					</svg>
				</div>
				<h3 class="mb-2 text-lg md:text-xl font-semibold">{$t('home_instructors_control_title')}</h3>
				<p class="text-sm text-muted-foreground mb-3">{$t('home_instructors_control_desc')}</p>
				<ul class="text-left text-xs text-muted-foreground space-y-1">
					<li class="flex items-start gap-2"><span class="text-primary">✓</span><span>{$t('home_instructors_control_rates')}</span></li>
					<li class="flex items-start gap-2"><span class="text-primary">✓</span><span>{$t('home_instructors_control_schedule')}</span></li>
					<li class="flex items-start gap-2"><span class="text-primary">✓</span><span>{$t('home_instructors_control_clients')}</span></li>
				</ul>
			</div>
		</div>

		<!-- How It Works for Instructors -->
		<div class="bg-muted/50 rounded-lg p-6 md:p-8 mb-8">
			<h3 class="text-xl font-bold mb-6 text-center">{$t('home_instructors_how_title')}</h3>
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="bg-primary/10 text-primary mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">1</div>
					<h4 class="font-semibold text-sm mb-1">{$t('home_instructors_step1_title')}</h4>
					<p class="text-xs text-muted-foreground">{$t('home_instructors_step1_desc')}</p>
				</div>
				<div class="text-center">
					<div class="bg-primary/10 text-primary mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">2</div>
					<h4 class="font-semibold text-sm mb-1">{$t('home_instructors_step2_title')}</h4>
					<p class="text-xs text-muted-foreground">{$t('home_instructors_step2_desc')}</p>
				</div>
				<div class="text-center">
					<div class="bg-primary/10 text-primary mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">3</div>
					<h4 class="font-semibold text-sm mb-1">{$t('home_instructors_step3_title')}</h4>
					<p class="text-xs text-muted-foreground">{$t('home_instructors_step3_desc')}</p>
				</div>
				<div class="text-center">
					<div class="bg-primary/10 text-primary mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">4</div>
					<h4 class="font-semibold text-sm mb-1">{$t('home_instructors_step4_title')}</h4>
					<p class="text-xs text-muted-foreground">{$t('home_instructors_step4_desc')}</p>
				</div>
			</div>
		</div>

		<!-- Early Adopter CTA -->
		<div class="bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-6 md:p-8 border-2 border-primary/30">
			<div class="max-w-3xl mx-auto text-center">
				<div class="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-bold text-primary mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
					</svg>
					{$t('home_instructors_early_badge')}
				</div>
				<h3 class="text-xl md:text-2xl font-bold mb-3">{$t('home_instructors_early_title')}</h3>
				<p class="text-sm md:text-base text-muted-foreground mb-6">{$t('home_instructors_early_desc')}</p>
				<div class="flex flex-col sm:flex-row gap-3 justify-center">
					<a href={route('/signup')} class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md">
						{$t('home_instructors_early_cta')}
					</a>
					<a href={route('/how-it-works')} class="border-primary text-primary hover:bg-primary inline-block rounded-md border px-8 py-3 font-semibold transition-all hover:text-white">
						{$t('home_instructors_learn_more')}
					</a>
				</div>
				<p class="mt-4 text-xs text-muted-foreground italic">{$t('home_instructors_early_note')}</p>
			</div>
		</div>
	</div>
</section>

<!-- For Ski Schools Section -->
<section class="grey-section">
	<div class="container max-w-6xl">
		<div class="mb-10 text-center">
			<h2 class="mb-3 text-2xl md:text-3xl font-bold">{$t('home_for_schools_title')}</h2>
			<p class="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
				{$t('home_for_schools_subtitle')}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
			<!-- Left: Why Schools Love LocalSnow -->
			<div class="space-y-6">
				<h3 class="text-xl font-bold mb-4">{$t('home_schools_why_title')}</h3>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 rounded-full bg-primary/10 p-2">
							<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
							</svg>
						</div>
						<div>
							<h4 class="font-semibold text-sm mb-1">{$t('home_schools_benefit1_title')}</h4>
							<p class="text-xs text-muted-foreground">{$t('home_schools_benefit1_desc')}</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 rounded-full bg-primary/10 p-2">
							<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
							</svg>
						</div>
						<div>
							<h4 class="font-semibold text-sm mb-1">{$t('home_schools_benefit2_title')}</h4>
							<p class="text-xs text-muted-foreground">{$t('home_schools_benefit2_desc')}</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 rounded-full bg-primary/10 p-2">
							<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						</div>
						<div>
							<h4 class="font-semibold text-sm mb-1">{$t('home_schools_benefit3_title')}</h4>
							<p class="text-xs text-muted-foreground">{$t('home_schools_benefit3_desc')}</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 rounded-full bg-primary/10 p-2">
							<svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
							</svg>
						</div>
						<div>
							<h4 class="font-semibold text-sm mb-1">{$t('home_schools_benefit4_title')}</h4>
							<p class="text-xs text-muted-foreground">{$t('home_schools_benefit4_desc')}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Use Cases -->
			<div>
				<h3 class="text-xl font-bold mb-4">{$t('home_schools_use_cases_title')}</h3>
				<div class="space-y-4">
					<div class="border-border bg-card rounded-lg border p-4">
						<h4 class="font-semibold text-sm mb-2 flex items-center gap-2">
							<span class="text-primary">📋</span>
							{$t('home_schools_use_case1_title')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('home_schools_use_case1_desc')}</p>
					</div>
					<div class="border-border bg-card rounded-lg border p-4">
						<h4 class="font-semibold text-sm mb-2 flex items-center gap-2">
							<span class="text-primary">👥</span>
							{$t('home_schools_use_case2_title')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('home_schools_use_case2_desc')}</p>
					</div>
					<div class="border-border bg-card rounded-lg border p-4">
						<h4 class="font-semibold text-sm mb-2 flex items-center gap-2">
							<span class="text-primary">🎯</span>
							{$t('home_schools_use_case3_title')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('home_schools_use_case3_desc')}</p>
					</div>
					<div class="border-border bg-card rounded-lg border p-4">
						<h4 class="font-semibold text-sm mb-2 flex items-center gap-2">
							<span class="text-primary">💼</span>
							{$t('home_schools_use_case4_title')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('home_schools_use_case4_desc')}</p>
					</div>
				</div>
			</div>
		</div>

		<div class="text-center">
			<a href={route('/signup')} class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md">
				{$t('home_schools_cta')}
			</a>
			<p class="mt-4 text-xs text-muted-foreground">{$t('home_schools_cta_note')}</p>
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="grey-section">
	<h2 class="mb-8 text-center text-3xl font-bold">{$t('home_how_it_works_title')}</h2>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				1
			</div>
			<h3 class="mb-2 text-xl font-semibold">{$t('home_how_it_works_step1_title')}</h3>
			<p class="text-gray-600">
				{$t('home_how_it_works_step1_desc')}
			</p>
		</div>

		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				2
			</div>
			<h3 class="mb-2 text-xl font-semibold">{$t('home_how_it_works_step2_title')}</h3>
			<p class="text-gray-600">
				{$t('home_how_it_works_step2_desc')}
			</p>
		</div>

		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				3
			</div>
			<h3 class="mb-2 text-xl font-semibold">{$t('home_how_it_works_step3_title')}</h3>
			<p class="text-gray-600">
				{$t('home_how_it_works_step3_desc')}
			</p>
		</div>
	</div>

	<div class="mt-10 text-center">
		<a
			href={route('/how-it-works')}
			class="border-primary text-primary hover:bg-primary inline-block rounded-md border px-6 py-3 font-medium transition-all hover:text-white"
		>
			{$t('home_how_it_works_cta')} →
		</a>
	</div>
</section>

<!-- Value Propositions Section -->
<section class="section">
	<div class="container max-w-6xl">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0 rounded-full bg-primary/10 p-2.5">
					<svg class="h-5 w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_value_prop_1_title')}</h3>
					<p class="text-xs md:text-sm text-muted-foreground leading-relaxed">{$t('home_value_prop_1_desc')}</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0 rounded-full bg-primary/10 p-2.5">
					<svg class="h-5 w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_value_prop_2_title')}</h3>
					<p class="text-xs md:text-sm text-muted-foreground leading-relaxed">{$t('home_value_prop_2_desc')}</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0 rounded-full bg-primary/10 p-2.5">
					<svg class="h-5 w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_value_prop_3_title')}</h3>
					<p class="text-xs md:text-sm text-muted-foreground leading-relaxed">{$t('home_value_prop_3_desc')}</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0 rounded-full bg-primary/10 p-2.5">
					<svg class="h-5 w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
					</svg>
				</div>
				<div>
					<h3 class="font-semibold text-sm md:text-base mb-1">{$t('home_value_prop_4_title')}</h3>
					<p class="text-xs md:text-sm text-muted-foreground leading-relaxed">{$t('home_value_prop_4_desc')}</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Why We're Free Section -->
<section class="section rounded-lg py-16">
	<div class="container max-w-4xl">
		<div class="mb-10 text-center">
			<h2 class="mb-4 text-3xl font-bold text-gray-900">{$t('home_why_free_title')}</h2>
			<p class="text-xl text-gray-600">
				{$t('home_why_free_subtitle')}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
			<div class="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
				<div class="flex items-start gap-4">
					<div class="flex-shrink-0 rounded-full bg-red-100 p-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
							<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
						</svg>
					</div>
					<div>
						<h3 class="mb-2 text-lg font-bold text-gray-900 ">
							{$t('home_why_free_problem_title')}
						</h3>
						<p class="text-sm leading-relaxed text-gray-600 ">
							{$t('home_why_free_problem_desc_v2')}
						</p>
					</div>
				</div>
			</div>

			<div class="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
				<div class="flex items-start gap-4">
					<div class="flex-shrink-0 rounded-full bg-green-100 p-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</div>
					<div>
						<h3 class="mb-2 text-lg font-bold text-gray-900">
							{$t('home_why_free_solution_title')}
						</h3>
						<p class="text-sm leading-relaxed text-gray-600">
							{$t('home_why_free_solution_desc_v2')}
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="rounded-lg border-2 border-green-500 bg-white p-6 text-center shadow-sm">
			<h3 class="mb-3 text-lg font-bold text-gray-900">
				{$t('home_why_free_commitment_title')}
			</h3>
			<p class="mb-3 text-sm text-gray-700 leading-relaxed">
				{$t('home_why_free_commitment_desc')}
			</p>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				{$t('home_why_free_commitment_cta')}
			</p>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="section">
	<div class="container max-w-4xl">
		<h2 class="mb-2 text-center text-2xl md:text-3xl font-bold">{$t('home_faq_title')}</h2>
		<p class="mb-8 text-center text-sm md:text-base text-muted-foreground">{$t('home_faq_subtitle')}</p>

		<div class="space-y-3">
			{#each [
				{ q: $t('home_faq_q1'), a: $t('home_faq_a1') },
				{ q: $t('home_faq_q2'), a: $t('home_faq_a2') },
				{ q: $t('home_faq_q3'), a: $t('home_faq_a3') },
				{ q: $t('home_faq_q4'), a: $t('home_faq_a4') },
				{ q: $t('home_faq_q5'), a: $t('home_faq_a5') },
				{ q: $t('home_faq_q6'), a: $t('home_faq_a6') },
				{ q: $t('home_faq_q7'), a: $t('home_faq_a7') },
				{ q: $t('home_faq_q8'), a: $t('home_faq_a8') },
				{ q: $t('home_faq_q9'), a: $t('home_faq_a9') },
				{ q: $t('home_faq_q10'), a: $t('home_faq_a10') },
				{ q: $t('home_faq_q11'), a: $t('home_faq_a11') },
				{ q: $t('home_faq_q12'), a: $t('home_faq_a12') }
			] as item}
				<details class="group border-border bg-card rounded-lg border overflow-hidden">
					<summary class="flex cursor-pointer items-center justify-between px-4 md:px-6 py-4 font-semibold text-sm md:text-base hover:bg-muted/50 transition-colors">
						<span>{item.q}</span>
						<svg class="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
						</svg>
					</summary>
					<div class="px-4 md:px-6 pb-4 text-sm md:text-base text-muted-foreground leading-relaxed">
						<p>{item.a}</p>
					</div>
				</details>
			{/each}
		</div>
	</div>
</section>

<!-- Instructor Benefits Section -->
<section class="grey-section">
	<div class="mb-10 text-center">
		<h2 class="mb-4 text-center text-3xl font-bold">{$t('home_instructors_title')}</h2>
		<p class="text-center text-gray-600">
			{$t('home_instructors_subtitle')}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="border-border bg-card rounded-lg border p-6 text-center shadow-sm">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-xl font-semibold">{$t('home_instructors_keep_fees_title')}</h3>
			<p class="text-gray-600">
				{$t('home_instructors_keep_fees_desc')}
			</p>
		</div>

		<div class="border-border bg-card rounded-lg border p-6 text-center shadow-sm">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-xl font-semibold">{$t('home_instructors_pay_leads_title')}</h3>
			<p class="text-gray-600">
				{$t('home_instructors_pay_leads_desc')}
			</p>
		</div>

		<div class="border-border bg-card rounded-lg border p-6 text-center shadow-sm">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-xl font-semibold">{$t('home_instructors_online_title')}</h3>
			<p class="text-gray-600">
				{$t('home_instructors_online_desc')}
			</p>
		</div>
	</div>

	<div class="mt-10 text-center">
		<a
			href={route('/signup')}
			class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md"
		>
			{$t('home_instructors_cta')}
		</a>
		<p class="mt-4 text-sm text-gray-600">
			{$t('home_instructors_cta_note')}
		</p>
	</div>
</section>

<!-- Bottom CTA Section -->
<section class="grey-section text-center">
	<h2 class="mb-6 text-3xl font-bold">{$t('home_cta_title')}</h2>
	<p class="mb-8 text-gray-600">
		{$t('home_cta_subtitle')}
	</p>
	<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
		<a
			href={route('/instructors')}
			class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md"
		>
			{$t('home_cta_find_instructor')}
		</a>
		<a
			href={route('/signup')}
			class="border-border bg-card inline-block rounded-md border px-8 py-3 font-semibold shadow-sm transition-all hover:shadow-md"
		>
			{$t('home_cta_list_instructor')}
		</a>
	</div>
</section>

<style>
	.text-shadow {
		text-shadow: 0 1px 5px rgba(0, 0, 0, 0.572);
	}

	.overlay::before {
		content: var(--tw-content);
		position: absolute;
		inset: 0px;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.32) 0%, transparent 100%);
	}
</style>
