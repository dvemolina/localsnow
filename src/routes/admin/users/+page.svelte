<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';

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
		<h1 class="title2 mb-2">User Management</h1>
		<p class="text-muted-foreground">Manage all platform users</p>
	</div>

	<Card>
		<CardContent class="pt-6">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="col-span-2">
					<Input
						bind:value={searchValue}
						placeholder="Search name or email..."
						onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>
				<Select.Root
					selected={{ value: roleFilter }}
					onSelectedChange={(v) => roleFilter = v?.value || 'all'}
				>
					<Select.Trigger><Select.Value placeholder="Role" /></Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Roles</Select.Item>
						<Select.Item value="client">Client</Select.Item>
						<Select.Item value="instructor-independent">Instructor (Independent)</Select.Item>
						<Select.Item value="instructor-school">Instructor (School)</Select.Item>
						<Select.Item value="school-admin">School Admin</Select.Item>
						<Select.Item value="admin">Admin</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<Button onclick={applyFilters} class="mt-4">Apply</Button>
		</CardContent>
	</Card>

	<p class="text-sm text-muted-foreground">Showing {data.users.length} of {data.pagination.total} users</p>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Joined</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">#{user.id}</Table.Cell>
							<Table.Cell class="font-medium">{user.name} {user.lastName}</Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell><Badge variant="outline">{user.role || 'No role'}</Badge></Table.Cell>
							<Table.Cell>
								{#if user.isSuspended}
									<Badge variant="destructive">Suspended</Badge>
								{:else}
									<Badge class="bg-green-100 text-green-800">Active</Badge>
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
				<Button href="/admin/users?page={data.pagination.page - 1}" variant="outline" size="sm">Previous</Button>
			{/if}
			<span class="text-sm">Page {data.pagination.page} of {data.pagination.totalPages}</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/users?page={data.pagination.page + 1}" variant="outline" size="sm">Next</Button>
			{/if}
		</div>
	{/if}
</div>
