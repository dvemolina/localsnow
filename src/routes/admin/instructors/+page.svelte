<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	let searchValue = $state(data.filters.search || '');
	let verifiedFilter = $state(data.filters.verified || 'all');
	let suspendedFilter = $state(data.filters.suspended || 'all');

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		if (verifiedFilter !== 'all') params.set('verified', verifiedFilter);
		if (suspendedFilter !== 'all') params.set('suspended', suspendedFilter);

		goto(`/admin/instructors?${params.toString()}`);
	}

	function clearFilters() {
		searchValue = '';
		verifiedFilter = 'all';
		suspendedFilter = 'all';
		goto('/admin/instructors');
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
		<h1 class="title2 mb-2">{m["admin.instructors.admin_instructor_management"]()}</h1>
		<p class="text-muted-foreground">{m["admin.instructors.admin_instructor_management_desc"]()}</p>
	</div>

	<!-- Filters -->
	<Card>
		<CardHeader>
			<CardTitle>{m["admin.instructors.admin_filters"]()}</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-4">
				<div class="col-span-2">
					<label for="search" class="text-sm font-medium">{m["admin.instructors.form_label_search"]()}</label>
					<Input
						id="search"
						bind:value={searchValue}
						placeholder={m.admin_search_name_email()}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>

				<div>
					<label for="verified" class="text-sm font-medium">{m["admin.instructors.admin_verification_status"]()}</label>
					<Select.Root
						selected={{ value: verifiedFilter }}
						onSelectedChange={(v) => verifiedFilter = v?.value || 'all'}
					>
						<Select.Trigger id="verified">
							<Select.Value placeholder={m["admin.instructors.filter_all"]()} />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">{m["admin.instructors.filter_all"]()}</Select.Item>
							<Select.Item value="true">{m["admin.instructors.status_verified"]()}</Select.Item>
							<Select.Item value="false">{m.status_pending()}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<label for="suspended" class="text-sm font-medium">{m["admin.instructors.admin_account_status"]()}</label>
					<Select.Root
						selected={{ value: suspendedFilter }}
						onSelectedChange={(v) => suspendedFilter = v?.value || 'all'}
					>
						<Select.Trigger id="suspended">
							<Select.Value placeholder={m["admin.instructors.filter_all"]()} />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">{m["admin.instructors.filter_all"]()}</Select.Item>
							<Select.Item value="false">{m.status_active()}</Select.Item>
							<Select.Item value="true">{m["admin.instructors.status_suspended"]()}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="mt-4 flex gap-2">
				<Button onclick={applyFilters}>{m.button_apply_filters()}</Button>
				<Button variant="outline" onclick={clearFilters}>{m.button_clear()}</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Results Summary -->
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			{m.admin_showing_of({ count: data.instructors.length, total: data.pagination.total })} {m.admin_instructors().toLowerCase()}
		</p>
		<div class="text-sm text-muted-foreground">
			{m.admin_page_of({ page: data.pagination.page, total: data.pagination.totalPages })}
		</div>
	</div>

	<!-- Instructors Table -->
	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.table_id()}</Table.Head>
						<Table.Head>{m.table_name()}</Table.Head>
						<Table.Head>{m.table_email()}</Table.Head>
						<Table.Head>{m["admin.instructors.table_resorts"]()}</Table.Head>
						<Table.Head>{m["admin.instructors.table_sports"]()}</Table.Head>
						<Table.Head>{m.admin_bookings()}</Table.Head>
						<Table.Head>{m.table_rating()}</Table.Head>
						<Table.Head>{m.table_status()}</Table.Head>
						<Table.Head>{m["admin.instructors.table_joined"]()}</Table.Head>
						<Table.Head>{m.table_actions()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.instructors as instructor}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								#{instructor.id}
							</Table.Cell>
							<Table.Cell class="font-medium">
								{instructor.name} {instructor.lastName}
							</Table.Cell>
							<Table.Cell>{instructor.email}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each instructor.resorts.slice(0, 2) as { resort }}
										<Badge variant="outline" class="text-xs">
											{resort.name}
										</Badge>
									{/each}
									{#if instructor.resorts.length > 2}
										<Badge variant="outline" class="text-xs">
											+{instructor.resorts.length - 2}
										</Badge>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each instructor.sports as { sport }}
										<Badge variant="outline" class="text-xs">
											{sport.sport}
										</Badge>
									{/each}
								</div>
							</Table.Cell>
							<Table.Cell>{instructor.stats.totalBookings}</Table.Cell>
							<Table.Cell>
								{#if instructor.stats.totalReviews > 0}
									<div class="flex items-center gap-1">
										<span>{Number(instructor.stats.avgRating).toFixed(1)}</span>
										<span class="text-yellow-500 text-xs">⭐</span>
										<span class="text-xs text-muted-foreground">
											({instructor.stats.totalReviews})
										</span>
									</div>
								{:else}
									<span class="text-muted-foreground">{m["admin.instructors.admin_no_reviews"]()}</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col gap-1">
									{#if instructor.isSuspended}
										<Badge variant="destructive">{m["admin.instructors.status_suspended"]()}</Badge>
									{:else if instructor.isVerified}
										<Badge class="bg-green-100 text-green-800">{m["admin.instructors.status_verified"]()}</Badge>
									{:else}
										<Badge class="bg-yellow-100 text-yellow-800">{m.status_pending()}</Badge>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								{formatDate(instructor.createdAt)}
							</Table.Cell>
							<Table.Cell>
								<Button href="/admin/instructors/{instructor.id}" size="sm" variant="outline">
									{m.button_view()}
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
					href="/admin/instructors?page={data.pagination.page - 1}"
					variant="outline"
					size="sm"
				>
					{m.button_previous()}
				</Button>
			{/if}

			<span class="text-sm">
				{m.admin_page_of({ page: data.pagination.page, total: data.pagination.totalPages })}
			</span>

			{#if data.pagination.page < data.pagination.totalPages}
				<Button
					href="/admin/instructors?page={data.pagination.page + 1}"
					variant="outline"
					size="sm"
				>
					{m.button_next()}
				</Button>
			{/if}
		</div>
	{/if}
</div>
