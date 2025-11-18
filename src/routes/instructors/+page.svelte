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
	import { Button, buttonVariants } from '$src/lib/components/ui/button';
	import { Input } from '$src/lib/components/ui/input';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as m from '$lib/paraglide/messages';

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

	// Dialog open state
	let filtersDialogOpen = $state(false);

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

		filtersDialogOpen = false;
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

	// Remove individual filter
	function removeFilter(filterName: string) {
		if (filterName === 'verifiedOnly') {
			verifiedOnly = false;
		} else {
			($formData as any)[filterName] = undefined;
		}
		applyFilters();
	}

	const hasActiveFilters = $derived(
		!!$formData.resort ||
			!!$formData.sport ||
			!!$formData.language ||
			!!$formData.priceMin ||
			!!$formData.priceMax ||
			!!$formData.instructorType ||
			verifiedOnly
	);

	const hasAdvancedFilters = $derived(
		!!$formData.language ||
			!!$formData.priceMin ||
			!!$formData.priceMax ||
			!!$formData.instructorType ||
			verifiedOnly
	);

	// Get filter labels for display
	function getResortName(resortId: number | undefined) {
		// We'll display the resort ID for now - you could enhance this to fetch the actual name
		return resortId ? `Resort #${resortId}` : '';
	}

	function getSportName(sportId: string | undefined) {
		const sports: Record<string, string> = {
			ski: 'Ski',
			snowboard: 'Snowboard'
		};
		return sportId ? sports[sportId] || sportId : '';
	}

	function getLanguageName(langCode: string | undefined) {
		return langCode || '';
	}

	function getInstructorTypeName(type: string | undefined) {
		const types: Record<string, string> = {
			'instructor-independent': 'Independent',
			'instructor-school': 'School'
		};
		return type ? types[type] || type : '';
	}
</script>

<svelte:head>
	<title>{m.seo_meta_instructors_title()}</title>
	<meta
		name="description"
		content={m.seo_meta_instructors_description()}
	/>

	<!-- Open Graph -->
	<meta property="og:title" content={m.seo_meta_instructors_title()} />
	<meta property="og:description" content={m.seo_meta_instructors_description()} />
	<meta property="og:url" content="https://localsnow.org/instructors" />
	<meta property="og:image" content="https://localsnow.org/ski-instructor-turn.webp" />

	<!-- Twitter Card -->
	<meta name="twitter:title" content={m.seo_meta_instructors_title()} />
	<meta name="twitter:description" content={m.seo_meta_instructors_description()} />
	<meta name="twitter:image" content="https://localsnow.org/ski-instructor-turn.webp" />
</svelte:head>

<section class="w-full">
	<!-- Header -->
	<div class="mb-6 text-center">
		<h1 class="title2 mb-2">{m.instructors_page_title()}</h1>
		<p class="text-muted-foreground text-sm">
			{m.instructors_page_subtitle()}
		</p>
	</div>

	<!-- Filters Section -->
	<div class="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm overflow-visible">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-base font-semibold">{m.instructors_page_filter_sort()}</h2>
			{#if hasActiveFilters}
				<Button type="button" variant="ghost" size="sm" onclick={clearFilters}>
					{m.instructors_page_clear_all()}
				</Button>
			{/if}
		</div>

		<!-- Main Filters -->
		<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4 overflow-visible mb-4">
			<SearchResort {form} name="resort" label="Resort" countryId={data.spainCountryId} />
			<SportSelect {form} name="sport" />
			<LanguageSelect {form} name="language" />
			<SortBySelect {form} name="sortBy" />
		</div>

		<!-- Actions Row -->
		<div class="flex items-center gap-3">
			<!-- Advanced Filters Dialog -->
			<Dialog.Root bind:open={filtersDialogOpen}>
				<Dialog.Trigger class="{buttonVariants({ variant: 'outline' })} relative">
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
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
						/>
					</svg>
					{m.instructors_page_more_filters()}
					{#if hasAdvancedFilters}
						<span
							class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
						>
							{[
								$formData.priceMin,
								$formData.priceMax,
								$formData.instructorType,
								verifiedOnly
							].filter(Boolean).length}
						</span>
					{/if}
				</Dialog.Trigger>
				<Dialog.Content class="max-w-lg">
					<Dialog.Header>
						<Dialog.Title>Advanced Filters</Dialog.Title>
						<Dialog.Description>
							Refine your search with additional filters
						</Dialog.Description>
					</Dialog.Header>

					<div class="space-y-4 py-4">
						<!-- Price Range -->
						<div class="space-y-2">
							<Label class="text-sm font-medium">{m.instructors_page_price_range()}</Label>
							<div class="grid grid-cols-2 gap-3">
								<div>
									<Input
										type="number"
										bind:value={$formData.priceMin}
										placeholder="Min €"
										min="0"
										class="w-full"
									/>
								</div>
								<div>
									<Input
										type="number"
										bind:value={$formData.priceMax}
										placeholder="Max €"
										min="0"
										class="w-full"
									/>
								</div>
							</div>
						</div>

						<!-- Instructor Type -->
						<div>
							<InstructorTypeSelect {form} name="instructorType" isFilter={true} />
						</div>

						<!-- Verified Only -->
						<div class="flex items-center space-x-2">
							<Checkbox id="verified" bind:checked={verifiedOnly} />
							<Label for="verified" class="text-sm font-medium leading-none cursor-pointer">
								Verified Instructors Only
							</Label>
						</div>
					</div>

					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={clearFilters}>Clear All</Button>
						<Button type="button" onclick={applyFilters}>Apply Filters</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>

			<!-- Search Button -->
			<Button type="button" onclick={applyFilters} class="flex-1 md:flex-none">
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
				Search
			</Button>
		</div>
	</div>

	<!-- Active Filters Chips -->
	{#if hasActiveFilters}
		<div class="mb-4 flex flex-wrap items-center gap-2">
			<span class="text-muted-foreground text-sm">{m.instructors_page_active_filters()}</span>
			{#if $formData.resort}
				<Badge variant="secondary" class="gap-1">
					{getResortName($formData.resort)}
					<button
						type="button"
						onclick={() => removeFilter('resort')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			{#if $formData.sport}
				<Badge variant="secondary" class="gap-1">
					{getSportName($formData.sport)}
					<button
						type="button"
						onclick={() => removeFilter('sport')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			{#if $formData.language}
				<Badge variant="secondary" class="gap-1">
					{getLanguageName($formData.language)}
					<button
						type="button"
						onclick={() => removeFilter('language')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			{#if $formData.priceMin}
				<Badge variant="secondary" class="gap-1">
					Min: €{$formData.priceMin}
					<button
						type="button"
						onclick={() => removeFilter('priceMin')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			{#if $formData.priceMax}
				<Badge variant="secondary" class="gap-1">
					Max: €{$formData.priceMax}
					<button
						type="button"
						onclick={() => removeFilter('priceMax')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			{#if $formData.instructorType}
				<Badge variant="secondary" class="gap-1">
					{getInstructorTypeName($formData.instructorType)}
					<button
						type="button"
						onclick={() => removeFilter('instructorType')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			{#if verifiedOnly}
				<Badge variant="secondary" class="gap-1">
					Verified Only
					<button
						type="button"
						onclick={() => removeFilter('verifiedOnly')}
						class="ml-1 hover:text-destructive"
					>
						×
					</button>
				</Badge>
			{/if}
			<Button variant="ghost" size="sm" onclick={clearFilters} class="h-6 px-2 text-xs">
				Clear All
			</Button>
		</div>
	{/if}

	<!-- Results Count -->
	<div class="mb-4 flex items-center justify-between">
		<p class="text-muted-foreground text-sm">
			{#if data.instructors.length === 0}
				No instructors found
			{:else if data.instructors.length === 1}
				1 instructor found
			{:else}
				{data.instructors.length} instructors found
			{/if}
		</p>
	</div>

	<!-- Instructor Cards Grid -->
	{#if data.instructors.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="text-muted-foreground mb-4 h-16 w-16"
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
			<h3 class="mb-2 text-lg font-semibold">No instructors found</h3>
			<p class="text-muted-foreground mb-4">Try adjusting your filters to see more results</p>
			<Button onclick={clearFilters} variant="outline">Clear All Filters</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
			{#each data.instructors as instructor (instructor.id)}
				<InstructorCard instructorData={instructor} />
			{/each}
		</div>
	{/if}
</section>
