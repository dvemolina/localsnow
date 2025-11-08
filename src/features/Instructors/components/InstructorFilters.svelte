<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Calendar } from '@lucide/svelte';

	let {
		sports = [],
		resorts = [],
		initialFilters = {}
	}: {
		sports: Array<{ id: number; name: string; slug: string }>;
		resorts: Array<{ id: number; name: string; slug: string }>;
		initialFilters?: any;
	} = $props();

	// Filter state
	let selectedSport = $state(initialFilters.sport || '');
	let selectedResort = $state(initialFilters.resort || '');
	let minPrice = $state(initialFilters.minPrice || '');
	let maxPrice = $state(initialFilters.maxPrice || '');
	let startDate = $state(initialFilters.startDate || '');
	let endDate = $state(initialFilters.endDate || '');
	let groupSize = $state(initialFilters.groupSize || '');

	// Active filters count
	let activeFiltersCount = $derived(
		[selectedSport, selectedResort, minPrice, maxPrice, startDate, endDate, groupSize].filter(
			Boolean
		).length
	);

	function applyFilters() {
		const params = new URLSearchParams();

		if (selectedSport) params.set('sport', selectedSport);
		if (selectedResort) params.set('resort', selectedResort);
		if (minPrice) params.set('minPrice', minPrice);
		if (maxPrice) params.set('maxPrice', maxPrice);
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		if (groupSize) params.set('groupSize', groupSize);

		goto(`/instructors?${params.toString()}`);
	}

	function clearFilters() {
		selectedSport = '';
		selectedResort = '';
		minPrice = '';
		maxPrice = '';
		startDate = '';
		endDate = '';
		groupSize = '';
		goto('/instructors');
	}

	function removeFilter(filterName: string) {
		switch (filterName) {
			case 'sport':
				selectedSport = '';
				break;
			case 'resort':
				selectedResort = '';
				break;
			case 'price':
				minPrice = '';
				maxPrice = '';
				break;
			case 'dates':
				startDate = '';
				endDate = '';
				break;
			case 'groupSize':
				groupSize = '';
				break;
		}
		applyFilters();
	}
</script>

<div class="space-y-6">
	<!-- Filter Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-semibold">Filters</h2>
			{#if activeFiltersCount > 0}
				<p class="text-sm text-muted-foreground">
					{activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
				</p>
			{/if}
		</div>
		{#if activeFiltersCount > 0}
			<Button variant="ghost" size="sm" onclick={clearFilters}>Clear all</Button>
		{/if}
	</div>

	<!-- Active Filters Badges -->
	{#if activeFiltersCount > 0}
		<div class="flex flex-wrap gap-2">
			{#if selectedSport}
				<Badge variant="secondary" class="gap-1">
					Sport: {sports.find((s) => s.slug === selectedSport)?.name || selectedSport}
					<button onclick={() => removeFilter('sport')} class="ml-1">×</button>
				</Badge>
			{/if}
			{#if selectedResort}
				<Badge variant="secondary" class="gap-1">
					Resort: {resorts.find((r) => r.slug === selectedResort)?.name || selectedResort}
					<button onclick={() => removeFilter('resort')} class="ml-1">×</button>
				</Badge>
			{/if}
			{#if minPrice || maxPrice}
				<Badge variant="secondary" class="gap-1">
					Price: €{minPrice || '0'} - €{maxPrice || '∞'}
					<button onclick={() => removeFilter('price')} class="ml-1">×</button>
				</Badge>
			{/if}
			{#if startDate || endDate}
				<Badge variant="secondary" class="gap-1">
					Dates: {startDate || '?'} to {endDate || '?'}
					<button onclick={() => removeFilter('dates')} class="ml-1">×</button>
				</Badge>
			{/if}
			{#if groupSize}
				<Badge variant="secondary" class="gap-1">
					Group: {groupSize} {parseInt(groupSize) === 1 ? 'person' : 'people'}
					<button onclick={() => removeFilter('groupSize')} class="ml-1">×</button>
				</Badge>
			{/if}
		</div>
	{/if}

	<!-- Filter Form -->
	<div class="space-y-4">
		<!-- Sport Filter -->
		<div class="space-y-2">
			<Label for="sport">Sport</Label>
			<Select.Root
				selected={selectedSport
					? { value: selectedSport, label: sports.find((s) => s.slug === selectedSport)?.name || '' }
					: undefined}
				onSelectedChange={(v) => {
					selectedSport = v?.value || '';
				}}
			>
				<Select.Trigger id="sport">
					<Select.Value placeholder="Select sport" />
				</Select.Trigger>
				<Select.Content>
					{#each sports as sport}
						<Select.Item value={sport.slug}>{sport.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Resort Filter -->
		<div class="space-y-2">
			<Label for="resort">Resort</Label>
			<Select.Root
				selected={selectedResort
					? {
							value: selectedResort,
							label: resorts.find((r) => r.slug === selectedResort)?.name || ''
						}
					: undefined}
				onSelectedChange={(v) => {
					selectedResort = v?.value || '';
				}}
			>
				<Select.Trigger id="resort">
					<Select.Value placeholder="Select resort" />
				</Select.Trigger>
				<Select.Content>
					{#each resorts as resort}
						<Select.Item value={resort.slug}>{resort.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Date Range -->
		<div class="space-y-2">
			<Label>Availability Dates</Label>
			<div class="grid gap-2 sm:grid-cols-2">
				<div class="space-y-1">
					<Label for="startDate" class="text-xs text-muted-foreground">From</Label>
					<Input
						id="startDate"
						type="date"
						bind:value={startDate}
						min={new Date().toISOString().split('T')[0]}
					/>
				</div>
				<div class="space-y-1">
					<Label for="endDate" class="text-xs text-muted-foreground">To</Label>
					<Input
						id="endDate"
						type="date"
						bind:value={endDate}
						min={startDate || new Date().toISOString().split('T')[0]}
					/>
				</div>
			</div>
		</div>

		<!-- Price Range -->
		<div class="space-y-2">
			<Label>Price Range (€/hour)</Label>
			<div class="grid gap-2 sm:grid-cols-2">
				<div class="space-y-1">
					<Label for="minPrice" class="text-xs text-muted-foreground">Min</Label>
					<Input
						id="minPrice"
						type="number"
						bind:value={minPrice}
						placeholder="20"
						min="0"
						step="5"
					/>
				</div>
				<div class="space-y-1">
					<Label for="maxPrice" class="text-xs text-muted-foreground">Max</Label>
					<Input
						id="maxPrice"
						type="number"
						bind:value={maxPrice}
						placeholder="100"
						min={minPrice || '0'}
						step="5"
					/>
				</div>
			</div>
		</div>

		<!-- Group Size -->
		<div class="space-y-2">
			<Label for="groupSize">Group Size</Label>
			<Input
				id="groupSize"
				type="number"
				bind:value={groupSize}
				placeholder="1-6 people"
				min="1"
				max="10"
			/>
			<p class="text-xs text-muted-foreground">
				Number of students (shows instructors who can accommodate your group)
			</p>
		</div>

		<!-- Apply Button -->
		<Button onclick={applyFilters} class="w-full">
			Apply Filters
			{#if activeFiltersCount > 0}
				<Badge variant="secondary" class="ml-2">{activeFiltersCount}</Badge>
			{/if}
		</Button>
	</div>
</div>
