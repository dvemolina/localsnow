<script lang="ts">
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import { heroResortSearchSchema } from '$src/features/Resorts/lib/resortSchemas';
	import SportSelect from '$src/features/Resorts/components/SportSelect.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { route } from '$lib/i18n/routeHelpers';

	let { data } = $props();

	// Get current locale for form submission
	const currentLocale = $derived(getLocale());

	// Top Spanish resorts for homepage - use $derived for translation reactivity
	const topResorts = $derived([
		{
			name: 'Baqueira Beret',
			slug: 'baqueira-beret',
			region: 'Pyrenees, Catalonia',
			description: m.home_resort_descriptions_baqueira(),
			image: '/ski-instructor-powder.webp'
		},
		{
			name: 'Formigal-Panticosa',
			slug: 'formigal-panticosa',
			region: 'Pyrenees, Aragón',
			description: m.home_resort_descriptions_formigal(),
			image: '/ski-instructor-turn.webp'
		},
		{
			name: 'Cerler',
			slug: 'cerler',
			region: 'Pyrenees, Huesca',
			description: m.home_resort_descriptions_cerler(),
			image: '/zermatt.webp'
		},
		{
			name: 'Sierra Nevada',
			slug: 'sierra-nevada',
			region: 'Granada, Andalusia',
			description: m.home_resort_descriptions_sierra_nevada(),
			image: '/catedral.webp'
		}
	]);

	// Schema markup for SEO
	const websiteSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Local Snow',
		description:
			'Find ski and snowboard instructors at Spanish resorts. Direct contact, no booking fees.',
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
			'Platform connecting ski and snowboard instructors with clients at Spanish resorts. No booking fees, direct contact with certified instructors.',
		email: 'support@localsnow.org',
		areaServed: {
			'@type': 'Country',
			name: 'Spain'
		},
		serviceType: 'Ski Instructor Marketplace',
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
	<title>{m.seo_meta_home_title()}</title>
	<meta
		name="description"
		content={m.seo_meta_home_description()}
	/>

	<!-- Open Graph -->
	<meta property="og:title" content={m.seo_meta_home_title()} />
	<meta property="og:description" content={m.seo_meta_home_description()} />
	<meta property="og:url" content="https://localsnow.org/" />
	<meta property="og:image" content="https://localsnow.org/ski-instructor-powder.webp" />
	<meta property="og:image:alt" content="Ski instructor teaching in powder snow" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card -->
	<meta name="twitter:title" content={m.seo_meta_home_title()} />
	<meta name="twitter:description" content={m.seo_meta_home_description()} />
	<meta name="twitter:image" content="https://localsnow.org/ski-instructor-powder.webp" />

	<script type="application/ld+json">
      {JSON.stringify(websiteSchema)}
	</script>
	<script type="application/ld+json">
      {JSON.stringify(organizationSchema)}
	</script>
	<link rel="canonical" href="https://localsnow.org/" />
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
				{m.home_hero_title()}
			</h1>
			<div class="flex align-bottom h-full flex-col justify-center">
				<p class="text-shadow mb-6 max-w-[600px] text-lg text-white sm:text-xl md:text-2xl">
					{m.home_hero_subtitle()}
				</p>

				<!-- Search form -->
				<form method="POST" use:enhance class="rounded-lg bg-white/90 p-4 shadow-lg">
					<input type="hidden" name="locale" value={currentLocale} />
					<div class="flex flex-col gap-4 md:flex-row">
						<div class="flex-1">
							<SearchResort {form} name="resort" id="location" countryId={data.spainCountryId} />
						</div>
						<div class="text-foreground flex-1">
							<SportSelect {form} name="sport" isHero={true} />
						</div>
						<div class="flex items-center pt-4">
							<button
								type="submit"
								class="bg-primary h-12 w-full rounded-md p-3 font-medium whitespace-nowrap text-white md:w-auto"
							>
								{m.home_hero_cta()}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

<!-- Beta Launch Banner -->
<section class="bg-green-50 border-2 border-green-500 py-8 mt-12 rounded-md">
	<div class="container">
		<div class="mx-auto max-w-3xl text-center">
			<div class="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-900 ">
				<span class="relative flex h-3 w-3">
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75"></span>
					<span class="relative inline-flex h-3 w-3 rounded-full bg-green-600"></span>
				</span>
				{m.beta_launch_badge()}
			</div>

			<h2 class="mb-3 text-2xl font-bold text-green-900 md:text-3xl ">
				{m.beta_launch_title()}
			</h2>

			<p class="mb-4 text-lg text-green-800 ">
				{m.beta_launch_description()}
			</p>

			<div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
				<div class="flex items-center gap-2 rounded-lg bg-white border-2 border-green-200 px-4 py-3 ">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
					<span class="text-sm text-green-900 ">{m.beta_launch_valid_until()}</span>
				</div>
				<div class="flex items-center gap-2 rounded-lg bg-white border-2 border-green-200 px-4 py-3 ">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 dark:text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
					<span class="text-sm text-green-900 ">{m.beta_launch_no_fees()}</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Top Resorts Section -->
<section class="section">
	<h2 class="mb-2 text-center text-3xl font-bold">{m.home_resorts_title()}</h2>
	<p class="mb-8 text-center text-gray-600">{m.home_resorts_subtitle()}</p>

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
						{m.home_resorts_view_instructors()} →
					</span>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-8 text-center">
		<a href={route('/resorts')} class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white">
			{m.home_resorts_view_all()}
		</a>
	</div>
</section>

<!-- How It Works Section -->
<section class="grey-section">
	<h2 class="mb-8 text-center text-3xl font-bold">{m.home_how_it_works_title()}</h2>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				1
			</div>
			<h3 class="mb-2 text-xl font-semibold">{m.home_how_it_works_step1_title()}</h3>
			<p class="text-gray-600">
				{m.home_how_it_works_step1_desc()}
			</p>
		</div>

		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				2
			</div>
			<h3 class="mb-2 text-xl font-semibold">{m.home_how_it_works_step2_title()}</h3>
			<p class="text-gray-600">
				{m.home_how_it_works_step2_desc()}
			</p>
		</div>

		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				3
			</div>
			<h3 class="mb-2 text-xl font-semibold">{m.home_how_it_works_step3_title()}</h3>
			<p class="text-gray-600">
				{m.home_how_it_works_step3_desc()}
			</p>
		</div>
	</div>

	<div class="mt-10 text-center">
		<a
			href={route('/how-it-works')}
			class="inline-block rounded-md border border-primary px-6 py-3 font-medium text-primary transition-all hover:bg-primary hover:text-white"
		>
			{m.home_how_it_works_cta()} →
		</a>
	</div>
</section>

<!-- Trust Signals Section -->
<section class="section">
	<div class="mb-10 text-center">
		<h2 class="mb-4 text-center text-3xl font-bold">{m.home_trust_title()}</h2>
		<p class="text-center text-gray-600">
			{m.home_trust_subtitle()}
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
			<h3 class="mb-2 text-xl font-semibold">{m.home_trust_free_title()}</h3>
			<p class="text-gray-600">
				{m.home_trust_free_desc()}
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
						d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-xl font-semibold">{m.home_trust_verified_title()}</h3>
			<p class="text-gray-600">
				{m.home_trust_verified_desc()}
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
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 text-xl font-semibold">{m.home_trust_built_title()}</h3>
			<p class="text-gray-600">
				{m.home_trust_built_desc()}
			</p>
		</div>
	</div>
</section>

<!-- Instructor Benefits Section -->
<section class="grey-section">
	<div class="mb-10 text-center">
		<h2 class="mb-4 text-center text-3xl font-bold">{m.home_instructors_title()}</h2>
		<p class="text-center text-gray-600">
			{m.home_instructors_subtitle()}
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
			<h3 class="mb-2 text-xl font-semibold">{m.home_instructors_keep_fees_title()}</h3>
			<p class="text-gray-600">
				{m.home_instructors_keep_fees_desc()}
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
			<h3 class="mb-2 text-xl font-semibold">{m.home_instructors_pay_leads_title()}</h3>
			<p class="text-gray-600">
				{m.home_instructors_pay_leads_desc()}
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
			<h3 class="mb-2 text-xl font-semibold">{m.home_instructors_online_title()}</h3>
			<p class="text-gray-600">
				{m.home_instructors_online_desc()}
			</p>
		</div>
	</div>

	<div class="mt-10 text-center">
		<a
			href={route('/signup')}
			class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md"
		>
			{m.home_instructors_cta()}
		</a>
		<p class="mt-4 text-sm text-gray-600">
			{m.home_instructors_cta_note()}
		</p>
	</div>
</section>

<!-- Social Proof Section -->
<section class="section">
	<div class="mb-10 text-center">
		<h2 class="mb-4 text-center text-3xl font-bold">{m.home_testimonials_title()}</h2>
		<p class="text-center text-gray-600">
			{m.home_testimonials_subtitle()}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
			<div class="mb-4 flex items-center gap-1">
				{#each [1, 2, 3, 4, 5] as star}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-primary h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
						/>
					</svg>
				{/each}
			</div>
			<p class="mb-4 text-gray-700">
				"{m.home_testimonials_maria_text()}"
			</p>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
					<span class="text-primary font-semibold">MC</span>
				</div>
				<div>
					<p class="font-semibold">{m.home_testimonials_maria_name()}</p>
					<p class="text-sm text-muted-foreground">{m.home_testimonials_maria_role()}</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
			<div class="mb-4 flex items-center gap-1">
				{#each [1, 2, 3, 4, 5] as star}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-primary h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
						/>
					</svg>
				{/each}
			</div>
			<p class="mb-4 text-gray-700">
				"{m.home_testimonials_james_text()}"
			</p>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
					<span class="text-primary font-semibold">JM</span>
				</div>
				<div>
					<p class="font-semibold">{m.home_testimonials_james_name()}</p>
					<p class="text-sm text-muted-foreground">{m.home_testimonials_james_role()}</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
			<div class="mb-4 flex items-center gap-1">
				{#each [1, 2, 3, 4, 5] as star}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-primary h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
						/>
					</svg>
				{/each}
			</div>
			<p class="mb-4 text-gray-700">
				"{m.home_testimonials_pablo_text()}"
			</p>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
					<span class="text-primary font-semibold">PG</span>
				</div>
				<div>
					<p class="font-semibold">{m.home_testimonials_pablo_name()}</p>
					<p class="text-sm text-muted-foreground">{m.home_testimonials_pablo_role()}</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Bottom CTA Section -->
<section class="grey-section text-center">
	<h2 class="mb-6 text-3xl font-bold">{m.home_cta_title()}</h2>
	<p class="mb-8 text-gray-600">
		{m.home_cta_subtitle()}
	</p>
	<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
		<a
			href={route('/instructors')}
			class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md"
		>
			{m.home_cta_find_instructor()}
		</a>
		<a
			href={route('/signup')}
			class="inline-block rounded-md border border-border bg-card px-8 py-3 font-semibold shadow-sm transition-all hover:shadow-md"
		>
			{m.home_cta_list_instructor()}
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
