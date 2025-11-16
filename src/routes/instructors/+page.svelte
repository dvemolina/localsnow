<!-- src/routes/instructors/+page.svelte -->
<script lang="ts">
	import InstructorCard from '$src/features/Instructors/components/InstructorCard.svelte';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SportSelect from '$src/features/Resorts/components/SportSelect.svelte';
	import LanguageSelect from '$src/lib/components/shared/LanguageSelect.svelte';
	import InstructorTypeSelect from '$src/lib/components/shared/InstructorTypeSelect.svelte';
	import SortBySelect from '$src/lib/components/shared/SortBySelect.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { goto } from '$app/navigation';
	import { Button } from '$src/lib/components/ui/button';
	import { Input } from '$src/lib/components/ui/input';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';
	import * as Accordion from '$src/lib/components/ui/accordion';

	let { data } = $props();

	// Comprehensive filter schema for the search form
	const filterSchema = z.object({
		resort: z.number().optional(),
		sport: z.string().optional(),
		language: z.string().optional(),
		priceMin: z.number().optional(),
		priceMax: z.number().optional(),
		instructorType: z.string().optional(),
		sortBy: z.string().optional()
	});

	// Initialize form for filters
	const form = superForm(
		{
			resort: data.filters.resort,
			sport: data.filters.sport,
			language: data.filters.language,
			priceMin: data.filters.priceMin,
			priceMax: data.filters.priceMax,
			instructorType: data.filters.instructorType,
			sortBy: data.filters.sortBy
		},
		{
			validators: zodClient(filterSchema),
			SPA: true,
			dataType: 'json'
		}
	);

	const { form: formData, enhance } = form;

	// Verified only checkbox (separate from superform since it's a simple boolean)
	let verifiedOnly = $state(data.filters.verifiedOnly === 'true');

	// Apply filters function
	async function applyFilters() {
		const params = new URLSearchParams();

		if ($formData.resort) params.set('resort', $formData.resort.toString());
		if ($formData.sport) params.set('sport', $formData.sport);
		if ($formData.language) params.set('language', $formData.language);
		if ($formData.priceMin) params.set('priceMin', $formData.priceMin.toString());
		if ($formData.priceMax) params.set('priceMax', $formData.priceMax.toString());
		if ($formData.instructorType) params.set('instructorType', $formData.instructorType);
		if ($formData.sortBy) params.set('sortBy', $formData.sortBy);
		if (verifiedOnly) params.set('verifiedOnly', 'true');

		goto(`/instructors?${params.toString()}`);
	}

	// Clear all filters
	function clearFilters() {
		$formData.resort = undefined;
		$formData.sport = undefined;
		$formData.language = undefined;
		$formData.priceMin = undefined;
		$formData.priceMax = undefined;
		$formData.instructorType = undefined;
		$formData.sortBy = undefined;
		verifiedOnly = false;
		goto('/instructors');
	}

	const hasActiveFilters = $derived(
		!!$formData.resort ||
			!!$formData.sport ||
			!!$formData.language ||
			!!$formData.priceMin ||
			!!$formData.priceMax ||
			!!$formData.instructorType ||
			!!$formData.sortBy ||
			verifiedOnly
	);
</script>

<svelte:head>
	<title>Find Ski & Snowboard Instructors | Local Snow</title>
	<meta
		name="description"
		content="Browse certified ski and snowboard instructors at top resorts worldwide. Book directly with professional instructors - no booking fees."
	/>
</svelte:head>

<section class="w-full overflow-visible">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="title2 mb-4">Find Your Perfect Instructor</h1>
		<p class="text-muted-foreground">
			Connect directly with certified ski and snowboard instructors at top resorts
		</p>
	</div>

	<!-- Filters Section -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm overflow-visible">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-base font-semibold">Filter & Sort Instructors</h2>
			{#if hasActiveFilters}
				<Button type="button" variant="ghost" size="sm" onclick={clearFilters}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-1 h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
					Clear All
				</Button>
			{/if}
		</div>

		<form onsubmit={applyFilters} class="space-y-4 overflow-visible">
			<Accordion.Root type="multiple" value={['main', 'details']} class="overflow-visible">
				<!-- Main Filters -->
				<Accordion.Item value="main" class="relative z-10 overflow-visible">
					<Accordion.Trigger class="text-sm font-medium">Main Filters</Accordion.Trigger>
					<Accordion.Content class="space-y-3 pt-3 overflow-visible">
						<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 overflow-visible">
							<SearchResort {form} name="resort" label="Resort" countryId={data.spainCountryId} />
							<SportSelect {form} name="sport" />
							<LanguageSelect {form} name="language" />
						</div>
					</Accordion.Content>
				</Accordion.Item>

				<!-- Advanced Filters -->
				<Accordion.Item value="details" class="relative z-0 overflow-visible">
					<Accordion.Trigger class="text-sm font-medium">Advanced Filters</Accordion.Trigger>
					<Accordion.Content class="space-y-3 pt-3 overflow-visible">
						<!-- Price Range -->
						<div class="grid gap-3 md:grid-cols-2">
							<div>
								<Label class="mb-2 block text-sm">Min Price (per hour)</Label>
								<Input
									type="number"
									bind:value={$formData.priceMin}
									placeholder="Min €"
									min="0"
									class="w-full"
								/>
							</div>
							<div>
								<Label class="mb-2 block text-sm">Max Price (per hour)</Label>
								<Input
									type="number"
									bind:value={$formData.priceMax}
									placeholder="Max €"
									min="0"
									class="w-full"
								/>
							</div>
						</div>

						<!-- Instructor Type & Verified -->
						<div class="grid gap-3 md:grid-cols-2">
							<InstructorTypeSelect {form} name="instructorType" isFilter={true} />
							<div class="flex items-center space-x-2 pt-6">
								<Checkbox id="verified" bind:checked={verifiedOnly} />
								<Label for="verified" class="text-sm font-medium leading-none cursor-pointer">
									Verified Instructors Only
								</Label>
							</div>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>

			<!-- Sort & Apply -->
			<div class="flex flex-col gap-3 border-t pt-4 md:flex-row">
				<div class="flex-1">
					<SortBySelect {form} name="sortBy" />
				</div>
				<div class="flex gap-2">
					<Button type="submit" class="flex-1 md:flex-initial">
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
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						Apply Filters
					</Button>
				</div>
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