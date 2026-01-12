<script lang="ts">
	import { goto } from '$app/navigation';

	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	// 🔹 Svelte 5 state
	let searchValue = $state(data.filters.search ?? '');
	let countryValue = $state(data.filters.country ?? '');
	let regionValue = $state(data.filters.region ?? '');

	function applyFilters() {
		const params = new URLSearchParams();

		if (searchValue) params.set('search', searchValue);
		if (countryValue) params.set('country', countryValue);
		if (regionValue) params.set('region', regionValue);

		goto(`/admin/resorts?${params.toString()}`);
	}

	function clearFilters() {
		searchValue = '';
		countryValue = '';
		regionValue = '';
		goto('/admin/resorts');
	}

	// 🔹 onValueChange gets a plain string
	function handleCountryChange(value: string) {
		countryValue = value || '';
		regionValue = ''; // reset region when country changes
		applyFilters();
	}

	function handleRegionChange(value: string) {
		regionValue = value || '';
		applyFilters();
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams();

		if (searchValue) params.set('search', searchValue);
		if (countryValue) params.set('country', countryValue);
		if (regionValue) params.set('region', regionValue);
		params.set('page', pageNum.toString());

		goto(`/admin/resorts?${params.toString()}`);
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="title2 mb-2">{$t('resorts_admin_resort_management')}</h1>
			<p class="text-muted-foreground">
				{$t('resorts_admin_resort_management_desc')}
			</p>
		</div>
		<Button href="/admin/resorts/create">
			{$t('admin_create_resort')}
		</Button>
	</div>

	<!-- Filters -->
	<Card>
		<CardContent class="p-4">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					applyFilters();
				}}
				class="flex flex-col gap-4 md:flex-row"
			>
				<!-- Search -->
				<div class="flex-1">
					<Input
						type="text"
						placeholder={$t('resorts_admin_search_resorts')}
						bind:value={searchValue}
					/>
				</div>

				<!-- Country Filter -->
				<div class="w-full md:w-48">
					<Select.Root
						type="single"
						value={countryValue}
						onValueChange={handleCountryChange}
					>
						<Select.Trigger>
							{countryValue
								? data.countries.find((c) => c.id.toString() === countryValue)?.country
								: $t('admin_filter_country')}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">
								{$t('resorts_admin_all_countries')}
							</Select.Item>
							{#each data.countries as country}
								<Select.Item value={country.id.toString()}>
									{country.country}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Region Filter -->
				<div class="w-full md:w-48">
					<Select.Root
						type="single"
						value={regionValue}
						onValueChange={handleRegionChange}
						disabled={!countryValue}
					>
						<Select.Trigger>
							{regionValue
								? data.regions.find((r) => r.id.toString() === regionValue)?.region
								: $t('admin_filter_region')}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">
								{$t('resorts_admin_all_regions')}
							</Select.Item>
							{#each data.regions as region}
								<Select.Item value={region.id.toString()}>
									{region.region}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<Button type="submit">{$t('button_apply')}</Button>
				{#if data.filters.search || data.filters.country || data.filters.region}
					<Button type="button" variant="outline" onclick={clearFilters}>
						{$t('button_clear')}
					</Button>
				{/if}
			</form>
		</CardContent>
	</Card>

	<!-- Results Table -->
	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_name')}</Table.Head>
						<Table.Head>{$t('resorts_table_region')}</Table.Head>
						<Table.Head>{$t('resorts_table_country')}</Table.Head>
						<Table.Head>{$t('resorts_table_image')}</Table.Head>
						<Table.Head>{$t('table_actions')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.resorts.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="text-center text-muted-foreground">
								{$t('resorts_admin_no_resorts_found')}
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.resorts as resort}
							<Table.Row>
								<Table.Cell class="font-mono text-xs text-muted-foreground">
									#{resort.id}
								</Table.Cell>
								<Table.Cell class="font-medium">{resort.name}</Table.Cell>
								<Table.Cell>
									{#if resort.region}
										{resort.region.region}
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{resort.country.country}</Badge>
								</Table.Cell>
								<Table.Cell>
									{#if resort.image}
										<div class="flex items-center gap-2">
											<img
												src={resort.image}
												alt={resort.name}
												class="h-8 w-12 rounded object-cover"
											/>
											<span class="text-xs text-muted-foreground">{$t('resorts_admin_set')}</span>
										</div>
									{:else}
										<span class="text-xs text-muted-foreground">{$t('admin_no_image')}</span>
									{/if}
								</Table.Cell>
								<Table.Cell>
									<div class="flex gap-2">
										<Button href="/admin/resorts/{resort.id}/edit" size="sm" variant="outline">
											{$t('button_edit')}
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- Pagination -->
	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				{m.admin_showing_results({
					start: (data.pagination.page - 1) * data.pagination.perPage + 1,
					end: Math.min(data.pagination.page * data.pagination.perPage, data.pagination.totalCount),
					total: data.pagination.totalCount
				})}
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={data.pagination.page === 1}
					onclick={() => goToPage(data.pagination.page - 1)}
				>
					{$t('button_previous')}
				</Button>
				<div class="flex items-center gap-1">
					{#if data.pagination.page > 3}
						<Button variant="outline" size="sm" onclick={() => goToPage(1)}>1</Button>
						<span class="px-2">...</span>
					{/if}
					{#each Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
						const start = Math.max(1, Math.min(data.pagination.page - 2, data.pagination.totalPages - 4));
						return start + i;
					}) as pageNum}
						{#if pageNum <= data.pagination.totalPages}
							<Button
								variant={pageNum === data.pagination.page ? 'default' : 'outline'}
								size="sm"
								onclick={() => goToPage(pageNum)}
							>
								{pageNum}
							</Button>
						{/if}
					{/each}
					{#if data.pagination.page < data.pagination.totalPages - 2}
						<span class="px-2">...</span>
						<Button variant="outline" size="sm" onclick={() => goToPage(data.pagination.totalPages)}>
							{data.pagination.totalPages}
						</Button>
					{/if}
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={data.pagination.page === data.pagination.totalPages}
					onclick={() => goToPage(data.pagination.page + 1)}
				>
					{$t('button_next')}
				</Button>
			</div>
		</div>
	{/if}
</div>
