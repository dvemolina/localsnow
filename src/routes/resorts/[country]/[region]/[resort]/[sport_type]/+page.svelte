<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { MapPin, Mountain, ChevronRight, ExternalLink } from '@lucide/svelte';
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/shared/Breadcrumb.svelte';

	let { data } = $props();
	const { landingData, seo } = data;
	const { location, sport, instructors, relatedResorts, totalInstructors } = landingData;

	// Prepare breadcrumb items for the shared component
	const breadcrumbItems = seo.breadcrumbs.map((crumb) => ({
		href: crumb.url.replace('https://localsnow.com', ''),
		label: crumb.name
	}));
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={seo.openGraph.title} />
	<meta property="og:description" content={seo.openGraph.description} />
	<meta property="og:url" content={seo.openGraph.url} />
	<meta property="og:type" content={seo.openGraph.type} />
	<meta property="og:image" content={seo.openGraph.image} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.openGraph.title} />
	<meta name="twitter:description" content={seo.openGraph.description} />
	<meta name="twitter:image" content={seo.openGraph.image} />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(seo.structuredData)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: seo.breadcrumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: crumb.url
		}))
	})}<\/script>`}
</svelte:head>

{#key `${landingData.location.resort?.slug}-${landingData.sport.sportSlug}`}
<div class="min-h-screen bg-gray-50">
	<!-- Breadcrumbs -->
	<div class="border-b bg-white">
		<div class="container mx-auto max-w-7xl px-2 py-3 md:px-4">
			<div class="overflow-x-auto scrollbar-hide">
				<Breadcrumb page={$page} items={breadcrumbItems} />
			</div>
		</div>
	</div>

	<!-- Hero Section -->
	<div class="bg-gradient-to-b from-blue-600 to-blue-800 text-white">
		<div class="container mx-auto max-w-7xl px-4 py-16">
			<div class="max-w-3xl">
				<h1 class="mb-4 text-4xl font-bold md:text-5xl">
					{sport.sport} Instructors in {location.resort?.name}
				</h1>
				<p class="mb-6 text-xl text-blue-100">
					Book professional {sport.sport.toLowerCase()} lessons with verified instructors in {location.resort?.name}, {location.region?.region || location.country.country}
				</p>

				<div class="flex flex-wrap items-center gap-4 text-sm">
					<div class="flex items-center gap-2">
						<MapPin class="h-5 w-5" />
						<span>{location.region?.region || location.country.country}, {location.country.country}</span>
					</div>
					{#if location.resort?.minElevation && location.resort?.maxElevation}
						<div class="flex items-center gap-2">
							<Mountain class="h-5 w-5" />
							<span>{location.resort.minElevation}m - {location.resort.maxElevation}m</span>
						</div>
					{/if}
					{#if location.resort?.website}
						<a
							href={location.resort.website}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 hover:text-blue-200"
						>
							<ExternalLink class="h-4 w-4" />
							<span>Resort Website</span>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto max-w-7xl px-4 py-12">
		<!-- Results Summary -->
		<div class="mb-8">
			<h2 class="mb-2 text-2xl font-bold">
				{#if totalInstructors > 0}
					{totalInstructors} Verified {sport.sport} {totalInstructors === 1 ? 'Instructor' : 'Instructors'}
				{:else}
					No Instructors Available Yet
				{/if}
			</h2>
			<p class="text-muted-foreground">
				{#if totalInstructors > 0}
					All instructors are verified professionals ready to help you improve your skills
				{:else}
					We're currently onboarding instructors in this area. Check back soon or <a href="/contact" class="text-blue-600 hover:underline">contact us</a> if you're an instructor.
				{/if}
			</p>
		</div>

		<!-- Instructors Grid -->
		{#if instructors.length > 0}
			<div class="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each instructors as instructor}
					<Card class="overflow-hidden transition-shadow hover:shadow-lg">
						<CardContent class="p-0">
							<div class="aspect-square overflow-hidden bg-gray-200">
								{#if instructor.profileImageUrl}
									<img
										src={instructor.profileImageUrl}
										alt="{instructor.name} {instructor.lastName} - {sport.sport} instructor in {location.resort?.name}"
										class="h-full w-full object-cover"
										loading="lazy"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-6xl font-bold text-white">
										{instructor.name[0]}{instructor.lastName[0]}
									</div>
								{/if}
							</div>
							<div class="p-6">
								<div class="mb-3 flex items-start justify-between">
									<div>
										<h3 class="text-xl font-semibold">
											{instructor.name} {instructor.lastName}
										</h3>
										{#if instructor.isVerified}
											<Badge variant="default" class="mt-2">Verified Instructor</Badge>
										{/if}
									</div>
								</div>

								<!-- Sports -->
								<div class="mb-3">
									<p class="mb-1 text-sm font-medium text-muted-foreground">Teaches:</p>
									<div class="flex flex-wrap gap-2">
										{#each instructor.sports as instructorSport}
											<Badge variant="outline">{instructorSport.sport}</Badge>
										{/each}
									</div>
								</div>

								<!-- Bio -->
								{#if instructor.bio}
									<p class="mb-4 line-clamp-3 text-sm text-muted-foreground">
										{instructor.bio}
									</p>
								{/if}

								<!-- CTA -->
								<Button
									class="w-full"
									href="/instructor/{instructor.uuid}"
								>
									View Profile & Book
								</Button>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}

		<!-- About Section -->
		<div class="mb-12">
			<Card>
				<CardContent class="p-8">
					<h2 class="mb-4 text-2xl font-bold">
						Why Book {sport.sport} Lessons in {location.resort?.name}?
					</h2>
					<div class="prose max-w-none">
						<p class="mb-4 text-muted-foreground">
							{location.resort?.name} is a premier destination for {sport.sport.toLowerCase()} enthusiasts.
							{#if location.resort?.minElevation && location.resort?.maxElevation}
								With slopes ranging from {location.resort.minElevation}m to {location.resort.maxElevation}m,
							{/if}
							the resort offers terrain suitable for all skill levels.
						</p>
						<p class="text-muted-foreground">
							Our verified instructors provide personalized lessons tailored to your skill level and goals.
							Whether you're a complete beginner or looking to refine advanced techniques, you'll find the
							perfect instructor to help you progress safely and confidently.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Related Resorts -->
		{#if relatedResorts && relatedResorts.length > 0}
			<div class="mb-12">
				<h2 class="mb-6 text-2xl font-bold">
					Other Resorts in {location.region?.region || location.country.country}
				</h2>
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each relatedResorts as related}
						<a
							href="/resorts/{related.countrySlug}/{related.regionSlug || location.country.countrySlug}/{related.slug}/{sport.sportSlug}-instructors"
							data-sveltekit-reload
							class="group block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
						>
							<h3 class="font-semibold group-hover:text-blue-600">
								{related.name}
							</h3>
							<p class="text-sm text-muted-foreground">
								{sport.sport} Instructors
								<ChevronRight class="inline h-4 w-4" />
							</p>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- FAQ Section -->
		<div>
			<h2 class="mb-6 text-2xl font-bold">
				Frequently Asked Questions
			</h2>
			<div class="space-y-4">
				<Card>
					<CardContent class="p-6">
						<h3 class="mb-2 font-semibold">
							How do I book a {sport.sport.toLowerCase()} lesson in {location.resort?.name}?
						</h3>
						<p class="text-sm text-muted-foreground">
							Simply browse our verified instructors above, view their profiles to check availability,
							and submit a booking request. The instructor will respond within 24 hours to confirm your lesson.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent class="p-6">
						<h3 class="mb-2 font-semibold">
							Are all instructors certified?
						</h3>
						<p class="text-sm text-muted-foreground">
							Yes, all instructors displaying the "Verified" badge have been verified by LocalSnow.
							We review their certifications and qualifications before approving their profiles.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent class="p-6">
						<h3 class="mb-2 font-semibold">
							What should I bring to my lesson?
						</h3>
						<p class="text-sm text-muted-foreground">
							Bring your ski pass, appropriate clothing for the weather, and any personal equipment.
							Your instructor can advise on equipment rentals if needed.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</div>
{/key}
