<script lang="ts">
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import { heroResortSearchSchema } from '$src/features/Resorts/lib/resortSchemas';
	import SportSelect from '$src/features/Resorts/components/SportSelect.svelte';
	import { fly } from 'svelte/transition';
	import { superForm, superValidate } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';

	// Svelte 5 reactive state
	let userLocation = $state<string | null>("Wonderland");
	let isGeoLoading = $state(false);
	let searchQuery = $state('');
	let lessonType = $state('ski');

	let { data } = $props()

	// Primary keyword targets (expanded for search intent)
	const globalHeadline = 'Find Ski & Snowboard Lessons With Certified Instructors';
	const geoHeadline = $derived(`${userLocation || 'Local'} Ski & Snowboard Instructors`);

	// Top resorts data (helps with internal linking)
	const topResorts = [
		{ name: 'Chamonix', slug: 'chamonix', country: 'France', instructorCount: 87 },
		{ name: 'Whistler', slug: 'whistler', country: 'Canada', instructorCount: 112 },
		{ name: 'Zermatt', slug: 'zermatt', country: 'Switzerland', instructorCount: 65 },
		{ name: 'Catedral', slug: 'catedral', country: 'Argentina', instructorCount: 93 }
		// Add more popular resorts
	];

	// Enhanced schema
	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": ["WebSite", "SportsActivityLocation"],
		"name": "SkiLessonsHub",
		"description": "Book ski lessons directly with certified ski and snowboard schools/instructors at top resorts worldwide",
		"url": "https://skilessonshub.com",
		"image": "/ski-lessons-og.jpg",
		"hasOfferCatalog": {
			"@type": "OfferCatalog",
			"name": "Ski Lessons",
			"itemListElement": topResorts.map(resort => ({
				"@type": "Offer",
				"name": `${resort.name} Ski Lessons`,
				"category": "SkiSchool"
			}))
		}
	};

	//Hero Resort Search Form
	const form = superForm(data.form, {
		validators: zodClient(heroResortSearchSchema)
	});

	const { form: formData, enhance } = form;

</script>

<svelte:head>
	<title>Ski Lessons Hub | Certified Ski & Snowboard Instructors at Top Resorts</title>
	<meta
		name="description"
		content="Find & Book Ski Lessons | Connect directly with Certified Schools & Instructors at 200+ Top Resorts Worldwide. Get best prices with no booking fees, no middlemen."
	/>
	<script type="application/ld+json">
      {JSON.stringify(websiteSchema)}
	</script>
	<link rel="canonical" href="https://localsnow.com/" />
</svelte:head>

<section class="hero relative h-full w-full" itemscope itemtype="http://schema.org/WPHeader">
	<!-- LCP-optimized hero image -->
	<div class="overlay absolute inset-0 z-0 max-h-[400px] shadow-md rounded-lg">
		<picture >
			<source srcset="/ski-instructor-powder.webp" type="image/webp" />
			<img
				src="/ski-instructor-powder.jpeg"
				alt="Professional ski instructor teaching perfect turn technique in powder snow"
				width="1195"
				height="721"
				loading="eager"
				fetchpriority="high"
                importance="high"
				decoding="async"
				class="h-full w-full rounded-md object-cover object-right"
				itemprop="primaryImageOfPage"
			/>
		</picture>
	</div>

	<!-- Content overlay with search functionality -->
	<div
		class="container relative z-10 flex h-full flex-col items-center justify-center rounded-md px-4 py-6 text-white"
	>
		<div class="flex h-full w-full flex-col justify-between gap-4">
			<h1
				itemprop="headline"
				class="text-shadow mb-4 text-3xl font-bold sm:text-5xl md:text-6xl lg:text-6xl"
			>
				{globalHeadline}
			</h1>
			<div class="flex h-full flex-col justify-center">
				<p class="text-shadow mb-4 text-lg sm:text-xl  md:text-2xl max-w-[550px] text-white">
					<span class="rounded-full bg-primary/80 px-2.5 py-0.5">7,000+ Visitors</span> trust our
					<span class="font-semibold">FREE Worldwide</span> network of local instructors
					<span class="rounded-full bg-secondary/50 px-2.5 py-0.5"> around 200+ Resorts</span>
				</p>

				<!-- Search form - critical for conversion and user intent matching -->
				<form method="POST" use:enhance class="mb-8 rounded-lg bg-white/90 p-4 shadow-lg">
					<div class="flex flex-col gap-4 md:flex-row">
						<div class="flex-1">
							<SearchResort {form} name='resort' id="location"/>
						</div>
						<div class="flex-1 text-foreground">
							<SportSelect {form} name='sport' isHero={true}/>
						</div>
						<div class="flex items-center pt-4">
							<button
								type="submit"
								class="h-12 w-full whitespace-nowrap rounded-md bg-primary p-3 font-medium text-white md:w-auto"
							>
								Find Instructors
							</button>
						</div>
					</div>
				</form>

				<!-- Geolocation feature -->
				{#if userLocation}
					<div class="rounded-lg bg-white/80 mt-1 p-4 text-gray-800 shadow-lg" in:fly={{ y: 20 }}>
						<h2 class="flex items-center gap-2 text-xl font-bold">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
									clip-rule="evenodd"
								/>
							</svg>
							{geoHeadline}
						</h2>
						<div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<a
								href={`/${userLocation}/ski-schools`}
								class="flex items-center gap-2 text-primary hover:underline"
							>
								<span class="font-semibold">🏫 Ski Schools</span>
								<span class="rounded-full bg-primary/10 px-2 py-1 text-sm"
									>{Math.floor(Math.random() * 10) + 5}</span
								>
							</a>
							<a
								href={`/${userLocation}/private-instructors`}
								class="flex items-center gap-2 text-primary hover:underline"
							>
								<span class="font-semibold">👨‍🏫 Private Instructors</span>
								<span class="rounded-full bg-primary/10 px-2 py-1 text-sm"
									>{Math.floor(Math.random() * 20) + 10}</span
								>
							</a>
						</div>
					</div>
				{:else if isGeoLoading}
					<div class="animate-pulse rounded-lg bg-white/80 p-4 text-gray-800 shadow-lg mt-1">
						<p>Finding instructors near your location...</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Instructor Types Section - Critical for keyword targeting -->
<section class="grey-section">
		<h2 class="mb-8 text-center text-3xl font-bold">Find Your Perfect Instructor</h2>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<a
				href="/private-ski-lessons"
				class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
			>
				<h3 class="mb-2 text-xl font-semibold">Private Ski Lessons</h3>
				<p class="mb-4 text-gray-600">
					Personalized 1-on-1 instruction tailored to your skill level
				</p>
				<span class="font-medium text-primary">View Options →</span>
			</a>

			<a
				href="/group-ski-lessons"
				class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
			>
				<h3 class="mb-2 text-xl font-semibold">Group Ski Lessons</h3>
				<p class="mb-4 text-gray-600">
					Social learning with certified pros at budget-friendly rates
				</p>
				<span class="font-medium text-primary">View Options →</span>
			</a>

			<a
				href="/snowboard-instructors"
				class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
			>
				<h3 class="mb-2 text-xl font-semibold">Snowboard Instructors</h3>
				<p class="mb-4 text-gray-600">
					From freestyle to backcountry - specialized snowboard coaching
				</p>
				<span class="font-medium text-primary">View Options →</span>
			</a>

			<a
				href="/ski-schools"
				class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
			>
				<h3 class="mb-2 text-xl font-semibold">Ski Schools</h3>
				<p class="mb-4 text-gray-600">
					Official resort programs with full certification and insurance
				</p>
				<span class="font-medium text-primary">View Options →</span>
			</a>
		</div>
</section>

<!-- Top Resorts Section - Critical for local SEO -->
<section class="section">
	
		<h2 class="mb-2 text-center text-3xl font-bold">Popular Ski Resorts</h2>
		<p class="mb-8 text-center text-gray-600">
			Find certified instructors at these top ski destinations
		</p>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each topResorts as resort}
				<a
					href={`/${resort.slug}/instructors`}
					class="group relative overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-lg"
				>
					<img
						src={`/${resort.slug}.webp`}
						alt={`${resort.name} ski resort instructors`}
						loading="lazy"
						width="300"
						height="200"
						class="h-48 w-full object-cover transition-transform group-hover:scale-105"
					/>
					<div
						class="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 to-transparent p-4"
					>
						<h3 class="text-xl font-bold text-white">{resort.name}</h3>
						<p class="text-sm text-white/90">
							{resort.country} • {resort.instructorCount}+ instructors
						</p>
					</div>
				</a>
			{/each}
		</div>

		<div class="mt-8 text-center">
			<a
				href="/all-ski-resorts"
				class="inline-block rounded-md bg-primary px-6 py-3 font-medium text-white"
			>
				View All 200+ Ski Resorts
			</a>
		</div>
</section>

<!-- Trust Signals Section -->
<section class="grey-section w-full">
		<div class="mb-10 text-center">
			<h2 class="mb-4 text-3xl font-bold text-center">Wait, you said free..?</h2>
			<p class="text-gray-600 text-center">
				Yes, unlike booking platforms, we connect you directly with instructors - no commissions, no fees
			</p>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="rounded-lg bg-white p-6 text-center shadow-md">
				<div
					class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
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
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-semibold">No Booking Fees</h3>
				<p class="text-gray-600">
					Unlike Skibro and CheckYeti, we never take commissions from instructors
				</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow-md">
				<div
					class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
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
				<h3 class="mb-2 text-xl font-semibold">Verified Certifications</h3>
				<p class="text-gray-600">
					Every instructor's credentials are manually verified by our team
				</p>
			</div>

			<div class="rounded-lg bg-white p-6 text-center shadow-md">
				<div
					class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
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
				<h3 class="mb-2 text-xl font-semibold">Straight to the Source</h3>
				<p class="text-gray-600">
					Connect directly with instructors - no middlemen or booking platforms
				</p>
			</div>
		</div>
</section>

<style>
	.text-shadow {
		text-shadow: 0 1px 5px rgba(0, 0, 0, 0.567);
	}

	.overlay::before {
		content: var(--tw-content);
		position:absolute; 
    	inset: 0px;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.221) 0%, transparent 100%);
	}
	
</style>
