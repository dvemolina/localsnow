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
	import { getHomepageTrustPaths } from '$src/features/ClientProof/lib/clientProofPath';
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
	const homepageTrustPaths = getHomepageTrustPaths();

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
	const websiteSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Local Snow',
		description: $t('home_schema_website_description'),
		url: 'https://localsnow.org',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://localsnow.org/instructors?q={search_term_string}',
			'query-input': 'required name=search_term_string'
		}
	});

	const organizationSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Local Snow',
		url: 'https://localsnow.org',
		logo: 'https://localsnow.org/localsnow-logo-v-black.png',
		description: $t('home_schema_organization_description'),
		email: 'admin@localsnow.org',
		serviceType: 'Ski Instructor Directory',
		foundingDate: '2024',
		sameAs: []
	});

	// FAQ Schema for SEO
	const faqSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: $t('home_faq_q1'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a1') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q2'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a2') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q3'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a3') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q4'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a4') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q5'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a5') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q6'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a6') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q7'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a7') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q8'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a8') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q9'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a9') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q10'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a10') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q11'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a11') }
			},
			{
				'@type': 'Question',
				name: $t('home_faq_q12'),
				acceptedAnswer: { '@type': 'Answer', text: $t('home_faq_a12') }
			}
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
				<div
					class="mb-1 flex flex-wrap items-center justify-start gap-3 p-0 text-xs text-white/90 md:gap-4 md:text-sm"
				>
					<div class="flex items-center gap-1.5">
						<svg
							class="h-4 w-4 md:h-5 md:w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.8"
						>
							<circle cx="12" cy="12" r="9" />
							<path d="M3 12h18" />
							<path d="M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9" />
							<path d="M12 3c-2.5 2.4-4 5.6-4 9s1.5 6.6 4 9" />
						</svg>
						<span>{$t('home_trust_metric_global')}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<svg class="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
							/>
						</svg>
						<span>{$t('home_trust_metric_resorts')}</span>
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

<!-- Free vs Protected Trust Paths -->
<section class="section">
	<div class="container max-w-5xl">
		<div class="mb-8 text-center">
			<p class="text-primary mb-2 text-sm font-semibold tracking-wide uppercase">
				{$t(homepageTrustPaths.eyebrowKey)}
			</p>
			<h2 class="mb-3 text-3xl font-bold text-gray-900">{$t(homepageTrustPaths.headlineKey)}</h2>
			<p class="text-muted-foreground mx-auto max-w-3xl text-base md:text-lg">
				{$t(homepageTrustPaths.subtitleKey)}
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			{#each homepageTrustPaths.paths as path}
				<div class="bg-card rounded-xl border p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between gap-3">
						<h3 class="text-xl font-semibold">{$t(path.labelKey)}</h3>
						<span
							class={path.kind === 'direct'
								? 'rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800'
								: 'bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold'}
						>
							{$t(path.badgeKey)}
						</span>
					</div>
					<p class="text-muted-foreground text-sm leading-relaxed">{$t(path.copyKey)}</p>
					<p class="bg-muted text-foreground mt-4 rounded-lg p-3 text-sm font-medium">
						{$t(path.clientPromiseKey)}
					</p>
				</div>
			{/each}
		</div>

		<p class="text-muted-foreground mx-auto mt-5 max-w-3xl text-center text-sm">
			{$t(homepageTrustPaths.operatorTruthKey)}
		</p>
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
		<h2 class="mb-2 text-center text-2xl font-bold md:text-3xl">{$t('home_regions_title')}</h2>
		<p class="text-muted-foreground mb-8 text-center text-sm md:text-base">
			{$t('home_regions_subtitle')}
		</p>

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
			<a
				href="{resortsBase}/spain"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇪🇸</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_spain')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
			<a
				href="{resortsBase}/switzerland"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇨🇭</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_switzerland')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
			<a
				href="{resortsBase}/france"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇫🇷</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_france')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
			<a
				href="{resortsBase}/austria"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇦🇹</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_austria')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
			<a
				href="{resortsBase}/italy"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇮🇹</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_italy')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
			<a
				href="{resortsBase}/canada"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇨🇦</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_canada')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
			<a
				href="{resortsBase}/usa"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇺🇸</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_usa')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
			<a
				href="{resortsBase}/japan"
				class="group border-border bg-card rounded-lg border p-4 text-center transition-shadow hover:shadow-md"
			>
				<div class="mb-2 text-3xl md:text-4xl">🇯🇵</div>
				<h3 class="mb-1 text-sm font-semibold md:text-base">{$t('home_region_japan')}</h3>
				<p class="text-muted-foreground text-xs">{$t('home_region_description')}</p>
			</a>
		</div>

		<div class="mt-8 text-center">
			<a
				href={resortsBase}
				class="border-primary text-primary hover:bg-primary inline-block rounded-md border px-6 py-3 text-sm font-medium transition-all hover:text-white md:text-base"
			>
				{$t('home_regions_view_all')} →
			</a>
		</div>
	</div>
</section>

<!-- Supply CTA Section -->
<section class="section">
	<div class="container max-w-5xl">
		<div class="mb-8 text-center">
			<h2 class="mb-3 text-2xl font-bold md:text-3xl">{$t('home_supply_title')}</h2>
			<p class="text-muted-foreground mx-auto max-w-2xl text-sm md:text-base">
				{$t('home_supply_subtitle')}
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="bg-card rounded-xl border p-6 shadow-sm">
				<p class="text-primary mb-2 text-xs font-semibold tracking-wide uppercase">
					{$t('home_supply_instructor_label')}
				</p>
				<h3 class="mb-2 text-xl font-semibold">{$t('home_supply_instructor_title')}</h3>
				<p class="text-muted-foreground mb-5 text-sm leading-relaxed">
					{$t('home_supply_instructor_copy')}
				</p>
				<a
					href={route('/signup')}
					class="bg-primary inline-flex rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
				>
					{$t('home_supply_instructor_cta')}
				</a>
			</div>

			<div class="bg-card rounded-xl border p-6 shadow-sm">
				<p class="text-primary mb-2 text-xs font-semibold tracking-wide uppercase">
					{$t('home_supply_school_label')}
				</p>
				<h3 class="mb-2 text-xl font-semibold">{$t('home_supply_school_title')}</h3>
				<p class="text-muted-foreground mb-5 text-sm leading-relaxed">
					{$t('home_supply_school_copy')}
				</p>
				<a
					href={route('/schools')}
					class="border-primary text-primary hover:bg-primary inline-flex rounded-md border px-5 py-2.5 text-sm font-semibold transition-all hover:text-white"
				>
					{$t('home_supply_school_cta')}
				</a>
			</div>
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

<!-- FAQ Section -->
<section class="section">
	<div class="container max-w-4xl">
		<h2 class="mb-2 text-center text-2xl font-bold md:text-3xl">{$t('home_faq_title')}</h2>
		<p class="text-muted-foreground mb-8 text-center text-sm md:text-base">
			{$t('home_faq_subtitle')}
		</p>

		<div class="space-y-3">
			{#each [{ q: $t('home_faq_q1'), a: $t('home_faq_a1') }, { q: $t('home_faq_q2'), a: $t('home_faq_a2') }, { q: $t('home_faq_q3'), a: $t('home_faq_a3') }, { q: $t('home_faq_q4'), a: $t('home_faq_a4') }, { q: $t('home_faq_q5'), a: $t('home_faq_a5') }, { q: $t('home_faq_q6'), a: $t('home_faq_a6') }, { q: $t('home_faq_q7'), a: $t('home_faq_a7') }, { q: $t('home_faq_q8'), a: $t('home_faq_a8') }, { q: $t('home_faq_q9'), a: $t('home_faq_a9') }, { q: $t('home_faq_q10'), a: $t('home_faq_a10') }, { q: $t('home_faq_q11'), a: $t('home_faq_a11') }, { q: $t('home_faq_q12'), a: $t('home_faq_a12') }] as item}
				<details class="group border-border bg-card overflow-hidden rounded-lg border">
					<summary
						class="hover:bg-muted/50 flex cursor-pointer items-center justify-between px-4 py-4 text-sm font-semibold transition-colors md:px-6 md:text-base"
					>
						<span>{item.q}</span>
						<svg
							class="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>
					<div class="text-muted-foreground px-4 pb-4 text-sm leading-relaxed md:px-6 md:text-base">
						<p>{item.a}</p>
					</div>
				</details>
			{/each}
		</div>
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
