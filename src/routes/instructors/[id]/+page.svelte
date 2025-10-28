<!-- src/routes/instructors/[id]/+page.svelte -->
<script lang="ts">
	import StarScore from '$src/lib/components/shared/StarScore.svelte';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import BookingRequestDialog from '$src/features/Bookings/components/BookingRequestDialog.svelte';
	import SimplePriceDisplay from '$src/features/Pricing/components/SimplePriceDisplay.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let showBookingDialog = $state(false);

	const instructor = data.instructor;
	const sports = data.sports;
	const resorts = data.resorts;

	const isAuthenticated = !!data.user; // Will be true if user exists

	$effect(() => {
		// Check if auth_success parameter exists
		const authSuccess = page.url.searchParams.get('auth_success');
		
		if (authSuccess === 'true' && isAuthenticated) {
			// Open the dialog automatically
			showBookingDialog = true;
			
			// Clean up the URL by removing the auth_success parameter
			const newUrl = new URL(page.url);
			newUrl.searchParams.delete('auth_success');
			goto(newUrl.pathname + newUrl.search, { replaceState: true, noScroll: true });
		}
	});
	// Map sport IDs to labels
	const sportLabels: Record<number, string> = {
		1: 'Ski',
		2: 'Snowboard',
		3: 'Telemark'
	};

	const isIndependent = instructor.role === 'instructor-independent';
</script>

<svelte:head>
	<title>{instructor.name} {instructor.lastName.charAt(0)} - Ski Instructor | Local Snow</title>
	<meta
		name="description"
		content={instructor.bio ||
			`Book ski lessons with ${instructor.name} ${instructor.lastName.charAt(0)}, a certified instructor.`}
	/>
</svelte:head>

<section class="w-full">
	<!-- Back Button -->
	<div class="mb-6">
		<a 
			href="/instructors" 
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
			Back to Instructors
		</a>
	</div>

	<!-- Main Profile Card-->
	<div
		class="flex w-full flex-col gap-6 md:flex-row"
	>
		<!-- Left Column - Avatar & Basic Info -->
		<div class="flex flex-col items-center gap-4 md:w-1/3 rounded-lg border border-border bg-card p-6">
			<Avatar.Root class="size-32 border-2 border-border shadow-sm sm:size-40">
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
						{`${instructor.lastName[0]}.`}
					</h1>
					
					<!-- Star Rating -->
					<div class="flex justify-center">
						<StarScore score={5} />
					</div>
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

			<!-- Contact Button - Primary CTA -->
			<Button 
				onclick={() => (showBookingDialog = true)} 
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
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				Request a Lesson
			</Button>

			<!-- Quick Info Box -->
			<div class="mt-4 w-full space-y-3 rounded-lg bg-muted p-4">
				<div class="flex items-center gap-2">
					<img src="/icons/certificate.svg" alt="Certification" class="size-5" />
					<span class="text-sm font-medium">Verified Instructor</span>
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
					<span class="text-sm">24h response time</span>
				</div>
			</div>
		</div>



		<!-- Right Column - Detailed Info -->
		<div class="flex flex-1 flex-col space-y-6">
			{#if data.baseLesson && !data.groupTiers?.length && !data.durationPackages?.length }
				<div class="w-full rounded-lg border border-primary/20 bg-card p-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-medium">Hourly Rate</span>
						<Badge variant="secondary" class="text-xs">From</Badge>
					</div>
					<div class="flex items-baseline gap-2">
						<span class="text-2xl font-bold text-primary">{data.baseLesson.basePrice}</span>
						<span class="text-sm text-muted-foreground">{data.baseLesson.currency}/hour</span>
					</div>
					<p class="mt-2 text-xs text-muted-foreground">
						Base rate for private lessons (1 - 2 students)
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
						Sports Offered
					</h2>
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
						Teaching Location
					</h2>
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">
							{#if resorts.length > 0}
								Teaching at {resorts.length} resort{resorts.length > 1 ? 's' : ''}
							{:else}
								Multiple locations available
							{/if}
						</span>
					</div>
				</div>
			</div>

			<!-- Qualifications -->
			{#if instructor.qualificationUrl}
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
		</div>
	</div>

	<!-- Bio -->
	<div class="rounded-lg border border-border bg-card p-6 mt-8">
			{#if instructor.bio}
				<div>
					<h2 class="title4 mb-3">About {instructor.name}</h2>
					<p class="hyphens-auto text-sm leading-relaxed text-muted-foreground">
						{instructor.bio}
					</p>
				</div>
			{:else}
				<div>
					<h2 class="title4 mb-3">About {instructor.name}</h2>
					<p class="hyphens-auto text-sm leading-relaxed text-muted-foreground">
						Professional ski instructor ready to help you improve your skills on the slopes. Whether
						you're a beginner or looking to refine your technique, I provide personalized
						instruction tailored to your goals.
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
					What to Expect
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
						<span>Certified professional instruction</span>
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
						<span>Personalized lessons for all skill levels</span>
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
						<span>Focus on technique and safety</span>
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
						<span>Flexible scheduling to fit your needs</span>
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
	<!-- Contact Button - Primary CTA -->
			<Button 
				onclick={() => (showBookingDialog = true)} 
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
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				Request a Lesson
			</Button>
</section>
<BookingRequestDialog 
	bind:open={showBookingDialog}
	instructorId={instructor.id}
	lessonId={data.baseLesson?.id}
	instructorName={instructor.name}
	baseLesson={data.baseLesson}
	isAuthenticated={isAuthenticated}
/>