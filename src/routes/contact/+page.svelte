<script lang="ts">
	import { t } from '$lib/i18n/i18n';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
	import { page } from '$app/state';
	import { extractLocale, type Locale } from '$lib/i18n/routes';
	const contactEmail = 'admin@localsnow.org';
	const PRIMARY_ORIGIN = 'https://localsnow.org';
	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const signupPath = $derived(route('/signup', currentLocale));
	const instructorsPath = $derived(route('/instructors', currentLocale));
	const howItWorksPath = $derived(route('/how-it-works', currentLocale));
	const resortsBase = $derived(route('/resorts', currentLocale));
	const spainResortsPath = $derived(`${resortsBase}/spain`);
	const canonicalPath = $derived(route('/contact', currentLocale));
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(
		getAlternateUrls(canonicalPath).map((alt) => ({
			locale: alt.locale,
			url: `${PRIMARY_ORIGIN}${alt.url}`
		}))
	);
	const defaultAlternate = $derived(alternates.find((alt) => alt.locale === 'en'));

	// Schema markup for SEO
	const contactPageSchema = {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		mainEntity: {
			'@type': 'Organization',
			name: 'Local Snow',
			email: contactEmail,
			url: 'https://localsnow.org',
			description:
				'Spain-first directory connecting ski and snowboard instructors and schools with clients',
			areaServed: {
				'@type': 'Place',
				name: 'Spain'
			}
		}
	};
</script>

<svelte:head>
	<title>{$t('seo_meta_contact_title')}</title>
	<meta name="description" content={$t('seo_meta_contact_description')} />

	<!-- Open Graph -->
	<meta property="og:title" content={$t('seo_meta_contact_title')} />
	<meta property="og:description" content={$t('seo_meta_contact_description')} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />

	<!-- Twitter Card -->
	<meta name="twitter:title" content={$t('seo_meta_contact_title')} />
	<meta name="twitter:description" content={$t('seo_meta_contact_description')} />
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(contactPageSchema)}<\/script>`}

	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	{#if defaultAlternate}
		<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
	{/if}
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl">
	<h1 class="title2">{$t('contact_page_title')}</h1>
	<p class="text-muted-foreground text-lg">
		{$t('contact_page_subtitle')}
	</p>

	<!-- General Inquiries Section -->
	<section class="border-border bg-card my-8 rounded-lg border p-6 shadow-sm">
		<h2 class="title3 mb-3">{$t('contact_page_general_title')}</h2>
		<p class="text-muted-foreground mb-4">{$t('contact_page_general_desc')}</p>
		<div class="flex items-center gap-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="text-primary size-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
			<div>
				<p class="text-muted-foreground text-sm font-medium">{$t('contact_page_email_label')}</p>
				<a href="mailto:{contactEmail}" class="text-primary hover:underline">
					{contactEmail}
				</a>
			</div>
		</div>
	</section>

	<!-- For Instructors Section -->
	<section class="border-border bg-card my-8 rounded-lg border p-6 shadow-sm">
		<h2 class="title3 mb-3">{$t('contact_page_instructors_title')}</h2>
		<p class="text-muted-foreground mb-4">
			{$t('contact_page_instructors_desc')}
		</p>

		<div class="mb-6">
			<h3 class="title4 mb-3">{$t('contact_page_instructors_benefits')}</h3>
			<ul class="space-y-2.5">
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-primary mt-0.5 size-5 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span class="text-muted-foreground text-sm">{$t('contact_page_benefit_1')}</span>
				</li>
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-primary mt-0.5 size-5 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span class="text-muted-foreground text-sm">{$t('contact_page_benefit_2')}</span>
				</li>
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-primary mt-0.5 size-5 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span class="text-muted-foreground text-sm">{$t('contact_page_benefit_3')}</span>
				</li>
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-primary mt-0.5 size-5 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span class="text-muted-foreground text-sm">{$t('contact_page_benefit_4')}</span>
				</li>
			</ul>
		</div>

		<a
			href={signupPath}
			class="bg-primary hover:bg-primary/90 inline-block rounded-md px-6 py-3 font-medium text-white"
		>
			{$t('contact_page_join_button')}
		</a>
	</section>

	<!-- For Clients Section -->
	<section class="border-border bg-card my-8 rounded-lg border p-6 shadow-sm">
		<h2 class="title3 mb-3">{$t('contact_page_clients_title')}</h2>
		<p class="text-muted-foreground mb-4">
			{$t('contact_page_clients_desc')}
		</p>
		<a
			href={instructorsPath}
			class="border-border bg-card hover:bg-muted inline-block rounded-md border px-6 py-3 font-medium"
		>
			{$t('contact_page_find_button')}
		</a>
		<a
			href={spainResortsPath}
			class="border-border bg-card hover:bg-muted mt-3 ml-0 inline-block rounded-md border px-6 py-3 font-medium sm:mt-0 sm:ml-3"
		>
			{$t('instructors_page_prompt_browse_spain')}
		</a>
	</section>

	<!-- Support Section -->
	<section class="border-border bg-card my-8 rounded-lg border p-6 shadow-sm">
		<h2 class="title3 mb-3">{$t('contact_page_support_title')}</h2>
		<p class="text-muted-foreground">
			{@html $t('contact_page_support_desc', {
				values: {
					email: `<a href="mailto:${contactEmail}" class="text-primary hover:underline">${contactEmail}</a>`
				}
			})}
		</p>
	</section>

	<!-- FAQ Section -->
	<section class="border-border bg-card my-8 rounded-lg border p-6 shadow-sm">
		<h2 class="title3 mb-3">{$t('contact_page_faq_title')}</h2>
		<p class="text-muted-foreground mb-4">
			{$t('contact_page_faq_cta')}
		</p>
		<a
			href={howItWorksPath}
			class="border-border bg-card hover:bg-muted inline-block rounded-md border px-6 py-3 font-medium"
		>
			{$t('contact_page_how_it_works_button')}
		</a>
	</section>
</article>
