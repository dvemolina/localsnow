<script lang="ts">
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { route } from '$lib/i18n/routeHelpers';
	import { page } from '$app/stores';

	let { data } = $props();

	const school = data.school;
	const resorts = data.resorts;
	const instructors = data.instructors;

	// Get return URL from query params for filter preservation
	const returnTo = $derived($page.url.searchParams.get('returnTo') || route('/schools'));

	// Construct profile URL
	const profileUrl = `https://localsnow.org/schools/${school.slug}`;
	const schoolImageUrl = school.logo || 'https://localsnow.org/local-snow-head.png';

	// Create meta description
	const metaDescription = school.bio
		? school.bio.substring(0, 160)
		: `${school.name} offers professional ski and snowboard instruction at ${resorts.length > 0 ? resorts[0].name : 'top ski resorts'}.`;

	// Create structured data for school profile - Using LocalBusiness for SEO
	const organizationSchemaForSchool = {
		'@context': 'https://schema.org',
		'@type': ['LocalBusiness', 'SportsActivityLocation'],
		name: school.name,
		description:
			school.bio ||
			`Professional ski and snowboard instruction at ${resorts.length > 0 ? resorts[0].name : 'top ski resorts'}`,
		image: schoolImageUrl,
		url: profileUrl,
		...(school.schoolEmail && {
			email: school.schoolEmail
		}),
		...(school.schoolPhone && school.countryCode && {
			telephone: `+${school.countryCode}${school.schoolPhone}`
		}),
		...(resorts.length > 0 && {
			address: {
				'@type': 'PostalAddress',
				addressLocality: resorts[0].name,
				addressRegion: resorts[0].region || resorts[0].country,
				addressCountry: resorts[0].countryCode || 'ES'
			}
		}),
		// Add geographic coordinates if available
		...(resorts.length > 0 && resorts[0].lat && resorts[0].lon && {
			geo: {
				'@type': 'GeoCoordinates',
				latitude: resorts[0].lat,
				longitude: resorts[0].lon
			}
		}),
		// Service area
		...(resorts.length > 0 && {
			areaServed: resorts.map(resort => ({
				'@type': 'City',
				name: resort.name
			}))
		}),
		// Team members (instructors)
		...(instructors.length > 0 && {
			member: instructors.slice(0, 10).map(instructor => ({
				'@type': 'Person',
				'@id': `https://localsnow.org/instructors/${instructor.id}-${instructor.name.toLowerCase()}-${instructor.lastName.toLowerCase()}`,
				name: `${instructor.name} ${instructor.lastName.charAt(0)}.`,
				jobTitle: 'Ski Instructor'
			}))
		})
	};

	// Organization schema for LocalSnow
	const localSnowSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Local Snow',
		url: 'https://localsnow.org',
		logo: 'https://localsnow.org/local-snow-head.png',
		description: 'Free directory of ski and snowboard schools worldwide',
		sameAs: []
	};

	// Breadcrumb schema
	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://localsnow.org'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Schools',
				item: 'https://localsnow.org/schools'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: school.name,
				item: profileUrl
			}
		]
	};
</script>

<svelte:head>
	<title>{school.name} | Ski School | LocalSnow</title>
	<meta name="description" content={metaDescription} />

	<!-- Open Graph -->
	<meta property="og:title" content="{school.name} | Ski School | LocalSnow" />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={profileUrl} />
	<meta property="og:image" content={schoolImageUrl} />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{school.name} | Ski School | LocalSnow" />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={schoolImageUrl} />

	<!-- Structured Data -->
	<script type="application/ld+json">
		{JSON.stringify(organizationSchemaForSchool)}
	</script>
	<script type="application/ld+json">
		{JSON.stringify(localSnowSchema)}
	</script>
	<script type="application/ld+json">
		{JSON.stringify(breadcrumbSchema)}
	</script>

	<link rel="canonical" href={profileUrl} />
</svelte:head>

<section class="w-full max-w-6xl mx-auto">
	<!-- Header Section -->
	<div class="mb-8">
		<!-- Back Button -->
		<div class="mb-4">
			<a href={returnTo}>
				<Button variant="ghost" size="sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Schools
				</Button>
			</a>
		</div>

		<!-- School Header -->
		<Card.Root>
			<Card.Content class="p-6">
				<div class="flex flex-col md:flex-row gap-6">
					<!-- Logo -->
					<div class="flex-shrink-0">
						<Avatar.Root class="size-32 border border-border">
							<Avatar.Image src={school.logo || '/icons/home.svg'} alt={school.name} />
							<Avatar.Fallback>{school.name.substring(0, 2).toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
					</div>

					<!-- Info -->
					<div class="flex-1">
						<div class="flex items-center gap-3 mb-3">
							<h1 class="title2">{school.name}</h1>
							{#if school.isVerified}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="size-6 text-blue-500"
									viewBox="0 0 24 24"
									fill="currentColor"
									title="Verified School"
								>
									<path
										fill-rule="evenodd"
										d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</div>

						{#if school.bio}
							<p class="text-muted-foreground mb-4">{school.bio}</p>
						{/if}

						<!-- Resorts -->
						{#if resorts.length > 0}
							<div class="flex items-center gap-2 mb-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="size-5 text-muted-foreground"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<div class="flex flex-wrap gap-2">
									{#each resorts as resort}
										<Badge variant="secondary">
											{resort.name}{#if resort.regionName}, {resort.regionName}{/if}
										</Badge>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Contact Info -->
						<div class="flex flex-wrap gap-4 mb-4">
							{#if school.schoolEmail}
								<div class="flex items-center gap-2 text-sm">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="size-4 text-muted-foreground"
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
									<a href="mailto:{school.schoolEmail}" class="text-primary hover:underline">
										{school.schoolEmail}
									</a>
								</div>
							{/if}
							{#if school.schoolPhone && school.countryCode}
								<div class="flex items-center gap-2 text-sm">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="size-4 text-muted-foreground"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
									<a
										href="tel:+{school.countryCode}{school.schoolPhone}"
										class="text-primary hover:underline"
									>
										+{school.countryCode} {school.schoolPhone}
									</a>
								</div>
							{/if}
						</div>

						<!-- Contact Button -->
						<div class="flex gap-3">
							{#if school.schoolEmail}
								<a href="mailto:{school.schoolEmail}">
									<Button>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="mr-2 h-4 w-4"
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
										Contact School
									</Button>
								</a>
							{/if}
							{#if school.schoolPhone && school.countryCode}
								<a href="tel:+{school.countryCode}{school.schoolPhone}">
									<Button variant="outline">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="mr-2 h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
											/>
										</svg>
										Call
									</Button>
								</a>
							{/if}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Instructors Section -->
	{#if instructors.length > 0}
		<div class="mb-8">
			<h2 class="title3 mb-4">Our Instructors</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each instructors as instructor}
					<Card.Root>
						<Card.Content class="p-4">
							<a
								href={route(`/instructors/${instructor.id}`)}
								class="flex items-center gap-3 hover:opacity-80 transition-opacity"
							>
								<Avatar.Root class="size-16 border border-border">
									<Avatar.Image
										src={instructor.profileImageUrl || '/local-snow-head.png'}
										alt={instructor.name}
									/>
									<Avatar.Fallback>
										{instructor.name.substring(0, 1).toUpperCase()}{instructor.lastName
											.substring(0, 1)
											.toUpperCase()}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<p class="font-semibold">
											{instructor.name}
											{instructor.lastName.charAt(0)}.
										</p>
										{#if instructor.isVerified}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="size-4 text-blue-500"
												viewBox="0 0 24 24"
												fill="currentColor"
											>
												<path
													fill-rule="evenodd"
													d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
													clip-rule="evenodd"
												/>
											</svg>
										{/if}
									</div>
									{#if instructor.bio}
										<p class="text-sm text-muted-foreground line-clamp-2">{instructor.bio}</p>
									{/if}
								</div>
							</a>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}
</section>
