<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	let showSuspendDialog = $state(false);
	let showRejectDialog = $state(false);
	let suspendReason = $state('');
	let rejectReason = $state('');

	function formatDate(date: Date | string | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<!-- Back Button -->
	<Button href="/admin/schools" variant="outline" size="sm">
		← {$t('button_back_to_schools')}
	</Button>

	<!-- School Header -->
	<div class="flex items-start justify-between mb-8">
		<div class="flex items-center gap-4">
			{#if data.school.logo}
				<img src={data.school.logo} alt={data.school.name} class="h-16 w-16 rounded-lg object-cover" />
			{/if}
			<div>
				<h1 class="title2 mb-2">
					{data.school.name}
				</h1>
				<p class="text-muted-foreground">{data.school.schoolEmail || $t('schools_admin_no_email')}</p>
				<div class="mt-2 flex gap-2">
					{#if data.school.isSuspended}
						<Badge variant="destructive">{$t('status_suspended')}</Badge>
					{:else if data.school.isVerified}
						<Badge class="bg-green-100 text-green-800">{$t('status_verified')}</Badge>
					{:else}
						<Badge class="bg-yellow-100 text-yellow-800">{$t('status_pending_verification')}</Badge>
					{/if}
					{#if data.school.isPublished}
						<Badge variant="outline">{$t('status_published')}</Badge>
					{:else}
						<Badge variant="outline" class="bg-gray-100">{$t('status_unpublished')}</Badge>
					{/if}
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2 flex-wrap justify-end">
			{#if !data.school.isVerified}
				<form method="POST" action="?/verify" use:enhance>
					<Button type="submit" class="bg-green-600 hover:bg-green-700">
						{$t('schools_button_verify_school')}
					</Button>
				</form>
				<Button variant="destructive" onclick={() => (showRejectDialog = true)}>
					{$t('schools_button_reject')}
				</Button>
			{/if}

			{#if data.school.isSuspended}
				<form method="POST" action="?/unsuspend" use:enhance>
					<Button type="submit" variant="outline">
						{$t('schools_button_unsuspend')}
					</Button>
				</form>
			{:else}
				<Button variant="destructive" onclick={() => (showSuspendDialog = true)}>
					{$t('schools_button_suspend')}
				</Button>
			{/if}

			{#if data.school.isPublished}
				<form method="POST" action="?/unpublish" use:enhance>
					<Button type="submit" variant="outline">
						{$t('schools_button_unpublish')}
					</Button>
				</form>
			{:else}
				<form method="POST" action="?/publish" use:enhance>
					<Button type="submit" variant="outline">
						{$t('schools_button_publish')}
					</Button>
				</form>
			{/if}
		</div>
	</div>

	<!-- School Details Grid -->
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Basic Information -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('schools_admin_basic_information')}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$t('form_label_phone')}</p>
					<p>{data.school.countryCode ? `+${data.school.countryCode} ` : ''}{data.school.schoolPhone || $t('schools_admin_not_provided')}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$t('form_label_bio')}</p>
					<p class="text-sm">{data.school.bio || $t('schools_admin_no_bio')}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$t('schools_admin_owner')}</p>
					<p>{data.school.owner?.name} {data.school.owner?.lastName || ''} ({data.school.owner?.email})</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$t('schools_admin_slug')}</p>
					<p class="font-mono text-sm">{data.school.slug}</p>
				</div>
			</CardContent>
		</Card>

		<!-- Resorts -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('schools_table_resorts')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					{#each data.school.resorts as { resort }}
						<Badge variant="secondary">
							{resort.name}
							<span class="ml-1 text-xs text-muted-foreground">
								({resort.region?.region}, {resort.country?.country})
							</span>
						</Badge>
					{:else}
						<p class="text-sm text-muted-foreground">{$t('schools_admin_no_resorts')}</p>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Sports -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('schools_table_sports')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					{#each data.school.sports as { sport }}
						<Badge>{sport.sport}</Badge>
					{:else}
						<p class="text-sm text-muted-foreground">{$t('schools_admin_no_sports')}</p>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Logo -->
		<Card>
			<CardHeader>
				<CardTitle>{$t('schools_admin_logo')}</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.school.logo}
					<div class="space-y-2">
						<img src={data.school.logo} alt={data.school.name} class="h-24 w-24 rounded-lg object-cover" />
						<a href={data.school.logo} target="_blank" class="inline-block">
							<Button variant="outline" size="sm">
								{$t('schools_button_view_logo')} →
							</Button>
						</a>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">{$t('schools_admin_no_logo')}</p>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- Suspension Info -->
	{#if data.school.isSuspended}
		<Card class="border-red-200 bg-red-50">
			<CardHeader>
				<CardTitle class="text-red-900">{$t('schools_admin_suspension_details')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<div>
						<p class="text-sm font-medium">{$t('admin_reason')}:</p>
						<p class="text-sm">{data.school.suspensionReason}</p>
					</div>
					<div>
						<p class="text-sm font-medium">{$t('schools_admin_suspended_at')}:</p>
						<p class="text-sm">{formatDate(data.school.suspendedAt)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- School Admins -->
	<Card>
		<CardHeader>
			<CardTitle>{$t('schools_admin_school_admins')} ({data.admins.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_name')}</Table.Head>
						<Table.Head>{$t('table_email')}</Table.Head>
						<Table.Head>{$t('schools_table_is_owner')}</Table.Head>
						<Table.Head>{$t('schools_table_accepted')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.admins as admin}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">#{admin.user?.id}</Table.Cell>
							<Table.Cell>{admin.user?.name} {admin.user?.lastName || ''}</Table.Cell>
							<Table.Cell>{admin.user?.email}</Table.Cell>
							<Table.Cell>
								{#if admin.isOwner}
									<Badge class="bg-blue-100 text-blue-800">{$t('label_yes')}</Badge>
								{:else}
									<span class="text-muted-foreground">{$t('label_no')}</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if admin.isAccepted}
									<Badge class="bg-green-100 text-green-800">{$t('label_yes')}</Badge>
								{:else}
									<Badge class="bg-yellow-100 text-yellow-800">{$t('status_pending')}</Badge>
								{/if}
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={5} class="text-center text-muted-foreground">
								{$t('schools_admin_no_admins')}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- School Instructors -->
	<Card>
		<CardHeader>
			<CardTitle>{$t('schools_admin_school_instructors')} ({data.instructors.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_name')}</Table.Head>
						<Table.Head>{$t('table_email')}</Table.Head>
						<Table.Head>{$t('schools_table_verified')}</Table.Head>
						<Table.Head>{$t('schools_table_active')}</Table.Head>
						<Table.Head>{$t('schools_table_requested_by')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.instructors as item}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">#{item.instructor?.id}</Table.Cell>
							<Table.Cell>{item.instructor?.name} {item.instructor?.lastName || ''}</Table.Cell>
							<Table.Cell>{item.instructor?.email}</Table.Cell>
							<Table.Cell>
								{#if item.instructor?.isVerified}
									<Badge class="bg-green-100 text-green-800">{$t('status_verified')}</Badge>
								{:else}
									<Badge class="bg-yellow-100 text-yellow-800">{$t('status_pending')}</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if item.isActive}
									<Badge class="bg-green-100 text-green-800">{$t('status_active')}</Badge>
								{:else}
									<Badge variant="outline">{$t('status_inactive')}</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{item.requestedBy}</Badge>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={6} class="text-center text-muted-foreground">
								{$t('schools_admin_no_instructors')}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- Audit Log -->
	<Card>
		<CardHeader>
			<CardTitle>{$t('schools_admin_actions_history')}</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('schools_table_action')}</Table.Head>
						<Table.Head>{$t('role_admin')}</Table.Head>
						<Table.Head>{$t('schools_table_details')}</Table.Head>
						<Table.Head>{$t('table_date')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.auditLogs as log}
						<Table.Row>
							<Table.Cell class="font-medium">{log.action}</Table.Cell>
							<Table.Cell>{log.admin?.name || $t('schools_admin_system')}</Table.Cell>
							<Table.Cell>
								<code class="text-xs">
									{log.details ? JSON.parse(log.details).reason || '-' : '-'}
								</code>
							</Table.Cell>
							<Table.Cell>{formatDate(log.createdAt)}</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={4} class="text-center text-muted-foreground">
								{$t('schools_admin_no_actions')}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>

<!-- Suspend Dialog -->
<Dialog.Root bind:open={showSuspendDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{$t('schools_admin_suspend_school')}</Dialog.Title>
			<Dialog.Description>
				{$t('schools_admin_suspend_description')}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/suspend" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={suspendReason}
					placeholder={$t('schools_admin_reason_placeholder')}
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showSuspendDialog = false)}>
						{$t('button_cancel')}
					</Button>
					<Button type="submit" variant="destructive">
						{$t('schools_button_suspend')}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Reject Dialog -->
<Dialog.Root bind:open={showRejectDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{$t('schools_admin_reject_verification')}</Dialog.Title>
			<Dialog.Description>
				{$t('schools_admin_reject_description')}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/reject" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={rejectReason}
					placeholder={$t('schools_admin_rejection_reason_placeholder')}
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showRejectDialog = false)}>
						{$t('button_cancel')}
					</Button>
					<Button type="submit" variant="destructive">
						{$t('schools_button_reject')}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
