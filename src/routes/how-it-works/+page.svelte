<script lang="ts">
	import { useIntlayer } from 'svelte-intlayer';
	import { route } from '$lib/i18n/routeHelpers';

	// FAQ Schema for SEO - using message functions
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: $how_it_works.how_it_works_page_faq_deposit_q.value,
				acceptedAnswer: {
					'@type': 'Answer',
					text: $how_it_works.how_it_works_page_faq_deposit_a.value
				}
			},
			{
				'@type': 'Question',
				name: $how_it_works.how_it_works_page_faq_lead_fee_q.value,
				acceptedAnswer: {
					'@type': 'Answer',
					text: $how_it_works.how_it_works_page_faq_lead_fee_a.value
				}
			},
			{
				'@type': 'Question',
				name: $how_it_works.how_it_works_page_faq_no_response_q.value,
				acceptedAnswer: {
					'@type': 'Answer',
					text: $how_it_works.how_it_works_page_faq_no_response_a.value
				}
			},
			{
				'@type': 'Question',
				name: $how_it_works.how_it_works_page_faq_payments_q.value,
				acceptedAnswer: {
					'@type': 'Answer',
					text: $how_it_works.how_it_works_page_faq_payments_a.value
				}
			},
			{
				'@type': 'Question',
				name: $how_it_works.how_it_works_page_faq_contact_q.value,
				acceptedAnswer: {
					'@type': 'Answer',
					text: $how_it_works.how_it_works_page_faq_contact_a.value
				}
			}
		]
	};
</script>

<svelte:head>
	<title>How It Works - Free Ski Instructor Directory | LocalSnow</title>
	<meta
		name="description"
		content="LocalSnow connects ski instructors and students directly. Currently free - no booking fees, no commissions. See how our directory works for instructors and clients."
	/>

	<!-- Open Graph -->
	<meta property="og:title" content="How LocalSnow Works - Free Directory" />
	<meta
		property="og:description"
		content="Free platform connecting ski instructors with students. No fees, no commissions, direct contact."
	/>
	<meta property="og:url" content="https://localsnow.org/how-it-works" />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="How LocalSnow Works - Free Directory" />
	<meta
		name="twitter:description"
		content="Free platform for finding ski instructors. No fees, no commissions, direct contact."
	/>
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<!-- FAQ Schema -->
	<script type="application/ld+json">
		{JSON.stringify(faqSchema)}
	</script>

	<link rel="canonical" href="https://localsnow.org/how-it-works" />
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl">
	<h1 class="title2">{$how_it_works.how_it_works_page_title.value}</h1>

	<p class="text-lg text-muted-foreground">
		{$how_it_works.how_it_works_page_intro.value}
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
			<h3 class="text-xl font-bold text-green-900 m-0">{$how_it_works.how_works_free_forever_badge.value}</h3>
		</div>
		<p class="text-gray-700 m-0">
			{$how_it_works.how_works_free_forever_desc.value}
		</p>
	</div>

	<!-- For Students Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm not-prose">
		<h2 class="title3 mb-6">{$how_it_works.how_it_works_page_clients_title.value}</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_clients_step1_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_clients_step1_desc.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_clients_step2_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_clients_step2_desc.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_clients_step3_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_clients_step3_desc.value}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$how_it_works.how_it_works_page_clients_step3_note.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_clients_step4_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_clients_step4_desc.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_clients_step5_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_clients_step5_desc.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_clients_step6_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_clients_step6_desc.value}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-green-50 border border-green-200 p-4">
			<h4 class="font-semibold text-green-900 mb-2">{$how_it_works.how_it_works_page_clients_cost_title.value}</h4>
			<ul class="space-y-1 text-sm text-green-800 mb-0">
				<li>✅ {$how_it_works.how_it_works_page_clients_cost_no_fees.value}</li>
				<li>✅ {$how_it_works.how_it_works_page_clients_cost_deposit.value}</li>
				<li>✅ {$how_it_works.how_it_works_page_clients_cost_unlimited.value}</li>
			</ul>
		</div>
	</section>

	<!-- For Instructors Section -->
	<section class="mt-12 rounded-lg border border-border bg-card p-6 shadow-sm not-prose">
		<h2 class="title3 mb-6">{$how_it_works.how_it_works_page_instructors_title.value}</h2>

		<div class="space-y-6">
			<div class="flex gap-4">
				<div
					class="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
				>
					1
				</div>
				<div>
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_instructors_step1_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_instructors_step1_desc.value}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$how_it_works.how_it_works_page_instructors_step1_note.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_instructors_step2_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_instructors_step2_desc.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_instructors_step3_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_instructors_step3_desc.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_instructors_step4_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_instructors_step4_desc.value}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$how_it_works.how_it_works_page_instructors_step4_note.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_instructors_step5_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_instructors_step5_desc.value}
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
					<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_instructors_step6_title.value}</h3>
					<p class="text-sm text-gray-600">
						{$how_it_works.how_it_works_page_instructors_step6_desc.value}
					</p>
					<p class="text-xs text-gray-500 mt-2 italic">
						{$how_it_works.how_it_works_page_instructors_step6_note.value}
					</p>
				</div>
			</div>
		</div>

		<div class="mt-6 rounded-md bg-green-50 border border-green-200 p-4">
			<h4 class="font-semibold text-green-900 mb-2">{$how_it_works.how_it_works_page_instructors_cost_title.value}</h4>
			<ul class="space-y-1 text-sm text-green-800 mb-0">
				<li>✅ {$how_it_works.how_it_works_page_instructors_cost_free.value}</li>
				<li>✅ {$how_it_works.how_it_works_page_instructors_cost_lead.value}</li>
				<li>✅ {$how_it_works.how_it_works_page_instructors_cost_no_commission.value}</li>
				<li>✅ {$how_it_works.how_it_works_page_instructors_cost_no_monthly.value}</li>
			</ul>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="mt-12 not-prose">
		<h2 class="title3">{$how_it_works.how_it_works_page_faq_title.value}</h2>

		<div class="space-y-6 mt-6">
			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_faq_deposit_q.value}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$how_it_works.how_it_works_page_faq_deposit_a.value}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_faq_lead_fee_q.value}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$how_it_works.how_it_works_page_faq_lead_fee_a.value}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_faq_no_response_q.value}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$how_it_works.how_it_works_page_faq_no_response_a.value}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_faq_payments_q.value}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$how_it_works.how_it_works_page_faq_payments_a.value}
				</p>
			</div>

			<div class="rounded-lg border border-border p-5">
				<h3 class="title4 mb-2">{$how_it_works.how_it_works_page_faq_contact_q.value}</h3>
				<p class="text-sm text-gray-600 mb-0">
					{$how_it_works.how_it_works_page_faq_contact_a.value}
				</p>
			</div>
		</div>
	</section>

	<!-- Why We're Different Section -->
	<section class="mt-12 rounded-lg bg-gray-50 border-2 border-gray-200 p-8 not-prose">
		<h2 class="title3 text-center mb-6">Why LocalSnow is Different</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="bg-white rounded-lg p-5 border border-gray-200">
				<h3 class="font-bold text-red-700 mb-2">❌ Traditional Booking Platforms</h3>
				<ul class="text-sm text-gray-600 space-y-1.5 pl-5 mb-0">
					<li>15-30% commission per lesson</li>
					<li>Booking fees for students</li>
					<li>Mandatory payment processing</li>
					<li>Profit-driven, VC-funded</li>
					<li>Complex pricing tiers</li>
				</ul>
			</div>

			<div class="bg-white rounded-lg p-5 border border-green-500">
				<h3 class="font-bold text-green-700 mb-2">✅ LocalSnow</h3>
				<ul class="text-sm text-gray-600 space-y-1.5 pl-5 mb-0">
					<li><strong>0% commission</strong> - instructors keep everything</li>
					<li><strong>€0 booking fees</strong> - completely free</li>
					<li><strong>Direct contact</strong> - you arrange payment</li>
					<li><strong>Community-driven</strong> - open-source</li>
					<li><strong>Simple & transparent</strong> - no hidden costs</li>
				</ul>
			</div>
		</div>

		<div class="mt-6 text-center">
			<p class="text-gray-700 mb-0">
				<strong>Sound too good to be true?</strong> Check our
				<a
					href="https://github.com/dvemolina/localsnow"
					target="_blank"
					rel="noopener"
					class="text-primary underline font-medium">open-source code</a
				> or read our <a href={route('/')} class="text-primary underline font-medium"
					>mission statement</a
				>.
			</p>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="mt-12 text-center not-prose">
		<h2 class="title3 mb-6">{$how_it_works.how_it_works_page_cta_title.value}</h2>
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
			<a
				href={route('/')}
				class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white"
			>
				{$how_it_works.how_it_works_page_cta_find_instructor.value}
			</a>
			<a
				href={route('/signup')}
				class="inline-block rounded-md border border-border bg-card px-6 py-3 font-medium"
			>
				{$how_it_works.how_it_works_page_cta_list_instructor.value}
			</a>
		</div>
	</section>
</article>
