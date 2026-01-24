<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	let searchValue = $state(data.filters.search || '');
	let roleFilter = $state(data.filters.role || 'all');

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		if (roleFilter !== 'all') params.set('role', roleFilter);
		goto(`/admin/users?${params.toString()}`);
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{$t('users_admin_user_management')}</h1>
		<p class="text-muted-foreground">{$t('users_admin_user_management_desc')}</p>
	</div>

	<Card>
		<CardContent class="pt-6">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="col-span-2">
					<Input
						bind:value={searchValue}
						placeholder={$t('admin_search_name_email')}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>
				<Select.Root
					selected={{ value: roleFilter }}
					onSelectedChange={(v) => roleFilter = v?.value || 'all'}
				>
					<Select.Trigger><Select.Value placeholder={$t('users_table_role')} /></Select.Trigger>
					<Select.Content>
						<Select.Item value="all">{$t('users_admin_all_roles')}</Select.Item>
						<Select.Item value="client">{$t('users_role_client')}</Select.Item>
						<Select.Item value="instructor-independent">{$t('users_role_instructor_independent')}</Select.Item>
						<Select.Item value="instructor-school">{$t('users_role_instructor_school')}</Select.Item>
						<Select.Item value="school-admin">{$t('role_school_admin')}</Select.Item>
						<Select.Item value="admin">{$t('role_admin')}</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<Button onclick={applyFilters} class="mt-4">{$t('button_apply')}</Button>
		</CardContent>
	</Card>

	<p class="text-sm text-muted-foreground">{$t('admin_showing_of', { values: { count: data.users.length, total: data.pagination.total } })} {$t('users_admin_users').toLowerCase()}</p>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_name')}</Table.Head>
						<Table.Head>{$t('table_email')}</Table.Head>
						<Table.Head>{$t('users_table_role')}</Table.Head>
						<Table.Head>{$t('table_status')}</Table.Head>
						<Table.Head>{$t('instructors_table_joined')}</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">#{user.id}</Table.Cell>
							<Table.Cell class="font-medium">{user.name} {user.lastName}</Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell><Badge variant="outline">{user.role || $t('admin_no_role')}</Badge></Table.Cell>
							<Table.Cell>
								{#if user.isSuspended}
									<Badge variant="destructive">{$t('status_suspended')}</Badge>
								{:else}
									<Badge class="bg-green-100 text-green-800">{$t('status_active')}</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
							<Table.Cell class="text-right">
								<Button href="/admin/users/{user.id}" variant="outline" size="sm">
									View Details
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			{#if data.pagination.page > 1}
				<Button href="/admin/users?page={data.pagination.page - 1}" variant="outline" size="sm">{$t('button_previous')}</Button>
			{/if}
			<span class="text-sm">{$t('admin_page_of', { values: { page: data.pagination.page, total: data.pagination.totalPages } })}</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/users?page={data.pagination.page + 1}" variant="outline" size="sm">{$t('button_next')}</Button>
			{/if}
		</div>
	{/if}
</div>
