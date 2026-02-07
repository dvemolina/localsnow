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
	const alternates = $derived(getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	})));
	const defaultAlternate = $derived(alternates.find((alt) => alt.locale === 'en'));

	// Top resorts for homepage - use $derived for translation reactivity
	// Showcasing global coverage across continents
	const topResorts = $derived([
		{
			name: 'Baqueira-Beret',
			slug: 'baqueira-beret',
			region: 'Pyrenees, Spain',
			description: $t('home_resort_descriptions_baqueira'),
			image: 'https://assets.localsnow.org/resorts/baqueira-beret'
		},
		{
			name: 'Verbier',
			slug: 'verbier',
			region: 'Alps, Switzerland',
			description: $t('home_resort_descriptions_verbier'),
			image: 'https://assets.localsnow.org/resorts/verbier'
		},
		{
			name: 'Cerro Catedral',
			slug: 'cerro-catedral',
			region: 'Patagonia, Argentina',
			description: $t('home_resort_descriptions_cerro_catedral'),
			image: 'https://assets.localsnow.org/resorts/cerro-catedral'
		},
		{
			name: 'Niseko',
			slug: 'niseko-moiwa-ski-resort',
			region: 'Hokkaido, Japan',
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
		logo: 'https://localsnow.org/local-snow-head.png',
		description:
			'Curated directory of ski and snowboard instructors worldwide. Browse profiles by resort, specialty, and language. Send lesson requests and connect directly. Zero platform fees, community-driven, built for local discovery.',
		email: 'admin@localsnow.org',
		serviceType: 'Ski Instructor Directory',
		foundingDate: '2024',
		sameAs: []
	};

	// Hero Resort Search Form
	const form = superForm(data.form, {
		validators: zodClient(heroResortSearchSchema)
	});

	const { form: formData, enhance } = form;
</script>

<svelte:head>
	<title>{$t('seo_meta_home_title')}</title>
	<meta
		name="description"
		content={$t('seo_meta_home_description')}
	/>

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
				{$t('home_hero_title')}
			</h1>
			<div class="flex align-bottom h-full flex-col justify-center">
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
<section class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 px-5 py-10 mt-12 rounded-md shadow-sm">
	<div class="container">
		<div class="mx-auto max-w-4xl text-center">
			<div class="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-900">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
				{$t('home_free_banner_badge')}
			</div>

			<h2 class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
				{$t('home_free_banner_title')}
			</h2>

			<p class="mb-6 text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
				{$t('home_free_banner_description')}
			</p>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 p-4">
				<div class="flex flex-col items-center gap-2 rounded-lg bg-white border-2 border-green-200 px-4 py-4 shadow-sm">
					<div class="text-center">
						<div class="text-2xl font-bold text-green-900">{$t('home_free_banner_booking_fees')}</div>
						<div class="text-sm text-gray-600">{$t('home_free_banner_booking_fees_label')}</div>
					</div>
				</div>

				<div class="flex flex-col items-center gap-2 rounded-lg bg-white border-2 border-green-200 px-4 py-4 shadow-sm">
					<div class="text-center">
						<div class="text-2xl font-bold text-green-900">{$t('home_free_banner_commission')}</div>
						<div class="text-sm text-gray-600">{$t('home_free_banner_commission_label')}</div>
					</div>
				</div>

				<div class="flex flex-col items-center gap-2 rounded-lg bg-white border-2 border-green-200 px-4 py-4 shadow-sm">
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
				href={route(`/instructors?resort=${resort.slug}`)}
				class="resort-card group relative overflow-hidden rounded-lg border border-border shadow-lg transition-all hover:shadow-xl"
			>
				<!-- Background Image -->
				<div class="absolute inset-0">
					<img
						src={resort.image}
						alt={resort.name}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
					/>
					<!-- Gradient Overlay for better text readability -->
					<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/15"></div>
				</div>

				<!-- Content -->
				<div class="relative flex h-full min-h-[280px] flex-col justify-end p-6 text-white">
					<h3 class="mb-2 text-xl font-bold drop-shadow-lg">{resort.name}</h3>
					<p class="mb-1 text-sm text-white/95 drop-shadow-md">{resort.region}</p>
					<p class="mb-4 text-sm text-white/85 drop-shadow-md">{resort.description}</p>
					<span class="inline-flex items-center font-semibold text-white transition-transform group-hover:translate-x-1">
						{$t('home_resorts_view_instructors')} →
					</span>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-8 text-center">
		<a href={route('/resorts')} class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white">
			{$t('home_resorts_view_all')}
		</a>
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
			class="inline-block rounded-md border border-primary px-6 py-3 font-medium text-primary transition-all hover:bg-primary hover:text-white"
		>
			{$t('home_how_it_works_cta')} →
		</a>
	</div>
</section>

<!-- Why We're Free Section -->
<section class="section  py-16 rounded-lg">
	<div class="container max-w-4xl">
		<div class="text-center mb-10">
			<h2 class="mb-4 text-3xl font-bold text-gray-900">{$t('home_why_free_title')}</h2>
			<p class="text-xl text-gray-600">
				{$t('home_why_free_subtitle')}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<div class="flex items-start gap-4">
					<div class="bg-red-100 rounded-full p-3 flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
					</div>
					<div>
						<h3 class="font-bold text-lg mb-2 text-gray-900">{$t('home_why_free_problem_title')}</h3>
						<p class="text-gray-600 text-sm leading-relaxed">
							{$t('home_why_free_problem_desc')}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<div class="flex items-start gap-4">
					<div class="bg-green-100 rounded-full p-3 flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
					</div>
					<div>
						<h3 class="font-bold text-lg mb-2 text-gray-900">{$t('home_why_free_solution_title')}</h3>
						<p class="text-gray-600 text-sm leading-relaxed">
							{$t('home_why_free_solution_desc')}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<div class="flex items-start gap-4">
					<div class="bg-blue-100 rounded-full p-3 flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
					</div>
					<div>
						<h3 class="font-bold text-lg mb-2 text-gray-900">{$t('home_why_free_community_title')}</h3>
						<p class="text-gray-600 text-sm leading-relaxed">
							{$t('home_why_free_community_desc')}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<div class="flex items-start gap-4">
					<div class="bg-purple-100 rounded-full p-3 flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
					</div>
					<div>
						<h3 class="font-bold text-lg mb-2 text-gray-900">{$t('home_why_free_forever_title')}</h3>
						<p class="text-gray-600 text-sm leading-relaxed">
							{$t('home_why_free_forever_desc')}
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-10 text-center bg-white rounded-lg p-6 border-2 border-green-500 shadow-sm">
			<p class="text-gray-700 text-lg mb-2">
				<strong>{$t('home_why_free_sound_good_title')}</strong>
			</p>
			<p class="text-gray-600">
				{$t('home_why_free_sound_good_desc')}
			</p>
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
		<div class="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
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

		<div class="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
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

		<div class="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
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
			class="inline-block rounded-md border border-border bg-card px-8 py-3 font-semibold shadow-sm transition-all hover:shadow-md"
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
