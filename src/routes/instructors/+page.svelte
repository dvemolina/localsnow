<!-- src/routes/instructors/+page.svelte -->
<script lang="ts">
	import InstructorCard from '$src/features/Instructors/components/InstructorCard.svelte';
	import InstructorFilters from '$src/features/Instructors/components/InstructorFilters.svelte';
	import { Button } from '$src/lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';

	let { data } = $props();

	// Mobile filter sheet state
	let showMobileFilters = $state(false);

	const hasActiveFilters = $derived(
		!!data.filters.sport ||
		!!data.filters.resort ||
		!!data.filters.minPrice ||
		!!data.filters.maxPrice ||
		!!data.filters.startDate ||
		!!data.filters.endDate ||
		!!data.filters.groupSize
	);
</script>

<svelte:head>
	<title>Find Ski & Snowboard Instructors | Local Snow</title>
	<meta
		name="description"
		content="Browse certified ski and snowboard instructors at top resorts worldwide. Book directly with professional instructors - no booking fees."
	/>
</svelte:head>

<section class="w-full">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="title2 mb-4">Find Your Perfect Instructor</h1>
		<p class="text-muted-foreground">
			Connect directly with certified ski and snowboard instructors at top resorts
		</p>
	</div>

	<!-- Mobile Filter Button -->
	<div class="mb-6 lg:hidden">
		<Button onclick={() => (showMobileFilters = true)} class="w-full">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 size-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
				/>
			</svg>
			Filters
			{#if hasActiveFilters}
				<span class="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
					Active
				</span>
			{/if}
		</Button>
	</div>

	<!-- Layout: Sidebar + Content -->
	<div class="flex gap-8">
		<!-- Desktop Filters Sidebar -->
		<aside class="hidden w-80 shrink-0 lg:block">
			<div class="sticky top-6 rounded-lg border border-border bg-card p-6">
				<InstructorFilters
					sports={data.sports}
					resorts={data.resorts}
					initialFilters={data.filters}
				/>
			</div>
		</aside>

		<!-- Main Content -->
		<div class="flex-1">
			<!-- Results Summary -->
			<div class="mb-6 flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					{#if data.instructors.length === 0}
						No instructors found
					{:else if data.instructors.length === 1}
						1 instructor found
					{:else}
						{data.instructors.length} instructors found
					{/if}
				</p>

				{#if hasActiveFilters}
					<p class="text-sm text-muted-foreground">Filters active</p>
				{/if}
			</div>

			<!-- Instructors Grid -->
			{#if data.instructors.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
					{#each data.instructors as instructor}
						<InstructorCard instructorData={instructor} baseLesson={instructor.baseLesson} />
					{/each}
				</div>
			{:else}
				<!-- Empty State -->
				<div
					class="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mb-4 size-16 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<h3 class="title4 mb-2">No Instructors Found</h3>
					<p class="mb-4 text-muted-foreground">
						{#if hasActiveFilters}
							Try adjusting your filters to see more results
						{:else}
							No instructors available at the moment
						{/if}
					</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Mobile Filter Sheet -->
	<Sheet.Root bind:open={showMobileFilters}>
		<Sheet.Content side="left" class="w-full overflow-y-auto sm:max-w-md">
			<Sheet.Header>
				<Sheet.Title>Filter Instructors</Sheet.Title>
			</Sheet.Header>
			<div class="mt-6">
				<InstructorFilters
					sports={data.sports}
					resorts={data.resorts}
					initialFilters={data.filters}
				/>
			</div>
		</Sheet.Content>
	</Sheet.Root>
</section>