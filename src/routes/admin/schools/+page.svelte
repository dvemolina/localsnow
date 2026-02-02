<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	let searchValue = $state(data.filters.search || '');
	let verifiedFilter = $state(data.filters.verified || 'all');
	let suspendedFilter = $state(data.filters.suspended || 'all');
	let publishedFilter = $state(data.filters.published || 'all');

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		if (verifiedFilter !== 'all') params.set('verified', verifiedFilter);
		if (suspendedFilter !== 'all') params.set('suspended', suspendedFilter);
		if (publishedFilter !== 'all') params.set('published', publishedFilter);

		goto(`/admin/schools?${params.toString()}`);
	}

	function clearFilters() {
		searchValue = '';
		verifiedFilter = 'all';
		suspendedFilter = 'all';
		publishedFilter = 'all';
		goto('/admin/schools');
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="title2 mb-2">{$t('schools_admin_school_management')}</h1>
		<p class="text-muted-foreground">{$t('schools_admin_school_management_desc')}</p>
	</div>

	<!-- Filters -->
	<Card>
		<CardHeader>
			<CardTitle>{$t('schools_admin_filters')}</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-5">
				<div class="col-span-2">
					<label for="search" class="text-sm font-medium">{$t('form_label_search')}</label>
					<Input
						id="search"
						bind:value={searchValue}
						placeholder={$t('schools_admin_search_placeholder')}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>

				<div>
					<label for="verified" class="text-sm font-medium">{$t('schools_admin_verification_status')}</label>
					<Select.Root
						selected={{ value: verifiedFilter }}
						onSelectedChange={(v) => verifiedFilter = v?.value || 'all'}
					>
						<Select.Trigger id="verified">
							<Select.Value placeholder={$t('filter_all')} />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">{$t('filter_all')}</Select.Item>
							<Select.Item value="true">{$t('status_verified')}</Select.Item>
							<Select.Item value="false">{$t('status_pending')}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<label for="suspended" class="text-sm font-medium">{$t('schools_admin_account_status')}</label>
					<Select.Root
						selected={{ value: suspendedFilter }}
						onSelectedChange={(v) => suspendedFilter = v?.value || 'all'}
					>
						<Select.Trigger id="suspended">
							<Select.Value placeholder={$t('filter_all')} />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">{$t('filter_all')}</Select.Item>
							<Select.Item value="false">{$t('status_active')}</Select.Item>
							<Select.Item value="true">{$t('status_suspended')}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<label for="published" class="text-sm font-medium">{$t('schools_admin_published_status')}</label>
					<Select.Root
						selected={{ value: publishedFilter }}
						onSelectedChange={(v) => publishedFilter = v?.value || 'all'}
					>
						<Select.Trigger id="published">
							<Select.Value placeholder={$t('filter_all')} />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">{$t('filter_all')}</Select.Item>
							<Select.Item value="true">{$t('status_published')}</Select.Item>
							<Select.Item value="false">{$t('status_unpublished')}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="mt-4 flex gap-2">
				<Button onclick={applyFilters}>{$t('button_apply_filters')}</Button>
				<Button variant="outline" onclick={clearFilters}>{$t('button_clear')}</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Results Summary -->
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			{$t('admin_showing_of', { values: { count: data.schools.length, total: data.pagination.total } })} {$t('admin_schools').toLowerCase()}
		</p>
		<div class="text-sm text-muted-foreground">
			{$t('admin_page_of', { values: { page: data.pagination.page, total: data.pagination.totalPages } })}
		</div>
	</div>

	<!-- Schools Table -->
	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_name')}</Table.Head>
						<Table.Head>{$t('table_email')}</Table.Head>
						<Table.Head>{$t('schools_table_resorts')}</Table.Head>
						<Table.Head>{$t('schools_table_instructors')}</Table.Head>
						<Table.Head>{$t('table_status')}</Table.Head>
						<Table.Head>{$t('table_actions')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.schools as school}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								#{school.id}
							</Table.Cell>
							<Table.Cell class="font-medium">
								<div class="flex items-center gap-2">
									{#if school.logo}
										<img src={school.logo} alt={school.name} class="h-8 w-8 rounded-full object-cover" />
									{/if}
									{school.name}
								</div>
							</Table.Cell>
							<Table.Cell>{school.schoolEmail || '-'}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each school.resorts.slice(0, 2) as { resort }}
										<Badge variant="outline" class="text-xs">
											{resort.name}
										</Badge>
									{/each}
									{#if school.resorts.length > 2}
										<Badge variant="outline" class="text-xs">
											+{school.resorts.length - 2}
										</Badge>
									{/if}
									{#if school.resorts.length === 0}
										<span class="text-muted-foreground text-xs">-</span>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>{school.stats.instructorCount}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col gap-1">
									{#if school.isSuspended}
										<Badge variant="destructive">{$t('status_suspended')}</Badge>
									{:else if school.isVerified}
										<Badge class="bg-green-100 text-green-800">{$t('status_verified')}</Badge>
									{:else}
										<Badge class="bg-yellow-100 text-yellow-800">{$t('status_pending')}</Badge>
									{/if}
									{#if !school.isPublished}
										<Badge variant="outline" class="text-xs">{$t('status_unpublished')}</Badge>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<Button href="/admin/schools/{school.id}" size="sm" variant="outline">
									{$t('button_view')}
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- Pagination -->
	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			{#if data.pagination.page > 1}
				<Button
					href="/admin/schools?page={data.pagination.page - 1}"
					variant="outline"
					size="sm"
				>
					{$t('button_previous')}
				</Button>
			{/if}

			<span class="text-sm">
				{$t('admin_page_of', { values: { page: data.pagination.page, total: data.pagination.totalPages } })}
			</span>

			{#if data.pagination.page < data.pagination.totalPages}
				<Button
					href="/admin/schools?page={data.pagination.page + 1}"
					variant="outline"
					size="sm"
				>
					{$t('button_next')}
				</Button>
			{/if}
		</div>
	{/if}
</div>
