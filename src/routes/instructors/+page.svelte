<!-- src/routes/instructors/+page.svelte -->
<script lang="ts">
	import InstructorCard from '$src/features/Instructors/components/InstructorCard.svelte';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SportSelect from '$src/features/Resorts/components/SportSelect.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { goto } from '$app/navigation';
	import { Button } from '$src/lib/components/ui/button';
	import { Input } from '$src/lib/components/ui/input';

	let { data } = $props();

	// Simple filter schema for the search form
	const filterSchema = z.object({
		resort: z.number().optional(),
		sport: z.number().optional(),
		query: z.string().optional()
	});

	// Initialize form for filters
	const form = superForm(
		{ resort: data.filters.resort, sport: data.filters.sport, query: data.filters.query },
		{
			validators: zodClient(filterSchema),
			SPA: true,
			dataType: 'json'
		}
	);

	const { form: formData, enhance } = form;

	let searchQuery = $state(data.filters.query || '');

	// Apply filters function
	async function applyFilters() {
		const params = new URLSearchParams();

		if ($formData.resort) params.set('resort', $formData.resort.toString());
		if ($formData.sport) params.set('sport', $formData.sport.toString());
		if (searchQuery) params.set('q', searchQuery);

		goto(`/instructors?${params.toString()}`);
	}

	// Clear all filters
	function clearFilters() {
		$formData.resort = undefined;
		$formData.sport = undefined;
		searchQuery = '';
		goto('/instructors');
	}

	const hasActiveFilters = $derived(
		!!$formData.resort || !!$formData.sport || !!searchQuery
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

	<!-- Filters Section -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm">
		<h2 class="mb-3 text-base font-semibold">Filter Instructors</h2>

		<form onsubmit={applyFilters} class="space-y-3">
			<div class="grid gap-3 md:grid-cols-3">
				<!-- Search by Name -->
				<div>
					<label for="search" class="mb-1 block text-sm font-medium">Search by Name</label>
					<Input
						id="search"
						type="text"
						bind:value={searchQuery}
						placeholder="Instructor name..."
						class="w-full"
					/>
				</div>

				<!-- Resort Filter -->
				<div>
					<SearchResort {form} name="resort" label="Filter by Resort" />
				</div>

				<!-- Sport Filter -->
				<div>
					<SportSelect {form} name="sport" useIds={true} />
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-2">
				<Button type="submit" class="flex-1 md:flex-initial">Apply Filters</Button>
				{#if hasActiveFilters}
					<Button type="button" variant="outline" onclick={clearFilters}>Clear Filters</Button>
				{/if}
			</div>
		</form>
	</div>

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
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {#each data.instructors as instructor}
            <InstructorCard 
                instructorData={instructor} 
                baseLesson={instructor.baseLesson}
            />
        {/each}
    </div>
{:else}
		<!-- Empty State -->
		<div class="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
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
			{#if hasActiveFilters}
				<Button variant="outline" onclick={clearFilters}>Clear All Filters</Button>
			{/if}
		</div>
	{/if}
</section>