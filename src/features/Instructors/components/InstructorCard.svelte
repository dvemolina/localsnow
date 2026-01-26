<script>
	import StarScore from '$src/lib/components/shared/StarScore.svelte';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge, badgeVariants } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import { generateInstructorSlug } from '$lib/utils/slug';
	import { t } from '$lib/i18n/i18n';
	import { page } from '$app/stores';

	let { instructorData, baseLesson = null, preserveFilters = false } = $props();

	// Map sport IDs to labels
	const sportLabels = {
		1: 'Ski',
		2: 'Snowboard',
		3: 'Telemark'
	};

	const isIndependent = instructorData.role === 'instructor-independent';
	const instructorSlug = generateInstructorSlug(instructorData.id, instructorData.name, instructorData.lastName);

	// Review stats handling with fallbacks for different data shapes
	const reviewStats = instructorData.reviewStats || instructorData.review_stats || instructorData.ratingStats || null;
	const totalReviews =
		reviewStats?.totalReviews ??
		reviewStats?.total_reviews ??
		instructorData.totalReviews ??
		instructorData.reviewCount ??
		0;
	const averageRating =
		reviewStats?.averageRating ??
		reviewStats?.average_rating ??
		instructorData.averageRating ??
		instructorData.rating ??
		0;

	// Build href with optional filter preservation - Properly reactive with Svelte 5
	// Extract search params reactively so $derived tracks changes
	const currentSearchParams = $derived($page.url.searchParams.toString());
	const href = $derived(
		preserveFilters && currentSearchParams
			? `/instructors/${instructorSlug}?returnTo=${encodeURIComponent(`/instructors?${currentSearchParams}`)}`
			: `/instructors/${instructorSlug}`
	);
</script>

<a
	{href}
	class="card group relative flex flex-col justify-between gap-3 rounded-md border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-md w-full min-w-[265px] sm:max-w-[717px] md:max-w-[435px]"
>
	<div class="flex w-full flex-row gap-3">
		<Avatar.Root class="mt-2 size-24 border border-border sm:size-36">
			<Avatar.Image
				src={instructorData.profileImageUrl || '/local-snow-head.png'}
				alt={`${instructorData.name} ${instructorData.lastName}`}
			/>
			<Avatar.Fallback>{instructorData.name[0]}{instructorData.lastName[0]}</Avatar.Fallback>
		</Avatar.Root>

		<div class="flex flex-col gap-1">
			<p class="title4 py-1 pr-1">{instructorData.name} {instructorData.lastName}</p>

			<!-- Sports Taught -->
			<div class="sports-that-teach flex flex-row items-center gap-1 flex-wrap">
				{#each instructorData.sports as sportId}
					<Badge class="text-[0.65rem] opacity-60 sm:text-xs">
						{sportLabels[sportId] || 'Sport'}
					</Badge>
				{/each}
			</div>

			<!-- Languages Spoken -->
			{#if instructorData.spokenLanguages && instructorData.spokenLanguages.length > 0}
				<div class="flex flex-row items-center gap-2">
					<img src="/icons/language.svg" alt="Languages" class="size-4" />
					<div class="flex flex-row items-center gap-1 flex-wrap">
						{#each instructorData.spokenLanguages.slice(0, 2) as language}
							<Badge variant="secondary" class="text-[0.65rem] sm:text-xs">
								{language}
							</Badge>
						{/each}
						{#if instructorData.spokenLanguages.length > 2}
							<span class="text-[0.65rem] text-muted-foreground sm:text-xs">
								+{instructorData.spokenLanguages.length - 2} more
							</span>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Teaching Location -->
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/ski-resort.svg" alt="Resort" class="size-4" />
				<span class="text-[0.65rem] sm:text-xs {badgeVariants({ variant: 'secondary' })}">
					{#if instructorData.resorts && instructorData.resorts.length > 0}
						{instructorData.resorts[0]?.name || instructorData.resorts[0]}
					{:else}
						Multiple Locations
					{/if}
				</span>
			</div>

			<!-- Instructor Type -->
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/service.svg" alt="Instructor Type" class="size-4" />
				{#if isIndependent}
					<Badge variant="secondary" class="text-[0.65rem] sm:text-xs">{$t('instructor_card_independent')}</Badge>
				{:else}
					<Badge variant="secondary" class="text-[0.65rem] sm:text-xs">{$t('instructor_card_school')}</Badge>
				{/if}
			</div>

			<!-- School Affiliation (if applicable) -->
			{#if instructorData.school}
				<div class="flex flex-row items-center gap-2">
					<img src="/icons/home.svg" alt={$t('instructor_card_school_alt')} class="size-4" />
					<a
						href="/schools/{instructorData.school.slug}"
						class="text-[0.65rem] sm:text-xs {badgeVariants({ variant: 'secondary' })} hover:bg-primary hover:text-primary-foreground transition-colors no-underline"
						onclick={(e) => e.stopPropagation()}
					>
						{instructorData.school.name}
					</a>
				</div>
			{/if}

			<!-- Certification -->
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/certificate.svg" alt="Qualification" class="size-4" />
				<span class="text-[0.65rem] sm:text-xs {badgeVariants({ variant: 'secondary' })}">
					Verified Instructor
				</span>
			</div>
		</div>
	</div>

	<!-- Bio Section -->
	<div class="flex w-full flex-col gap-2">
		<p class="hyphens-auto px-2 text-sm line-clamp-3">
			{#if instructorData.bio}
				{instructorData.bio}
			{:else}
				Professional instructor ready to help you improve your skills on the slopes. Personalized
				instruction for all levels.
			{/if}
		</p>
		{#if baseLesson}
			<div class="flex w-full items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
				<div class="flex flex-col">
					<span class="text-xs text-muted-foreground">From</span>
					<div class="flex items-baseline gap-1">
						<span class="text-lg font-bold">{baseLesson.basePrice}</span>
						<span class="text-xs text-muted-foreground">{baseLesson.currency}/hr</span>
					</div>
				</div>
				<Badge variant="secondary" class="text-xs">Base rate</Badge>
			</div>
		{/if}
		<Button variant="outline" class="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
			View Profile
		</Button>
	</div>

	<!-- Star Rating (Top Right) -->
	<div class="absolute right-2 top-2 flex flex-col items-end gap-1">
		{#if totalReviews > 0}
			<StarScore score={averageRating} />
			<span class="text-[0.65rem] text-muted-foreground">
				{totalReviews} {totalReviews === 1 ? $t('instructor_review') : $t('instructor_reviews')}
			</span>
		{:else}
			<StarScore score="No reviews" />
		{/if}
	</div>
</a>
