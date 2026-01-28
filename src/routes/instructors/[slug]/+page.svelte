<!-- src/routes/instructors/[slug]/+page.svelte -->
<script lang="ts">
	import StarScore from '$src/lib/components/shared/StarScore.svelte';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import ContactInstructorDialog from '$src/features/Leads/components/ContactInstructorDialog.svelte';
	import SimplePriceDisplay from '$src/features/Pricing/components/SimplePriceDisplay.svelte';
	import ReviewList from '$src/features/Reviews/components/ReviewList.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n/i18n';
	import { generateInstructorSlug } from '$lib/utils/slug';
	let { data } = $props();
	let showContactModal = $state(false);

	const instructor = data.instructor;
	const sports = data.sports;
	const resorts = data.resorts;
	const reviews = data.reviews;
	const reviewStats = data.reviewStats;
	const school = data.school;

	// Get return URL from query params for filter preservation
	const returnTo = $derived(page.url.searchParams.get('returnTo') || '/instructors');

	const isAuthenticated = !!data.user; // Will be true if user exists
	const isIndependent = instructor.role === 'instructor-independent';

	// Construct profile URL with slug
	const instructorSlug = generateInstructorSlug(instructor.id, instructor.name, instructor.lastName);
	const profileUrl = `https://localsnow.org/instructors/${instructorSlug}`;
	const instructorFullName = `${instructor.name} ${instructor.lastName.charAt(0)}.`;
	const instructorImageUrl = instructor.profileImageUrl || 'https://localsnow.org/local-snow-head.png';

	// Create meta description
	const metaDescription = instructor.bio
		? instructor.bio.substring(0, 160)
		: `Book ski lessons with ${instructorFullName}, a certified ski instructor. ${reviewStats && reviewStats.totalReviews > 0 ? `Rated ${reviewStats.averageRating.toFixed(1)}/5 from ${reviewStats.totalReviews} reviews.` : 'Professional instruction for all skill levels.'}`;

	// Create structured data for instructor profile
	const personSchema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: instructorFullName,
		jobTitle: isIndependent ? 'Independent Ski Instructor' : 'Ski Instructor',
		description: instructor.bio || `Professional ski instructor at ${resorts.length > 0 ? resorts[0].name : 'ski resorts worldwide'}`,
		image: instructorImageUrl,
		url: profileUrl,
		...(school && {
			worksFor: {
				'@type': 'Organization',
				name: school.name,
				url: `https://localsnow.org/schools/${school.slug}`,
				...(school.logo && { logo: school.logo })
			}
		}),
		...(reviewStats && reviewStats.totalReviews > 0 && {
			aggregateRating: {
				'@type': 'AggregateRating',
				ratingValue: reviewStats.averageRating.toFixed(1),
				reviewCount: reviewStats.totalReviews,
				bestRating: 5,
				worstRating: 1
			}
		}),
		...(instructor.spokenLanguages && instructor.spokenLanguages.length > 0 && {
			knowsLanguage: instructor.spokenLanguages.map(lang => ({
				'@type': 'Language',
				name: lang
			}))
		}),
		...(data.baseLesson && {
			offers: {
				'@type': 'Offer',
				description: 'Private ski and snowboard lessons',
				price: data.baseLesson.basePrice,
				priceCurrency: data.baseLesson.currency || 'EUR',
				availability: 'https://schema.org/InStock',
				priceSpecification: {
					'@type': 'UnitPriceSpecification',
					price: data.baseLesson.basePrice,
					priceCurrency: data.baseLesson.currency || 'EUR',
					unitText: 'per hour'
				}
			}
		})
	};

	// Service schema for SEO
	const serviceSchema = {
		'@context': 'https://schema.org',
		'@type': 'Service',
		serviceType: sports.map(s => `${s.sport} Instruction`).join(', ') || 'Ski Instruction',
		name: `${sports.map(s => s.sport).join(' & ')} Lessons`,
		description: instructor.bio || `Professional ${sports.map(s => s.sport.toLowerCase()).join(' and ')} instruction for all skill levels`,
		provider: {
			'@type': 'Person',
			name: instructorFullName,
			url: profileUrl
		},
		...(resorts.length > 0 && {
			areaServed: resorts.map(resort => ({
				'@type': 'City',
				name: resort.name
			}))
		}),
		...(data.baseLesson && {
			offers: {
				'@type': 'Offer',
				priceSpecification: {
					'@type': 'UnitPriceSpecification',
					price: data.baseLesson.basePrice,
					priceCurrency: data.baseLesson.currency || 'EUR',
					unitText: 'per hour'
				},
				availability: 'https://schema.org/InStock'
			}
		})
	};

	// Organization schema for LocalSnow
	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Local Snow',
		url: 'https://localsnow.org',
		logo: 'https://localsnow.org/local-snow-head.png',
		description: 'Free directory of independent ski and snowboard instructors worldwide',
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
				name: 'Instructors',
				item: 'https://localsnow.org/instructors'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: instructorFullName,
				item: profileUrl
			}
		]
	};

	// Individual review schemas
	const reviewSchemas = reviews && reviews.length > 0 ? reviews.map((review) => ({
		'@context': 'https://schema.org',
		'@type': 'Review',
		reviewRating: {
			'@type': 'Rating',
			ratingValue: review.rating,
			bestRating: 5,
			worstRating: 1
		},
		author: {
			'@type': 'Person',
			name: review.reviewerName ||
				(review.clientName && review.clientName.trim()) ||
				(review.clientEmail ? review.clientEmail.split('@')[0] : 'Anonymous')
		},
		reviewBody: review.comment || '',
		datePublished: review.createdAt ? new Date(review.createdAt).toISOString() : '',
		itemReviewed: {
			'@type': 'Person',
			name: instructorFullName,
			url: profileUrl
		}
	})) : [];
</script>

<svelte:head>
	<title>{instructorFullName} - Ski Instructor | Local Snow</title>
	<meta name="description" content={metaDescription} />

	<!-- Open Graph -->
	<meta property="og:title" content="{instructorFullName} - Ski Instructor | Local Snow" />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={profileUrl} />
	<meta property="og:image" content={instructorImageUrl} />
	<meta property="og:image:alt" content="Profile photo of {instructorFullName}" />
	<meta property="og:type" content="profile" />
	{#if reviewStats && reviewStats.totalReviews > 0}
		<meta property="og:rating" content={reviewStats.averageRating.toFixed(1)} />
		<meta property="og:rating:scale" content="5" />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{instructorFullName} - Ski Instructor" />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={instructorImageUrl} />

	<!-- Structured Data -->
	<script type="application/ld+json">
		{JSON.stringify(personSchema)}
	</script>
	<script type="application/ld+json">
		{JSON.stringify(serviceSchema)}
	</script>
	<script type="application/ld+json">
		{JSON.stringify(organizationSchema)}
	</script>
	<script type="application/ld+json">
		{JSON.stringify(breadcrumbSchema)}
	</script>
	{#each reviewSchemas as reviewSchema}
		<script type="application/ld+json">
			{JSON.stringify(reviewSchema)}
		</script>
	{/each}

	<link rel="canonical" href={profileUrl} />
</svelte:head>

<section class="w-full">
	<!-- Back Button -->
	<div class="mb-6">
		<a
			href={returnTo}
			class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			{$t('button_back_to_instructors')}
		</a>
	</div>

	<!-- Main Profile Card-->
	<div
		class="flex w-full flex-col gap-6 md:flex-row"
	>
		<!-- Left Column - Avatar & Basic Info -->
		<div class="flex flex-col items-center gap-4 md:w-1/3 rounded-lg border border-border bg-card p-6">
			<Avatar.Root class="size-36 border-2 border-border shadow-sm sm:size-50">
				<Avatar.Image
					src={instructor.profileImageUrl || '/local-snow-head.png'}
					alt={`${instructor.name} ${instructor.lastName.charAt(0)}`}
				/>
				<Avatar.Fallback>{instructor.name[0]}{instructor.lastName[0]}</Avatar.Fallback>
			</Avatar.Root>

			<div class="text-center">
				<div class="flex items-center justify-center gap-2 flex-col-reverse">
					<h1 class="title3">
						{instructor.name}
						{instructor.lastName}
					</h1>

					<!-- Star Rating - Show actual rating if reviews exist -->
					{#if reviewStats && reviewStats.totalReviews > 0}
						<div class="flex flex-col items-center gap-1">
							<div class="flex justify-center">
								<StarScore score={reviewStats.averageRating} />
							</div>
							<span class="text-xs text-muted-foreground">
								{reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? $t('instructor_review') : $t('instructor_reviews')}
							</span>
						</div>
					{:else}
						<div class="flex justify-center">
							<span class="text-xs text-muted-foreground">{$t('instructor_no_reviews_yet')}</span>
						</div>
					{/if}
				</div>
					
				<!-- Instructor Type / School Affiliation -->
				<div class="mt-4">
					{#if school}
						<!-- School Affiliation Card -->
						<a
							href="/schools/{school.slug}"
							class="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3 transition-colors hover:bg-muted hover:border-primary/30"
						>
							{#if school.logo}
								<img
									src={school.logo}
									alt={school.name}
									class="size-10 rounded-md object-cover border border-border"
								/>
							{:else}
								<div class="flex size-10 items-center justify-center rounded-md bg-primary/10 border border-border">
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
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
								</div>
							{/if}
							<div class="flex flex-col items-start">
								<span class="text-xs text-muted-foreground">{$t('instructor_affiliated_with') || 'Affiliated with'}</span>
								<span class="text-sm font-medium">{school.name}</span>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="ml-auto size-4 text-muted-foreground"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					{:else}
						<Badge variant="secondary" class="text-sm">{$t('badge_independent_instructor')}</Badge>
					{/if}
				</div>
			</div>

			<!-- Contact Button - Primary CTA -->
			<Button
				onclick={() => (showContactModal = true)}
				class="mt-4 w-full"
				size="lg"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 size-5"
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
				{$t('button_contact_instructor') || 'Contact Instructor'}
			</Button>

			<!-- Quick Info Box -->
			<div class="mt-4 w-full space-y-3 rounded-lg bg-muted p-4">
				<div class="flex items-center gap-2">
					<img src="/icons/certificate.svg" alt="Certification" class="size-5" />
					<span class="text-sm font-medium">{$t('instructor_verified_badge')}</span>
				</div>
				<div class="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="text-sm">{$t('instructor_response_time')}</span>
				</div>
			</div>
		</div>



		<!-- Right Column - Detailed Info -->
		<div class="flex flex-1 flex-col space-y-6">
			{#if data.baseLesson && !data.groupTiers?.length && !data.durationPackages?.length }
				<div class="w-full rounded-lg border border-primary/20 bg-card p-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-medium">{$t('lessons_hourly_rate_label')}</span>
						<Badge variant="secondary" class="text-xs">{$t('badge_from')}</Badge>
					</div>
					<div class="flex items-baseline gap-2">
						<span class="text-2xl font-bold text-primary">{data.baseLesson.basePrice}</span>
						<span class="text-sm text-muted-foreground">{data.baseLesson.currency}/h</span>
					</div>
					<p class="mt-2 text-xs text-muted-foreground">
						{$t('instructor_base_rate_help')}
					</p>
				</div>
			{/if}
			{#if data.groupTiers?.length > 0 || data.durationPackages?.length > 0}
				<SimplePriceDisplay 
					lesson={data.baseLesson}
					groupTiers={data.groupTiers}
					durationPackages={data.durationPackages}
				/>
			{/if}
			<div class="rounded-lg border border-border bg-card p-6 flex flex-col gap-4">
				
				<!-- Sports Taught -->
				<div>
					<h2 class="title4 mb-3 flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-5"
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
						{$t('instructor_sports_offered')}
					</h2>
					<div class="flex flex-wrap gap-2">
						{#each sports as sport}
							<Badge variant="outline" class="text-sm">
								{sport.name}
							</Badge>
						{/each}
					</div>
				</div>

				<!-- Location/Resort -->
				<div>
					<h2 class="title4 mb-3 flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-5"
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
						{$t('instructor_teaching_location')}
					</h2>
					<div class="flex flex-wrap gap-2">
						{#if resorts.length > 0}
							{#each resorts as resort}
								<span class="text-sm text-muted-foreground">
									{resort.name}
								</span>
							{/each}
						{:else}
							<span class="text-sm text-muted-foreground">
								{$t('instructor_multiple_locations')}
							</span>
						{/if}
					</div>
				</div>

				<!-- Languages Spoken -->
				{#if instructor.spokenLanguages && instructor.spokenLanguages.length > 0}
					<div>
						<h2 class="title4 mb-3 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="size-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
								/>
							</svg>
							{$t('instructor_languages')}
						</h2>
						<div class="flex flex-wrap gap-2">
							{#each instructor.spokenLanguages as language}
								<Badge variant="outline" class="text-sm">
									{language}
								</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Qualifications -->
			 <!-- 
			{#if instructor.qualificationUrl}
				<div class="rounded-lg border border-border bg-card p-6 flex flex-col gap-4">
					<h2 class="title4 mb-3 flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-5"
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
						Qualifications
					</h2>
					<a
						href={instructor.qualificationUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-sm text-primary hover:underline"
					>
						View Certification Document
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
					</a>
				</div>
			{/if}
			-->
		</div>
	</div>

	<!-- Bio -->
	<div class="rounded-lg border border-border bg-card p-6 mt-8">
			{#if instructor.bio}
				<div>
					<h2 class="title4 mb-3">{$t('instructor_about_heading') , instructor.name }</h2>
					<p class="hyphens-auto text-sm leading-relaxed text-muted-foreground">
						{instructor.bio}
					</p>
				</div>
			{:else}
				<div>
					<h2 class="title4 mb-3">{$t('instructor_about_heading'), instructor.name }</h2>
					<p class="hyphens-auto text-sm leading-relaxed text-muted-foreground">
						{$t('instructor_default_bio')}
					</p>
				</div>
			{/if}

		</div>

	<!-- Additional Info Section -->
	<div class="mt-8 grid gap-6 md:grid-cols-2">
		<!-- What to Expect -->
		<div class="rounded-lg border border-border bg-card p-6">
				<h2 class="title4 mb-3 flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-5"
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
					{$t('instructor_what_to_expect')}
				</h2>
				<ul class="space-y-2.5 text-sm text-muted-foreground">
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
						<span>{$t('instructor_benefit1')}</span>
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
						<span>{$t('instructor_benefit2')}</span>
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
						<span>{$t('instructor_benefit3')}</span>
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
						<span>{$t('instructor_benefit4')}</span>
					</li>
				</ul>
			</div>

		<!-- Booking Info -->
		<div class="rounded-lg border border-border bg-card p-6">
			<h2 class="title4 mb-4">{$t('instructor_booking_information')}</h2>
			<div class="space-y-3 text-sm text-muted-foreground">
				<p>
					{$t('instructor_lesson_types')}
				</p>
				<p>
					{$t('instructor_lesson_duration')}
				</p>
				<p>
					{$t('instructor_booking_process')}
				</p>
				<p class="text-xs italic">
					{$t('instructor_booking_note')}
				</p>
			</div>
		</div>
	</div>

	<!-- Reviews Section -->
	<div class="mt-8">
		<ReviewList
			instructorId={instructor.id}
			initialReviews={reviews}
			initialStats={reviewStats}
		/>
	</div>

	<!-- Contact Button - Bottom CTA -->
	<Button
		onclick={() => (showContactModal = true)}
		class="mt-8 w-full"
		size="lg"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 size-5"
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
		{$t('button_contact_instructor') || 'Contact Instructor'}
	</Button>
</section>

<ContactInstructorDialog
	bind:open={showContactModal}
	instructorId={instructor.id}
	instructorName={instructor.name}
	baseLesson={data.baseLesson}
	isAuthenticated={isAuthenticated}
	user={data.user}
/>
