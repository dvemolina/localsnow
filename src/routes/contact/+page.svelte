<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { route } from '$lib/i18n/routeHelpers';

	const contactEmail = 'support@localsnow.org';

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
				'Platform connecting ski and snowboard instructors with clients at Spanish resorts',
			areaServed: {
				'@type': 'Country',
				name: 'Spain'
			}
		}
	};
</script>

<svelte:head>
	<title>{m.seo_meta_contact_title()}</title>
	<meta name="description" content={m.seo_meta_contact_description()} />

	<!-- Open Graph -->
	<meta property="og:title" content={m.seo_meta_contact_title()} />
	<meta property="og:description" content={m.seo_meta_contact_description()} />
	<meta property="og:url" content="https://localsnow.org/contact" />
	<meta property="og:image" content="https://localsnow.org/og-image.jpg" />

	<!-- Twitter Card -->
	<meta name="twitter:title" content={m.seo_meta_contact_title()} />
	<meta name="twitter:description" content={m.seo_meta_contact_description()} />
	<meta name="twitter:image" content="https://localsnow.org/og-image.jpg" />

	<!-- Structured Data -->
	<script type="application/ld+json">
		{JSON.stringify(contactPageSchema)}
	</script>

	<link rel="canonical" href="https://localsnow.org/contact" />
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl">
	<h1 class="title2">{m.contact_page_title()}</h1>
	<p class="text-lg text-muted-foreground">
		{m.contact_page_subtitle()}
	</p>

	<!-- General Inquiries Section -->
	<section class="my-8 rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="title3 mb-3">{m.contact_page_general_title()}</h2>
		<p class="mb-4 text-muted-foreground">{m.contact_page_general_desc()}</p>
		<div class="flex items-center gap-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-5 text-primary"
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
				<p class="text-sm font-medium text-muted-foreground">{m.contact_page_email_label()}</p>
				<a href="mailto:{contactEmail}" class="text-primary hover:underline">
					{contactEmail}
				</a>
			</div>
		</div>
	</section>

	<!-- For Instructors Section -->
	<section class="my-8 rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="title3 mb-3">{m.contact_page_instructors_title()}</h2>
		<p class="mb-4 text-muted-foreground">
			{m.contact_page_instructors_desc()}
		</p>

		<div class="mb-6">
			<h3 class="title4 mb-3">{m.contact_page_instructors_benefits()}</h3>
			<ul class="space-y-2.5">
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mt-0.5 size-5 shrink-0 text-primary"
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
					<span class="text-sm text-muted-foreground">{m.contact_page_benefit_1()}</span>
				</li>
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mt-0.5 size-5 shrink-0 text-primary"
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
					<span class="text-sm text-muted-foreground">{m.contact_page_benefit_2()}</span>
				</li>
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mt-0.5 size-5 shrink-0 text-primary"
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
					<span class="text-sm text-muted-foreground">{m.contact_page_benefit_3()}</span>
				</li>
				<li class="flex items-start gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mt-0.5 size-5 shrink-0 text-primary"
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
					<span class="text-sm text-muted-foreground">{m.contact_page_benefit_4()}</span>
				</li>
			</ul>
		</div>

		<a
			href={route('/signup')}
			class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white hover:bg-primary/90"
		>
			{m.contact_page_join_button()}
		</a>
	</section>

	<!-- For Clients Section -->
	<section class="my-8 rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="title3 mb-3">{m.contact_page_clients_title()}</h2>
		<p class="mb-4 text-muted-foreground">
			{m.contact_page_clients_desc()}
		</p>
		<a
			href={route('/instructors')}
			class="inline-block rounded-md border border-border bg-card px-6 py-3 font-medium hover:bg-muted"
		>
			{m.contact_page_find_button()}
		</a>
	</section>

	<!-- Support Section -->
	<section class="my-8 rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="title3 mb-3">{m.contact_page_support_title()}</h2>
		<p class="text-muted-foreground">
			{@html m.contact_page_support_desc({ email: `<a href="mailto:${contactEmail}" class="text-primary hover:underline">${contactEmail}</a>` })}
		</p>
	</section>

	<!-- FAQ Section -->
	<section class="my-8 rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="title3 mb-3">{m.contact_page_faq_title()}</h2>
		<p class="mb-4 text-muted-foreground">
			{m.contact_page_faq_cta()}
		</p>
		<a
			href={route('/how-it-works')}
			class="inline-block rounded-md border border-border bg-card px-6 py-3 font-medium hover:bg-muted"
		>
			{m.contact_page_how_it_works_button()}
		</a>
	</section>
</article>
