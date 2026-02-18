<script lang="ts">
	import { t } from '$lib/i18n/i18n';
	import { page } from '$app/state';
	import { extractLocale, type Locale } from '$lib/i18n/routes';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';

	const PRIMARY_ORIGIN = 'https://localsnow.org';
	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const instructorsPath = $derived(route('/instructors', currentLocale));
	const signupPath = $derived(route('/signup', currentLocale));
	const resortsBase = $derived(route('/resorts', currentLocale));
	const spainResortsPath = $derived(`${resortsBase}/spain`);
	const canonicalPath = $derived(route('/about', currentLocale));
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(
		getAlternateUrls(canonicalPath).map((alt) => ({
			locale: alt.locale,
			url: `${PRIMARY_ORIGIN}${alt.url}`
		}))
	);
	const defaultAlternate = $derived(alternates.find((alt) => alt.locale === 'en'));
</script>

<svelte:head>
	<title>{$t('about_title')} | Local Snow</title>
	<meta name="description" content={$t('about_meta_description')} />

	<!-- Open Graph -->
	<meta property="og:title" content="{$t('about_title')} | Local Snow" />
	<meta property="og:description" content={$t('about_meta_description')} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{$t('about_title')} | Local Snow" />
	<meta name="twitter:description" content={$t('about_meta_description')} />
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	{#if defaultAlternate}
		<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
	{/if}
</svelte:head>

<article class="prose prose-sm mx-auto max-w-2xl">
	<h1 class="title2">{$t('about_title')}</h1>

	<section class="my-6">
		<h2 class="title3">{$t('about_who_built_title')}</h2>
		<p>
			{$t('about_who_built_p1')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_economic_title')}</h2>
		<p>
			{$t('about_economic_p1')}
		</p>
		<p>
			{$t('about_economic_p2')}
		</p>
		<p>
			{$t('about_economic_p3')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_visibility_title')}</h2>
		<p>
			{$t('about_visibility_p1')}
		</p>
		<p>
			{$t('about_visibility_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_risk_title')}</h2>
		<p>
			{$t('about_risk_p1')}
		</p>
		<p>
			{$t('about_risk_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_what_is_title')}</h2>
		<p>
			{$t('about_what_is_p1')}
		</p>
		<p>
			{$t('about_what_is_p2')}
		</p>
		<p>{$t('about_what_is_p3')}</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_verification_title')}</h2>
		<p>
			{$t('about_verification_p1')}
		</p>
		<p>
			{$t('about_verification_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_spain_title')}</h2>
		<p>{$t('about_spain_p1')}</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_goal_title')}</h2>
		<p>
			{$t('about_goal_p1')}
		</p>
		<p>
			{$t('about_goal_p2')}
		</p>
	</section>

	<section class="my-6">
		<h2 class="title3">{$t('about_contact_title')}</h2>
		<p>
			{@html $t('about_contact_p1', {
				values: {
					createProfile: `<a href="${signupPath}">${$t('about_contact_create_profile')}</a>`,
					email: `<strong>${$t('about_contact_email')}</strong>`
				}
			})}
		</p>
		<p>{$t('about_contact_p2')}</p>
	</section>

	<section class="border-border bg-card not-prose my-8 rounded-lg border p-6 shadow-sm">
		<h2 class="title3 mb-3">{$t('how_it_works_page_cta_title')}</h2>
		<p class="text-muted-foreground mb-5 text-sm">{$t('instructors_page_prompt_subtitle')}</p>
		<div class="flex flex-col gap-3 sm:flex-row">
			<a
				href={instructorsPath}
				class="border-border bg-card hover:bg-muted inline-block rounded-md border px-5 py-2.5 text-center font-medium"
			>
				{$t('how_it_works_page_cta_find_instructor')}
			</a>
			<a
				href={spainResortsPath}
				class="border-border bg-card hover:bg-muted inline-block rounded-md border px-5 py-2.5 text-center font-medium"
			>
				{$t('instructors_page_prompt_browse_spain')}
			</a>
			<a
				href={signupPath}
				class="bg-primary inline-block rounded-md px-5 py-2.5 text-center font-medium text-white"
			>
				{$t('how_it_works_page_cta_list_instructor')}
			</a>
		</div>
	</section>
</article>
