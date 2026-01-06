<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

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
		<h1 class="title2 mb-2">{m["admin.users.admin_user_management"]()}</h1>
		<p class="text-muted-foreground">{m["admin.users.admin_user_management_desc"]()}</p>
	</div>

	<Card>
		<CardContent class="pt-6">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="col-span-2">
					<Input
						bind:value={searchValue}
						placeholder={m.admin_search_name_email()}
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>
				<Select.Root
					selected={{ value: roleFilter }}
					onSelectedChange={(v) => roleFilter = v?.value || 'all'}
				>
					<Select.Trigger><Select.Value placeholder={m["admin.users.table_role"]()} /></Select.Trigger>
					<Select.Content>
						<Select.Item value="all">{m["admin.users.admin_all_roles"]()}</Select.Item>
						<Select.Item value="client">{m["admin.users.role_client"]()}</Select.Item>
						<Select.Item value="instructor-independent">{m["admin.users.role_instructor_independent"]()}</Select.Item>
						<Select.Item value="instructor-school">{m["admin.users.role_instructor_school"]()}</Select.Item>
						<Select.Item value="school-admin">{m.role_school_admin()}</Select.Item>
						<Select.Item value="admin">{m.role_admin()}</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<Button onclick={applyFilters} class="mt-4">{m.button_apply()}</Button>
		</CardContent>
	</Card>

	<p class="text-sm text-muted-foreground">{m.admin_showing_of({ count: data.users.length, total: data.pagination.total })} {m["admin.users.admin_users"]().toLowerCase()}</p>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.table_id()}</Table.Head>
						<Table.Head>{m.table_name()}</Table.Head>
						<Table.Head>{m.table_email()}</Table.Head>
						<Table.Head>{m["admin.users.table_role"]()}</Table.Head>
						<Table.Head>{m.table_status()}</Table.Head>
						<Table.Head>{m["admin.instructors.table_joined"]()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">#{user.id}</Table.Cell>
							<Table.Cell class="font-medium">{user.name} {user.lastName}</Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell><Badge variant="outline">{user.role || m.admin_no_role()}</Badge></Table.Cell>
							<Table.Cell>
								{#if user.isSuspended}
									<Badge variant="destructive">{m["admin.instructors.status_suspended"]()}</Badge>
								{:else}
									<Badge class="bg-green-100 text-green-800">{m.status_active()}</Badge>
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
				<Button href="/admin/users?page={data.pagination.page - 1}" variant="outline" size="sm">{m.button_previous()}</Button>
			{/if}
			<span class="text-sm">{m.admin_page_of({ page: data.pagination.page, total: data.pagination.totalPages })}</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/users?page={data.pagination.page + 1}" variant="outline" size="sm">{m.button_next()}</Button>
			{/if}
		</div>
	{/if}
</div>
