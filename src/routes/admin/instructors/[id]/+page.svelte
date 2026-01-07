<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { enhance } from '$app/forms';
	import { useIntlayer } from 'svelte-intlayer';

	const button = useIntlayer('button');
	const status = useIntlayer('status');
	const admin = useIntlayer('admin');
	const table = useIntlayer('table');
	const role = useIntlayer('role');

	let { data } = $props();

	let showSuspendDialog = $state(false);
	let showRejectDialog = $state(false);
	let suspendReason = $state('');
	let rejectReason = $state('');

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusColor(status: string) {
		const colors: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-800',
			accepted: 'bg-blue-100 text-blue-800',
			completed: 'bg-green-100 text-green-800',
			rejected: 'bg-red-100 text-red-800',
			expired: 'bg-gray-100 text-gray-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<!-- Back Button -->
	<Button href="/admin/instructors" variant="outline" size="sm">
		← {$button.back_to_instructors.value}
	</Button>

	<!-- Instructor Header -->
	<div class="flex items-start justify-between mb-8">
		<div>
			<h1 class="title2 mb-2">
				{data.instructor.name} {data.instructor.lastName}
			</h1>
			<p class="text-muted-foreground">{data.instructor.email}</p>
			<div class="mt-2 flex gap-2">
				{#if data.instructor.isSuspended}
					<Badge variant="destructive">{$instructors.status_suspended.value}</Badge>
				{:else if data.instructor.isVerified}
					<Badge class="bg-green-100 text-green-800">{$instructors.status_verified.value}</Badge>
				{:else}
					<Badge class="bg-yellow-100 text-yellow-800">{$status.pending_verification.value}</Badge>
				{/if}
				<Badge variant="outline">{data.instructor.role}</Badge>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			{#if !data.instructor.isVerified && data.instructor.qualificationUrl}
				<form method="POST" action="?/verify" use:enhance>
					<Button type="submit" class="bg-green-600 hover:bg-green-700">
						{$instructors.button_verify_instructor.value}
					</Button>
				</form>
				<Button variant="destructive" onclick={() => (showRejectDialog = true)}>
					{$instructors.button_reject.value}
				</Button>
			{/if}

			{#if data.instructor.isSuspended}
				<form method="POST" action="?/unsuspend" use:enhance>
					<Button type="submit" variant="outline">
						{$instructors.button_unsuspend.value}
					</Button>
				</form>
			{:else}
				<Button variant="destructive" onclick={() => (showSuspendDialog = true)}>
					{$instructors.button_suspend.value}
				</Button>
			{/if}
		</div>
	</div>

	<!-- Instructor Details Grid -->
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Basic Information -->
		<Card>
			<CardHeader>
				<CardTitle>{$instructors.admin_basic_information.value}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$instructors.form_label_phone.value}</p>
					<p>{data.instructor.phone || $instructors.admin_not_provided.value}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$instructors.form_label_professional_phone.value}</p>
					<p>{data.instructor.professionalPhone || $instructors.admin_not_provided.value}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$instructors.form_label_bio.value}</p>
					<p class="text-sm">{data.instructor.bio || $instructors.admin_no_bio.value}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{$instructors.table_joined.value}</p>
					<p>{formatDate(data.instructor.createdAt)}</p>
				</div>
			</CardContent>
		</Card>

		<!-- Certification -->
		<Card>
			<CardHeader>
				<CardTitle>{$instructors.admin_certification.value}</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.instructor.qualificationUrl}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">
							{$instructors.admin_certification_uploaded.value}
						</p>
						<a
							href={data.instructor.qualificationUrl}
							target="_blank"
							class="inline-block"
						>
							<Button variant="outline" size="sm">
								{$instructors.button_view_certificate.value} →
							</Button>
						</a>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">
						{$instructors.admin_no_certification.value}
					</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Resorts -->
		<Card>
			<CardHeader>
				<CardTitle>{$instructors.table_resorts.value}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					{#each data.instructor.resorts as { resort }}
						<Badge variant="secondary">
							{resort.name}
							<span class="ml-1 text-xs text-muted-foreground">
								({resort.region.region}, {resort.country.country})
							</span>
						</Badge>
					{:else}
						<p class="text-sm text-muted-foreground">{$instructors.admin_no_resorts.value}</p>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Sports -->
		<Card>
			<CardHeader>
				<CardTitle>{$instructors.table_sports.value}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					{#each data.instructor.sports as { sport }}
						<Badge>{sport.sport}</Badge>
					{:else}
						<p class="text-sm text-muted-foreground">{$instructors.admin_no_sports.value}</p>
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Suspension Info -->
	{#if data.instructor.isSuspended}
		<Card class="border-red-200 bg-red-50">
			<CardHeader>
				<CardTitle class="text-red-900">{$instructors.admin_suspension_details.value}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<div>
						<p class="text-sm font-medium">{$admin.reason.value}:</p>
						<p class="text-sm">{data.instructor.suspensionReason}</p>
					</div>
					<div>
						<p class="text-sm font-medium">{$instructors.admin_suspended_at.value}:</p>
						<p class="text-sm">{formatDate(data.instructor.suspendedAt)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Bookings -->
	<Card>
		<CardHeader>
			<CardTitle>{$instructors.admin_booking_history.value} ({data.bookings.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$table.client.value}</Table.Head>
						<Table.Head>{$table.date.value}</Table.Head>
						<Table.Head>{$table.students.value}</Table.Head>
						<Table.Head>{$table.status.value}</Table.Head>
						<Table.Head>{$table.price.value}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.bookings as booking}
						<Table.Row>
							<Table.Cell>{booking.clientName}</Table.Cell>
							<Table.Cell>{formatDate(booking.startDate)}</Table.Cell>
							<Table.Cell>{booking.numberOfStudents}</Table.Cell>
							<Table.Cell>
								<Badge class={getStatusColor(booking.status)}>
									{booking.status}
								</Badge>
							</Table.Cell>
							<Table.Cell>€{booking.estimatedPrice}</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={5} class="text-center text-muted-foreground">
								{$instructors.admin_no_bookings.value}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- Reviews -->
	<Card>
		<CardHeader>
			<CardTitle>{$admin.reviews.value} ({data.reviews.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-3">
				{#each data.reviews as review}
					<div class="rounded-lg border p-3">
						<div class="flex items-start justify-between">
							<div>
								<div class="flex items-center gap-2">
									<div class="flex text-yellow-500">
										{'⭐'.repeat(review.rating)}
									</div>
									<span class="text-sm text-muted-foreground">
										{formatDate(review.createdAt)}
									</span>
								</div>
								<p class="mt-1 text-sm">{review.comment || $admin.no_comment.value}</p>
								<p class="mt-1 text-xs text-muted-foreground">
									{$instructors.admin_by.value} {review.clientEmail}
								</p>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">{$instructors.admin_no_reviews.value}</p>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Audit Log -->
	<Card>
		<CardHeader>
			<CardTitle>{$instructors.admin_actions_history.value}</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$instructors.table_action.value}</Table.Head>
						<Table.Head>{$role.admin.value}</Table.Head>
						<Table.Head>{$instructors.table_details.value}</Table.Head>
						<Table.Head>{$table.date.value}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.auditLogs as log}
						<Table.Row>
							<Table.Cell class="font-medium">{log.action}</Table.Cell>
							<Table.Cell>{log.admin?.name || $instructors.admin_system.value}</Table.Cell>
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
								{$instructors.admin_no_actions.value}
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
			<Dialog.Title>{$instructors.admin_suspend_instructor.value}</Dialog.Title>
			<Dialog.Description>
				{$instructors.admin_suspend_description.value}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/suspend" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={suspendReason}
					placeholder={$instructors.admin_reason_placeholder.value}
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showSuspendDialog = false)}>
						{$button.cancel.value}
					</Button>
					<Button type="submit" variant="destructive">
						{$instructors.button_suspend.value}
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
			<Dialog.Title>{$instructors.admin_reject_verification.value}</Dialog.Title>
			<Dialog.Description>
				{$instructors.admin_reject_description.value}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/reject" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={rejectReason}
					placeholder={$instructors.admin_rejection_reason_placeholder.value}
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showRejectDialog = false)}>
						{$button.cancel.value}
					</Button>
					<Button type="submit" variant="destructive">
						{$instructors.button_reject.value}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
