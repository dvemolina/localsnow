<script lang="ts">
	import { t } from '$lib/i18n/i18n';
	import { get } from 'svelte/store';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
	import { page } from '$app/state';
	import { extractLocale, type Locale } from '$lib/i18n/routes';

	const PRIMARY_ORIGIN = 'https://localsnow.org';
	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const canonicalPath = $derived(route('/how-it-works', currentLocale));
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(getAlternateUrls(canonicalPath).map((alt) => ({
		locale: alt.locale,
		url: `${PRIMARY_ORIGIN}${alt.url}`
	})));
	const defaultAlternate = $derived(alternates.find((alt) => alt.locale === 'en'));

	// FAQ Schema for SEO - using get(t) for non-reactive context
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: get(t)('how_it_works_page_faq_deposit_q'),
				acceptedAnswer: {
					'@type': 'Answer',
					text: get(t)('how_it_works_page_faq_deposit_a')
				}
			},
			{
				'@type': 'Question',
				name: get(t)('how_it_works_page_faq_lead_fee_q'),
				acceptedAnswer: {
					'@type': 'Answer',
					text: get(t)('how_it_works_page_faq_lead_fee_a')
				}
			},
			{
				'@type': 'Question',
				name: get(t)('how_it_works_page_faq_no_response_q'),
				acceptedAnswer: {
					'@type': 'Answer',
					text: get(t)('how_it_works_page_faq_no_response_a')
				}
			},
			{
				'@type': 'Question',
				name: get(t)('how_it_works_page_faq_payments_q'),
				acceptedAnswer: {
					'@type': 'Answer',
					text: get(t)('how_it_works_page_faq_payments_a')
				}
			},
			{
				'@type': 'Question',
				name: get(t)('how_it_works_page_faq_contact_q'),
				acceptedAnswer: {
					'@type': 'Answer',
					text: get(t)('how_it_works_page_faq_contact_a')
				}
			}
		]
	};
</script>

<svelte:head>
	<title>{$t('seo_meta_how_it_works_title')}</title>
	<meta
		name="description"
		content={$t('seo_meta_how_it_works_description')}
	/>

	<!-- Open Graph -->
	<meta property="og:title" content={$t('seo_meta_how_it_works_title')} />
	<meta
		property="og:description"
		content={$t('seo_meta_how_it_works_description')}
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={$t('seo_meta_how_it_works_title')} />
	<meta
		name="twitter:description"
		content={$t('seo_meta_how_it_works_description')}
	/>
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<!-- FAQ Schema -->
	{@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}<\/script>`}

	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	{#if defaultAlternate}
		<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
	{/if}
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl">
	<h1 class="title2">{$t('how_it_works_page_title')}</h1>

	<p class="text-lg text-muted-foreground">
		{$t('how_it_works_page_intro')}
	</p>

	<!-- Free Highlight -->
	<div
		class="my-8 rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 p-6 not-prose"
	>
		<div class="flex items-center gap-3 mb-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-green-600"
				><polyline points="20 6 9 17 4 12"></polyline></svg
			>
			<h3 class="text-xl font-bold text-green-900 m-0">{$t('how_works_free_forever_badge')}</h3>
		</div>
		<p class="text-gray-700 m-0">
			{$t('how_works_free_forever_desc')}
		</p>
	</div>

	<!-- For Students Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm not-prose">
		<h2 class="title3 mb-6">{$t('how_it_works_page_clients_title')}</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_clients_step1_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_clients_step1_desc')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					2
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_clients_step2_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_clients_step2_desc')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					3
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_clients_step3_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_clients_step3_desc')}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$t('how_it_works_page_clients_step3_note')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					4
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_clients_step4_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_clients_step4_desc')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					5
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_clients_step5_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_clients_step5_desc')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					6
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_clients_step6_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_clients_step6_desc')}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-green-50 border border-green-200 p-4">
			<h4 class="font-semibold text-green-900 mb-2">{$t('how_it_works_page_clients_cost_title')}</h4>
			<ul class="space-y-1 text-sm text-green-800 mb-0">
				<li>✅ {$t('how_it_works_page_clients_cost_no_fees')}</li>
				<li>✅ {$t('how_it_works_page_clients_cost_deposit')}</li>
				<li>✅ {$t('how_it_works_page_clients_cost_unlimited')}</li>
			</ul>
		</div>
	</section>

	<!-- For Instructors Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm not-prose">
		<h2 class="title3 mb-6">{$t('how_it_works_page_instructors_title')}</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_instructors_step1_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_instructors_step1_desc')}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$t('how_it_works_page_instructors_step1_note')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					2
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_instructors_step2_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_instructors_step2_desc')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					3
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_instructors_step3_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_instructors_step3_desc')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					4
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_instructors_step4_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_instructors_step4_desc')}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$t('how_it_works_page_instructors_step4_note')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					5
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_instructors_step5_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_instructors_step5_desc')}
					</p>
				</div>
			</div>

			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					6
				</div>
				<div>
					<h3 class="title4 mb-2">{$t('how_it_works_page_instructors_step6_title')}</h3>
					<p class="text-sm text-gray-600">
						{$t('how_it_works_page_instructors_step6_desc')}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$t('how_it_works_page_instructors_step6_note')}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-green-50 border border-green-200 p-4">
			<h4 class="font-semibold text-green-900 mb-2">{$t('how_it_works_page_instructors_cost_title')}</h4>
			<ul class="space-y-1 text-sm text-green-800 mb-0">
				<li>✅ {$t('how_it_works_page_instructors_cost_free')}</li>
				<li>✅ {$t('how_it_works_page_instructors_cost_lead')}</li>
				<li>✅ {$t('how_it_works_page_instructors_cost_no_commission')}</li>
				<li>✅ {$t('how_it_works_page_instructors_cost_no_monthly')}</li>
			</ul>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="mt-12 not-prose">
		<h2 class="title3">{$t('how_it_works_page_faq_title')}</h2>

		<div class="space-y-6 mt-6">
			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$t('how_it_works_page_faq_deposit_q')}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$t('how_it_works_page_faq_deposit_a')}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$t('how_it_works_page_faq_lead_fee_q')}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$t('how_it_works_page_faq_lead_fee_a')}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$t('how_it_works_page_faq_no_response_q')}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$t('how_it_works_page_faq_no_response_a')}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$t('how_it_works_page_faq_payments_q')}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$t('how_it_works_page_faq_payments_a')}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$t('how_it_works_page_faq_contact_q')}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$t('how_it_works_page_faq_contact_a')}
				</p>
			</div>
		</div>
	</section>

	<!-- Why We're Different Section -->
	<section class="mt-12 rounded-lg bg-gray-50 border-2 border-gray-200 p-8 not-prose">
		<h2 class="title3 text-center mb-6">{$t('how_it_works_page_difference_title')}</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="bg-white rounded-lg p-5 border border-gray-200">
				<h3 class="font-bold text-red-700 mb-2">
					{$t('how_it_works_page_difference_traditional_title')}
				</h3>
				<ul class="text-sm text-gray-600 space-y-1.5 pl-5 mb-0">
					<li>{$t('how_it_works_page_difference_traditional_item1')}</li>
					<li>{$t('how_it_works_page_difference_traditional_item2')}</li>
					<li>{$t('how_it_works_page_difference_traditional_item3')}</li>
					<li>{$t('how_it_works_page_difference_traditional_item4')}</li>
					<li>{$t('how_it_works_page_difference_traditional_item5')}</li>
				</ul>
			</div>

			<div class="bg-white rounded-lg p-5 border border-green-500">
				<h3 class="font-bold text-green-700 mb-2">{$t('how_it_works_page_difference_localsnow_title')}</h3>
				<ul class="text-sm text-gray-600 space-y-1.5 pl-5 mb-0">
					<li>{$t('how_it_works_page_difference_localsnow_item1')}</li>
					<li>{$t('how_it_works_page_difference_localsnow_item2')}</li>
					<li>{$t('how_it_works_page_difference_localsnow_item3')}</li>
					<li>{$t('how_it_works_page_difference_localsnow_item4')}</li>
					<li>{$t('how_it_works_page_difference_localsnow_item5')}</li>
				</ul>
			</div>
		</div>

		<div class="mt-6 text-center">
			<p class="text-gray-700 mb-0">
				<strong>{$t('how_it_works_page_difference_note_title')}</strong>
				<a href={route('/about')} class="text-primary underline font-medium">
					{$t('how_it_works_page_difference_note_link')}
				</a>
				.
			</p>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="mt-12 text-center not-prose">
		<h2 class="title3 mb-6">{$t('how_it_works_page_cta_title')}</h2>
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
			<a
				href={route('/')}
				class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white"
			>
				{$t('how_it_works_page_cta_find_instructor')}
			</a>
			<a
				href={route('/signup')}
				class="inline-block rounded-md border border-border bg-card px-6 py-3 font-medium"
			>
				{$t('how_it_works_page_cta_list_instructor')}
			</a>
		</div>
	</section>
</article>
