<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { t } from '$lib/i18n/i18n';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();
	const { user, auditLogs, restorableTransitions, roleData, potentialSchoolOwners } = data;

	// State management
	let selectedRole = $state<string>(user.role || user.roles?.[0] || '');
	let addRoleValue = $state<string>('');
	let preview = $state<any>(null);
	let showPreview = $state(false);
	let showConfirmDialog = $state(false);
	let showRestoreDialog = $state(false);
	let showTransferDialog = $state(false);
	let selectedArchiveId = $state<number | null>(null);
	let selectedNewOwner = $state<string>('');
	let transitionReason = $state('');
	let previewing = $state(false);
	let changing = $state(false);
	let restoring = $state(false);
	let transferring = $state(false);

	const roleOptions = [
		{ value: 'client', label: 'Client' },
		{ value: 'instructor-independent', label: 'Independent Instructor' },
		{ value: 'instructor-school', label: 'School Instructor' },
		{ value: 'school-admin', label: 'School Admin' },
		{ value: 'admin', label: 'Admin' }
	];

	const userRoles = $derived(user.roles && user.roles.length > 0 ? user.roles : user.role ? [user.role] : []);
	const availableRoles = $derived(roleOptions.filter((role) => !userRoles.includes(role.value)));

	function getRoleBadgeVariant(role: string | null) {
		if (!role) return 'secondary';
		if (role === 'admin') return 'destructive';
		if (role.includes('instructor')) return 'default';
		if (role === 'school-admin') return 'secondary';
		return 'outline';
	}

	function getBlockSeverityColor(severity: string) {
		return severity === 'hard' ? 'destructive' : 'default';
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleString();
	}

	async function handlePreview() {
		previewing = true;
		showPreview = false;

		const formData = new FormData();
		formData.append('newRole', selectedRole);

		const response = await fetch('?/previewRoleChange', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.type === 'success' && result.data) {
			preview = result.data[0].preview;
			showPreview = true;
		}

		previewing = false;
	}

	function openConfirmDialog() {
		if (preview?.validation?.canProceed) {
			showConfirmDialog = true;
		}
	}

	function openRestoreDialog(archiveId: number) {
		selectedArchiveId = archiveId;
		showRestoreDialog = true;
	}
</script>

<div class="container mx-auto max-w-6xl space-y-6 py-6">
	<!-- Header -->
	<div class="mb-8">
		<div class="mb-4">
			<Button href="/admin/users" variant="outline" size="sm"> ← Back to Users </Button>
		</div>
		<h1 class="title2 mb-2">User Details: {user.name} {user.lastName}</h1>
		<p class="text-muted-foreground">Manage user roles, permissions, and profile data</p>
	</div>

	<!-- User Info Card -->
	<Card>
		<CardHeader>
			<CardTitle>User Information</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Name</p>
					<p class="text-base">{user.name} {user.lastName}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Email</p>
					<p class="text-base">{user.email}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Current Role</p>
					<Badge variant={getRoleBadgeVariant(user.role)}>
						{user.role || 'No role assigned'}
					</Badge>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Roles</p>
					{#if userRoles.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each userRoles as role}
								<form method="POST" action="?/removeRole" use:enhance>
									<input type="hidden" name="role" value={role} />
									<Badge variant={getRoleBadgeVariant(role)} class="flex items-center gap-2">
										{role}
										<Button type="submit" variant="ghost" size="icon" class="h-5 w-5 p-0">
											×
										</Button>
									</Badge>
								</form>
							{/each}
						</div>
					{:else}
						<Badge variant="outline">No roles assigned</Badge>
					{/if}
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Status</p>
					<div class="flex gap-2">
						{#if user.isSuspended}
							<Badge variant="destructive">Suspended</Badge>
						{:else}
							<Badge variant="default">Active</Badge>
						{/if}
						{#if user.isVerified}
							<Badge variant="default">Verified</Badge>
						{/if}
						{#if user.isPublished}
							<Badge variant="default">Published</Badge>
						{/if}
					</div>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">User ID</p>
					<p class="text-base font-mono text-sm">{user.id}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Joined</p>
					<p class="text-base text-sm">{formatDate(user.createdAt)}</p>
				</div>
			</div>

			{#if user.isSuspended && user.suspensionReason}
				<div class="mt-4 rounded-md bg-destructive/10 p-3">
					<p class="text-sm font-medium">Suspension Reason:</p>
					<p class="text-sm">{user.suspensionReason}</p>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Role Management Card -->
	<Card>
		<CardHeader>
			<CardTitle>Role Management</CardTitle>
			<CardDescription>Change this user's role and manage permissions</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			{#if form?.success && form?.message}
				<div class="rounded-md bg-green-100 p-3 text-sm text-green-800">
					{form.message}
				</div>
			{/if}

			{#if form?.error}
				<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{form.error}
				</div>
			{/if}

			<div class="space-y-4">
				<div>
					<Label for="role">Select New Role</Label>
					<Select.Root
						type="single"
						bind:value={selectedRole}
						onSelectedChange={() => {
							showPreview = false;
							preview = null;
						}}
					>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select a role" />
						</Select.Trigger>
						<Select.Content>
							{#each roleOptions as role}
								<Select.Item value={role.value}>{role.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<Button
					onclick={handlePreview}
					disabled={!selectedRole || selectedRole === user.role || previewing}
					variant="outline"
					class="w-full"
				>
					{previewing ? 'Loading...' : 'Preview Impact'}
				</Button>
			</div>

			<!-- Impact Preview -->
			{#if showPreview && preview}
				<Card class="border-2 border-primary">
					<CardHeader>
						<CardTitle class="text-lg">Impact Preview</CardTitle>
						<CardDescription>Review what will happen if you proceed with this role change</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<!-- Blocking Conditions -->
						{#if preview.validation?.blocks && preview.validation.blocks.length > 0}
							<div class="space-y-2">
								<p class="text-sm font-semibold">Blocking Issues:</p>
								{#each preview.validation.blocks as block}
									<div class="rounded-md bg-destructive/10 p-3">
										<div class="flex items-start gap-2">
											<span class="text-destructive">🚫</span>
											<div class="flex-1">
												<p class="text-sm font-medium text-destructive">{block.message}</p>
												<p class="mt-1 text-xs text-muted-foreground">
													<strong>Resolution:</strong>
													{block.resolution}
												</p>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Warnings -->
						{#if preview.validation?.warnings && preview.validation.warnings.length > 0}
							<div class="space-y-2">
								<p class="text-sm font-semibold">Warnings:</p>
								{#each preview.validation.warnings as warning}
									<div class="rounded-md bg-yellow-100 p-3">
										<div class="flex items-start gap-2">
											<span>⚠️</span>
											<p class="text-sm">{warning.message}</p>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- What will happen -->
						<div class="space-y-3">
							{#if preview.willArchive && preview.willArchive.length > 0}
								<div>
									<p class="text-sm font-semibold">Will be archived:</p>
									<ul class="mt-1 list-disc space-y-1 pl-5">
										{#each preview.willArchive as item}
											<li class="text-sm">{item}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if preview.willDelete && preview.willDelete.length > 0}
								<div>
									<p class="text-sm font-semibold text-destructive">Will be removed:</p>
									<ul class="mt-1 list-disc space-y-1 pl-5">
										{#each preview.willDelete as item}
											<li class="text-sm">{item}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if preview.willCreate && preview.willCreate.length > 0}
								<div>
									<p class="text-sm font-semibold text-green-700">Will be created:</p>
									<ul class="mt-1 list-disc space-y-1 pl-5">
										{#each preview.willCreate as item}
											<li class="text-sm">{item}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>

						<!-- Action buttons -->
						{#if preview.validation?.canProceed}
							<div class="space-y-3 border-t pt-4">
								<div>
									<Label for="reason">Reason for role change (optional)</Label>
									<Textarea
										id="reason"
										bind:value={transitionReason}
										placeholder="e.g., User requested role change..."
										rows={3}
									/>
								</div>

								<Button onclick={openConfirmDialog} class="w-full">
									Proceed with Role Change
								</Button>
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}
		</CardContent>
	</Card>

	<!-- School Transfer Card (if user is school-admin) -->
	{#if userRoles.includes('school-admin') && roleData?.school && potentialSchoolOwners.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>School Ownership Transfer</CardTitle>
				<CardDescription>
					Transfer ownership of "{roleData.school.name}" to another user before changing roles
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="rounded-md bg-blue-50 p-3">
					<p class="text-sm">
						<strong>Current School:</strong>
						{roleData.school.name}
					</p>
					<p class="text-sm text-muted-foreground">
						{roleData.instructorCount} instructor(s), {roleData.adminCount} admin(s)
					</p>
				</div>

				<div>
					<Label for="newOwner">Select New Owner</Label>
					<Select.Root type="single" bind:value={selectedNewOwner}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select a new owner" />
						</Select.Trigger>
						<Select.Content>
							{#each potentialSchoolOwners as owner}
								<Select.Item value={owner.id.toString()}>
									{owner.name} {owner.lastName} ({owner.email})
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<form
					method="POST"
					action="?/transferSchool"
					use:enhance={() => {
						transferring = true;
						return async ({ update, result }) => {
							transferring = false;
							await update();
							if (result.type === 'success') {
								await invalidateAll();
							}
						};
					}}
				>
					<input type="hidden" name="schoolId" value={roleData.school.id} />
					<input type="hidden" name="newOwnerId" value={selectedNewOwner} />
					<Button type="submit" disabled={!selectedNewOwner || transferring} class="w-full">
						{transferring ? 'Transferring...' : 'Transfer School Ownership'}
					</Button>
				</form>
			</CardContent>
		</Card>
	{/if}

	<!-- Restore Previous Role Card -->
	{#if restorableTransitions.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Restore Previous Role</CardTitle>
				<CardDescription>
					Restore this user to a previous role within the 90-day window
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
				{#each restorableTransitions as transition}
					<div class="flex items-center justify-between rounded-md border p-3">
						<div>
							<p class="text-sm font-medium">
								{transition.fromRole} → {transition.toRole}
							</p>
							<p class="text-xs text-muted-foreground">
								Changed on {formatDate(transition.transitionDate)} • Expires on {formatDate(
									transition.expiresAt
								)}
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							onclick={() => openRestoreDialog(transition.archiveId)}
						>
							Restore
						</Button>
					</div>
				{/each}
			</CardContent>
		</Card>
	{/if}

	<!-- Role-Specific Data Card -->
	{#if roleData}
		<Card>
			<CardHeader>
				<CardTitle>
					{roleData.type === 'instructor' ? 'Instructor Profile' : 'School Information'}
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if roleData.type === 'instructor'}
					<div>
						<p class="text-sm font-medium text-muted-foreground">Sports</p>
						<div class="mt-1 flex flex-wrap gap-2">
							{#each roleData.sports as sport}
								<Badge variant="outline">{sport.sport}</Badge>
							{/each}
						</div>
					</div>
					<div>
						<p class="text-sm font-medium text-muted-foreground">Resorts</p>
						<div class="mt-1 flex flex-wrap gap-2">
							{#each roleData.resorts as resort}
								<Badge variant="outline">{resort.name}</Badge>
							{/each}
						</div>
					</div>
				{:else if roleData.type === 'school' && roleData.school}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<p class="text-sm font-medium text-muted-foreground">School Name</p>
							<p class="text-base">{roleData.school.name}</p>
						</div>
						<div>
							<p class="text-sm font-medium text-muted-foreground">School Email</p>
							<p class="text-base">{roleData.school.schoolEmail || 'N/A'}</p>
						</div>
						<div>
							<p class="text-sm font-medium text-muted-foreground">Active Instructors</p>
							<p class="text-base">{roleData.instructorCount}</p>
						</div>
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Admins</p>
							<p class="text-base">{roleData.adminCount}</p>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<!-- Audit Log Card -->
	{#if auditLogs.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Recent Admin Actions</CardTitle>
				<CardDescription>Last 20 admin actions on this user</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each auditLogs as log}
						<div class="rounded-md border p-3">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<p class="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
									<p class="text-xs text-muted-foreground">
										by Admin ID {log.adminId} • {formatDate(log.createdAt)}
									</p>
									{#if log.details}
										<p class="mt-1 text-xs text-muted-foreground">
											{JSON.stringify(JSON.parse(log.details), null, 2)}
										</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Role Change Confirmation Dialog -->
<AlertDialog.Root bind:open={showConfirmDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Confirm Role Change</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to change {user.name}'s role from
				<Badge variant={getRoleBadgeVariant(user.role)} class="mx-1">{user.role}</Badge>
				to
				<Badge variant={getRoleBadgeVariant(selectedRole)} class="mx-1">{selectedRole}</Badge>?

				<div class="my-4 space-y-2 rounded-md bg-muted p-3">
					<p class="text-sm font-semibold">This will:</p>
					{#if preview?.willArchive}
						<ul class="list-disc space-y-1 pl-5 text-sm">
							{#each preview.willArchive as item}
								<li>{item}</li>
							{/each}
						</ul>
					{/if}
				</div>

				This action will be logged in the audit trail and can be reversed within 90 days.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/changeRole"
				use:enhance={() => {
					changing = true;
					showConfirmDialog = false;
					return async ({ update, result }) => {
						changing = false;
						await update();
						if (result.type === 'success') {
							await invalidateAll();
							showPreview = false;
							preview = null;
						}
					};
				}}
			>
				<input type="hidden" name="newRole" value={selectedRole} />
				<input type="hidden" name="reason" value={transitionReason} />
				<AlertDialog.Action type="submit" disabled={changing}>
					{changing ? 'Changing...' : 'Confirm Change'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Restore Role Confirmation Dialog -->
<AlertDialog.Root bind:open={showRestoreDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Confirm Role Restoration</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to restore this user's previous role and profile data? This will
				reverse the previous role change and restore all archived data.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/restoreRole"
				use:enhance={() => {
					restoring = true;
					showRestoreDialog = false;
					return async ({ update, result }) => {
						restoring = false;
						await update();
						if (result.type === 'success') {
							await invalidateAll();
						}
					};
				}}
			>
				<input type="hidden" name="archiveId" value={selectedArchiveId} />
				<AlertDialog.Action type="submit" disabled={restoring}>
					{restoring ? 'Restoring...' : 'Restore Role'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
			<div class="space-y-4">
				<div>
					<Label for="addRole">Add Additional Role</Label>
					<form method="POST" action="?/addRole" use:enhance>
						<div class="flex flex-col gap-3 md:flex-row">
							<Select.Root type="single" bind:value={addRoleValue}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Select a role to add" />
								</Select.Trigger>
								<Select.Content>
									{#each availableRoles as role}
										<Select.Item value={role.value}>{role.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="role" value={addRoleValue} />
							<Button type="submit" variant="outline" disabled={!addRoleValue}>Add Role</Button>
						</div>
					</form>
				</div>
			</div>
