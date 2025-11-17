<script lang="ts">
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import { heroResortSearchSchema } from '$src/features/Resorts/lib/resortSchemas';
	import SportSelect from '$src/features/Resorts/components/SportSelect.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();

	// Top Spanish resorts for homepage
	const topResorts = [
		{
			name: 'Baqueira Beret',
			slug: 'baqueira-beret',
			region: 'Pyrenees, Catalonia',
			description: "Spain's most prestigious resort",
			image: '/ski-instructor-powder.webp'
		},
		{
			name: 'Formigal-Panticosa',
			slug: 'formigal-panticosa',
			region: 'Pyrenees, Aragón',
			description: 'Largest ski area in Spain',
			image: '/ski-instructor-turn.webp'
		},
		{
			name: 'Cerler',
			slug: 'cerler',
			region: 'Pyrenees, Huesca',
			description: 'Highest resort in the Pyrenees',
			image: '/zermatt.webp'
		},
		{
			name: 'Sierra Nevada',
			slug: 'sierra-nevada',
			region: 'Granada, Andalusia',
			description: 'Ski with views of the Mediterranean',
			image: '/catedral.webp'
		}
	];

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

	// Hero Resort Search Form
	const form = superForm(data.form, {
		validators: zodClient(heroResortSearchSchema)
	});

	const { form: formData, enhance } = form;
</script>

<svelte:head>
	<title>Local Snow | Find Ski Instructors at Spanish Resorts</title>
	<meta
		name="description"
		content="Connect directly with ski and snowboard instructors across Spain. No booking fees, no middlemen. Find instructors at 25+ Spanish resorts including Baqueira, Formigal, Cerler, and Sierra Nevada."
	/>
	<script type="application/ld+json">
      {JSON.stringify(websiteSchema)}
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
				Find Ski & Snowboard Instructors in Spain
			</h1>
			<div class="flex align-bottom h-full flex-col justify-center">
				<p class="text-shadow mb-6 max-w-[600px] text-lg text-white sm:text-xl md:text-2xl">
					Direct contact with local instructors at Spanish resorts. You pay what they charge -
					nothing more.
				</p>

				<!-- Search form -->
				<form method="POST" use:enhance class="rounded-lg bg-white/90 p-4 shadow-lg">
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
								Find Instructors
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>

<!-- Top Resorts Section -->
<section class="section">
	<h2 class="mb-2 text-center text-3xl font-bold">Popular Spanish Ski Resorts</h2>
	<p class="mb-8 text-center text-gray-600">Browse instructors at Spain's top ski destinations</p>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each topResorts as resort}
			<a
				href="/instructors?resort={resort.slug}"
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
						View Instructors →
					</span>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-8 text-center">
		<a href="/resorts" class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white">
			View All Spanish Resorts
		</a>
	</div>
</section>

<!-- How It Works Section -->
<section class="grey-section">
	<h2 class="mb-8 text-center text-3xl font-bold">How It Works</h2>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				1
			</div>
			<h3 class="mb-2 text-xl font-semibold">Search</h3>
			<p class="text-gray-600">
				Pick your resort and sport. Browse instructor profiles with real qualifications and pricing.
			</p>
		</div>

		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				2
			</div>
			<h3 class="mb-2 text-xl font-semibold">Request</h3>
			<p class="text-gray-600">
				Send a booking request with your dates and details. Get a direct response from the
				instructor.
			</p>
		</div>

		<div class="text-center">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
			>
				3
			</div>
			<h3 class="mb-2 text-xl font-semibold">Connect</h3>
			<p class="text-gray-600">
				Arrange your lesson directly with the instructor. Pay them directly - we don't take a cut.
			</p>
		</div>
	</div>

	<div class="mt-10 text-center">
		<a
			href="/how-it-works"
			class="inline-block rounded-md border border-primary px-6 py-3 font-medium text-primary transition-all hover:bg-primary hover:text-white"
		>
			See Detailed Guide for Clients and Instructors →
		</a>
	</div>
</section>

<!-- Trust Signals Section -->
<section class="section">
	<div class="mb-10 text-center">
		<h2 class="mb-4 text-center text-3xl font-bold">No Booking Fees. Really.</h2>
		<p class="text-center text-gray-600">
			Unlike CheckYeti and Skibro, we don't take commissions from your lessons. Instructors set
			their own prices.
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
			<h3 class="mb-2 text-xl font-semibold">Free for Clients</h3>
			<p class="text-gray-600">
				No booking fees, no service charges. Pay the instructor directly for your lessons.
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
			<h3 class="mb-2 text-xl font-semibold">Verified Instructors</h3>
			<p class="text-gray-600">
				Look for the verified badge. We check qualifications so you don't have to.
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
			<h3 class="mb-2 text-xl font-semibold">Built by Instructors</h3>
			<p class="text-gray-600">
				Created by a working ski instructor who was tired of expensive booking platforms.
			</p>
		</div>
	</div>
</section>

<!-- Instructor Benefits Section -->
<section class="grey-section">
	<div class="mb-10 text-center">
		<h2 class="mb-4 text-center text-3xl font-bold">Are You a Ski Instructor?</h2>
		<p class="text-center text-gray-600">
			Join Local Snow and connect directly with clients. No commissions on your lessons - just a
			small fee per lead.
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
			<h3 class="mb-2 text-xl font-semibold">Keep 100% of Your Fees</h3>
			<p class="text-gray-600">
				No commissions, no percentage cuts. You set your prices and keep everything you earn from
				lessons.
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
			<h3 class="mb-2 text-xl font-semibold">Only Pay for Qualified Leads</h3>
			<p class="text-gray-600">
				Just 5€ per booking request you choose to respond to. No monthly fees, no hidden charges.
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
			<h3 class="mb-2 text-xl font-semibold">Get Online in 5 Minutes</h3>
			<p class="text-gray-600">
				Free profile setup. Add your qualifications, set your rates, and start receiving booking
				requests immediately.
			</p>
		</div>
	</div>

	<div class="mt-10 text-center">
		<a
			href="/signup"
			class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md"
		>
			Create Your Instructor Profile
		</a>
		<p class="mt-4 text-sm text-gray-600">
			No credit card required. Takes less than 5 minutes.
		</p>
	</div>
</section>

<!-- Social Proof Section -->
<section class="section">
	<div class="mb-10 text-center">
		<h2 class="mb-4 text-center text-3xl font-bold">Trusted by Instructors and Clients</h2>
		<p class="text-center text-gray-600">
			See what our community has to say about Local Snow
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
				"Finally, a platform that doesn't take 20% of my earnings. I love the simplicity - just
				pay per lead and keep everything else. My income has increased significantly."
			</p>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
					<span class="text-primary font-semibold">MC</span>
				</div>
				<div>
					<p class="font-semibold">Maria Costa</p>
					<p class="text-sm text-muted-foreground">Ski Instructor, Baqueira Beret</p>
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
				"Found an amazing instructor for my family at Sierra Nevada. No hidden fees, direct contact,
				and the instructor was exactly as described. Will definitely use again!"
			</p>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
					<span class="text-primary font-semibold">JM</span>
				</div>
				<div>
					<p class="font-semibold">James Miller</p>
					<p class="text-sm text-muted-foreground">Client from London</p>
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
				"As a snowboard instructor in Formigal, this platform has been a game changer. More clients,
				less hassle, and I control my schedule completely. Highly recommended!"
			</p>
			<div class="flex items-center gap-3">
				<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
					<span class="text-primary font-semibold">PG</span>
				</div>
				<div>
					<p class="font-semibold">Pablo García</p>
					<p class="text-sm text-muted-foreground">Snowboard Instructor, Formigal</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Bottom CTA Section -->
<section class="grey-section text-center">
	<h2 class="mb-6 text-3xl font-bold">Ready to Get Started?</h2>
	<p class="mb-8 text-gray-600">
		Join Local Snow today and experience skiing without the booking fees.
	</p>
	<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
		<a
			href="/instructors"
			class="bg-primary inline-block rounded-md px-8 py-3 font-semibold text-white shadow-sm transition-all hover:shadow-md"
		>
			Find an Instructor
		</a>
		<a
			href="/signup"
			class="inline-block rounded-md border border-border bg-card px-8 py-3 font-semibold shadow-sm transition-all hover:shadow-md"
		>
			List as an Instructor
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
