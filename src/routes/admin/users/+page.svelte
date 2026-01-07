<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { useIntlayer } from 'svelte-intlayer';

	const admin = useIntlayer('admin');
	const role = useIntlayer('role');
	const button = useIntlayer('button');
	const table = useIntlayer('table');
	const status = useIntlayer('status');

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
		<h1 class="title2 mb-2">{$users.admin_user_management.value}</h1>
		<p class="text-muted-foreground">{$users.admin_user_management_desc.value}</p>
	</div>

	<Card>
		<CardContent class="pt-6">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="col-span-2">
					<Input
						bind:value={searchValue}
						placeholder={$admin.search_name_email.value}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>
				<Select.Root
					selected={{ value: roleFilter }}
					onSelectedChange={(v) => roleFilter = v?.value || 'all'}
				>
					<Select.Trigger><Select.Value placeholder={$users.table_role.value} /></Select.Trigger>
					<Select.Content>
						<Select.Item value="all">{$users.admin_all_roles.value}</Select.Item>
						<Select.Item value="client">{$users.role_client.value}</Select.Item>
						<Select.Item value="instructor-independent">{$users.role_instructor_independent.value}</Select.Item>
						<Select.Item value="instructor-school">{$users.role_instructor_school.value}</Select.Item>
						<Select.Item value="school-admin">{$role.school_admin.value}</Select.Item>
						<Select.Item value="admin">{$role.admin.value}</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<Button onclick={applyFilters} class="mt-4">{$button.apply.value}</Button>
		</CardContent>
	</Card>

	<p class="text-sm text-muted-foreground">{m.admin_showing_of({ count: data.users.length, total: data.pagination.total })} {$users.admin_users.value.toLowerCase()}</p>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$table.id.value}</Table.Head>
						<Table.Head>{$table.name.value}</Table.Head>
						<Table.Head>{$table.email.value}</Table.Head>
						<Table.Head>{$users.table_role.value}</Table.Head>
						<Table.Head>{$table.status.value}</Table.Head>
						<Table.Head>{$instructors.table_joined.value}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">#{user.id}</Table.Cell>
							<Table.Cell class="font-medium">{user.name} {user.lastName}</Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell><Badge variant="outline">{user.role || $admin.no_role.value}</Badge></Table.Cell>
							<Table.Cell>
								{#if user.isSuspended}
									<Badge variant="destructive">{$instructors.status_suspended.value}</Badge>
								{:else}
									<Badge class="bg-green-100 text-green-800">{$status.active.value}</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			{#if data.pagination.page > 1}
				<Button href="/admin/users?page={data.pagination.page - 1}" variant="outline" size="sm">{$button.previous.value}</Button>
			{/if}
			<span class="text-sm">{m.admin_page_of({ page: data.pagination.page, total: data.pagination.totalPages })}</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/users?page={data.pagination.page + 1}" variant="outline" size="sm">{$button.next.value}</Button>
			{/if}
		</div>
	{/if}
</div>
