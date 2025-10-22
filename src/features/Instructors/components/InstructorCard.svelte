<script>
	import StarScore from '$src/lib/components/shared/StarScore.svelte';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge, badgeVariants } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';

	let { instructorData } = $props();
	console.log('InstructorData', instructorData )

	// Map sport IDs to labels
	const sportLabels = {
		1: 'Ski',
		2: 'Snowboard',
		3: 'Telemark'
	};
	
	const isIndependent = instructorData.role === 'instructor-independent';

</script>

<a
	href="/instructors/{instructorData.id}"
	class="card group relative flex flex-col justify-between gap-3 rounded-md border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-md w-full min-w-[265px] sm:max-w-[717px] md:max-w-[435px]"
>
	<div class="flex w-full flex-row gap-3">
		<Avatar.Root class="mt-2 size-24 border border-border sm:size-32">
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

			<!-- Teaching Location -->
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/ski-resort.svg" alt="Resort" class="size-4" />
				<span class="text-[0.65rem] sm:text-xs {badgeVariants({ variant: 'secondary' })}">
					{#if instructorData.resorts && instructorData.resorts.length > 0}
						{instructorData.resorts.length} Resort{instructorData.resorts.length > 1 ? 's' : ''}
					{:else}
						Multiple Locations
					{/if}
				</span>
			</div>

			<!-- Instructor Type -->
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/service.svg" alt="Instructor Type" class="size-4" />
				{#if isIndependent}
					<Badge variant="secondary" class="text-[0.65rem] sm:text-xs">Independent</Badge>
				{:else}
					<Badge variant="secondary" class="text-[0.65rem] sm:text-xs">School Instructor</Badge>
				{/if}
			</div>

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
		<Button variant="outline" class="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
			View Profile
		</Button>
	</div>

	<!-- Star Rating (Top Right) -->
	<div class="absolute right-2 top-2">
		<StarScore score={4.8} />
	</div>
</a>
