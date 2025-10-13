<!-- src/routes/instructors/[id]/+page.svelte -->
<script lang="ts">
	import StarScore from '$src/lib/components/shared/StarScore.svelte';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import BookingRequestForm from '$src/features/Instructors/components/BookingRequestForm.svelte';

	let { data } = $props();
	let showBookingForm = $state(false);

	const instructor = data.instructor;
	const sports = data.sports; // Array of sport IDs
	const resorts = data.resorts; // Array of resort IDs

	// Map sport IDs to labels (you'll need to fetch these or pass them from server)
	const sportLabels: Record<number, string> = {
		1: 'Ski',
		2: 'Snowboard',
		3: 'Telemark'
	};

	const isIndependent = instructor.role === 'instructor-independent';
</script>

<svelte:head>
	<title>{instructor.name} {instructor.lastName} - Ski Instructor | Local Snow</title>
	<meta
		name="description"
		content={instructor.bio ||
			`Book ski lessons with ${instructor.name} ${instructor.lastName}, a certified instructor.`}
	/>
</svelte:head>

<section class="section w-full">
	<!-- Back Button -->
	<div class="mb-6">
		<a href="/instructors" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Instructors
		</a>
	</div>

	<!-- Main Profile Card -->
	<div
		class="flex w-full flex-col gap-6 rounded-lg border border-border bg-card p-6 shadow-md md:flex-row"
	>
		<!-- Left Column - Avatar & Basic Info -->
		<div class="flex flex-col items-center gap-4 md:w-1/3">
			<Avatar.Root class="size-32 border-2 border-border shadow-sm sm:size-40">
				<Avatar.Image
					src={instructor.profileImageUrl || '/local-snow-head.png'}
					alt={`${instructor.name} ${instructor.lastName}`}
				/>
				<Avatar.Fallback>{instructor.name[0]}{instructor.lastName[0]}</Avatar.Fallback>
			</Avatar.Root>

			<div class="text-center">
				<h1 class="title3">
					{instructor.name}
					{instructor.lastName}
				</h1>

				<!-- Star Rating -->
				<div class="mt-2 flex justify-center">
					<StarScore score={4.8} />
				</div>

				<!-- Instructor Type Badge -->
				<div class="mt-4">
					{#if isIndependent}
						<Badge variant="secondary" class="text-sm">Independent Instructor</Badge>
					{:else}
						<Badge variant="secondary" class="text-sm">School Instructor</Badge>
					{/if}
				</div>
			</div>

			<!-- Contact Button -->
			<Button onclick={() => (showBookingForm = !showBookingForm)} class="mt-4 w-full">
				{showBookingForm ? 'Hide Booking Form' : 'Request a Lesson'}
			</Button>

			<!-- Quick Info Box -->
			<div class="mt-4 w-full space-y-3 rounded-lg bg-muted p-4">
				<div class="flex items-center gap-2">
					<img src="/icons/certificate.svg" alt="Certification" class="size-5" />
					<span class="text-sm">Verified Instructor</span>
				</div>
				{#if instructor.phone}
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
								d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
							/>
						</svg>
						<span class="text-sm">
							+{instructor.countryCode}
							{instructor.phone}
						</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Column - Detailed Info -->
		<div class="flex-1 space-y-6">
			<!-- Sports Taught -->
			<div>
				<h2 class="title4 mb-3">Sports</h2>
				<div class="flex flex-wrap gap-2">
					{#each sports as sportId}
						<Badge variant="outline" class="text-sm">
							{sportLabels[sportId] || 'Unknown Sport'}
						</Badge>
					{/each}
				</div>
			</div>

			<!-- Location/Resort -->
			<div>
				<h2 class="title4 mb-3">Teaching Location</h2>
				<div class="flex items-center gap-2">
					<img src="/icons/ski-resort.svg" alt="Resort" class="size-5" />
					<span class="text-sm">
						{#if resorts.length > 0}
							{resorts.length} Resort{resorts.length > 1 ? 's' : ''}
						{:else}
							Multiple locations
						{/if}
					</span>
				</div>
			</div>

			<!-- Bio -->
			{#if instructor.bio}
				<div>
					<h2 class="title4 mb-3">About Me</h2>
					<p class="hyphens-auto text-sm leading-relaxed text-muted-foreground">
						{instructor.bio}
					</p>
				</div>
			{:else}
				<div>
					<h2 class="title4 mb-3">About Me</h2>
					<p class="hyphens-auto text-sm leading-relaxed text-muted-foreground">
						Professional ski instructor ready to help you improve your skills on the slopes. Whether
						you're a beginner or looking to refine your technique, I provide personalized
						instruction tailored to your goals.
					</p>
				</div>
			{/if}

			<!-- Qualifications -->
			{#if instructor.qualificationUrl}
				<div>
					<h2 class="title4 mb-3">Qualifications</h2>
					<div class="flex items-center gap-2">
						<img src="/icons/certificate.svg" alt="Certification" class="size-5" />
						<a
							href={instructor.qualificationUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-primary hover:underline"
						>
							View Certification
						</a>
					</div>
				</div>
			{/if}

			<!-- Experience -->
			<div>
				<h2 class="title4 mb-3">Experience Highlights</h2>
				<ul class="list-inside list-disc space-y-2 text-sm text-muted-foreground">
					<li>Certified professional instructor</li>
					<li>Years of teaching experience</li>
					<li>All skill levels welcome</li>
					<li>Personalized lesson plans</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Booking Request Form (Toggleable) -->
	{#if showBookingForm}
		<div class="mt-8">
			<BookingRequestForm instructorId={instructor.id} instructorName={instructor.name} />
		</div>
	{/if}

	<!-- Additional Info Section -->
	<div class="mt-8 grid gap-6 md:grid-cols-2">
		<!-- What to Expect -->
		<div class="rounded-lg border border-border bg-card p-6">
			<h2 class="title4 mb-4">What to Expect</h2>
			<ul class="space-y-3 text-sm text-muted-foreground">
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>Personalized instruction based on your skill level</span>
				</li>
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>Focus on technique and safety</span>
				</li>
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>Flexible scheduling options</span>
				</li>
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>Equipment advice and tips</span>
				</li>
			</ul>
		</div>

		<!-- Booking Info -->
		<div class="rounded-lg border border-border bg-card p-6">
			<h2 class="title4 mb-4">Booking Information</h2>
			<div class="space-y-3 text-sm text-muted-foreground">
				<p>
					<strong class="text-foreground">Lesson Types:</strong> Private and group lessons available
				</p>
				<p>
					<strong class="text-foreground">Duration:</strong> Flexible from 1 hour to full day
				</p>
				<p>
					<strong class="text-foreground">Booking:</strong> Fill out the request form and I'll get
					back to you within 24 hours
				</p>
				<p class="text-xs italic">
					Note: Final pricing and availability will be confirmed directly with the instructor
				</p>
			</div>
		</div>
	</div>
</section>