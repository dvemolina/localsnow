<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';

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
		← {m.button_back_to_instructors()}
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
					<Badge variant="destructive">{m["admin.instructors.status_suspended"]()}</Badge>
				{:else if data.instructor.isVerified}
					<Badge class="bg-green-100 text-green-800">{m["admin.instructors.status_verified"]()}</Badge>
				{:else}
					<Badge class="bg-yellow-100 text-yellow-800">{m.status_pending_verification()}</Badge>
				{/if}
				<Badge variant="outline">{data.instructor.role}</Badge>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			{#if !data.instructor.isVerified && data.instructor.qualificationUrl}
				<form method="POST" action="?/verify" use:enhance>
					<Button type="submit" class="bg-green-600 hover:bg-green-700">
						{m["admin.instructors.button_verify_instructor"]()}
					</Button>
				</form>
				<Button variant="destructive" onclick={() => (showRejectDialog = true)}>
					{m["admin.instructors.button_reject"]()}
				</Button>
			{/if}

			{#if data.instructor.isSuspended}
				<form method="POST" action="?/unsuspend" use:enhance>
					<Button type="submit" variant="outline">
						{m["admin.instructors.button_unsuspend"]()}
					</Button>
				</form>
			{:else}
				<Button variant="destructive" onclick={() => (showSuspendDialog = true)}>
					{m["admin.instructors.button_suspend"]()}
				</Button>
			{/if}
		</div>
	</div>

	<!-- Instructor Details Grid -->
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Basic Information -->
		<Card>
			<CardHeader>
				<CardTitle>{m["admin.instructors.admin_basic_information"]()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["admin.instructors.form_label_phone"]()}</p>
					<p>{data.instructor.phone || m["admin.instructors.admin_not_provided"]()}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["admin.instructors.form_label_professional_phone"]()}</p>
					<p>{data.instructor.professionalPhone || m["admin.instructors.admin_not_provided"]()}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["admin.instructors.form_label_bio"]()}</p>
					<p class="text-sm">{data.instructor.bio || m["admin.instructors.admin_no_bio"]()}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">{m["admin.instructors.table_joined"]()}</p>
					<p>{formatDate(data.instructor.createdAt)}</p>
				</div>
			</CardContent>
		</Card>

		<!-- Certification -->
		<Card>
			<CardHeader>
				<CardTitle>{m["admin.instructors.admin_certification"]()}</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.instructor.qualificationUrl}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">
							{m["admin.instructors.admin_certification_uploaded"]()}
						</p>
						<a
							href={data.instructor.qualificationUrl}
							target="_blank"
							class="inline-block"
						>
							<Button variant="outline" size="sm">
								{m["admin.instructors.button_view_certificate"]()} →
							</Button>
						</a>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">
						{m["admin.instructors.admin_no_certification"]()}
					</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Resorts -->
		<Card>
			<CardHeader>
				<CardTitle>{m["admin.instructors.table_resorts"]()}</CardTitle>
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
						<p class="text-sm text-muted-foreground">{m["admin.instructors.admin_no_resorts"]()}</p>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Sports -->
		<Card>
			<CardHeader>
				<CardTitle>{m["admin.instructors.table_sports"]()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					{#each data.instructor.sports as { sport }}
						<Badge>{sport.sport}</Badge>
					{:else}
						<p class="text-sm text-muted-foreground">{m["admin.instructors.admin_no_sports"]()}</p>
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Suspension Info -->
	{#if data.instructor.isSuspended}
		<Card class="border-red-200 bg-red-50">
			<CardHeader>
				<CardTitle class="text-red-900">{m["admin.instructors.admin_suspension_details"]()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<div>
						<p class="text-sm font-medium">{m.admin_reason()}:</p>
						<p class="text-sm">{data.instructor.suspensionReason}</p>
					</div>
					<div>
						<p class="text-sm font-medium">{m["admin.instructors.admin_suspended_at"]()}:</p>
						<p class="text-sm">{formatDate(data.instructor.suspendedAt)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Bookings -->
	<Card>
		<CardHeader>
			<CardTitle>{m["admin.instructors.admin_booking_history"]()} ({data.bookings.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.table_client()}</Table.Head>
						<Table.Head>{m.table_date()}</Table.Head>
						<Table.Head>{m.table_students()}</Table.Head>
						<Table.Head>{m.table_status()}</Table.Head>
						<Table.Head>{m.table_price()}</Table.Head>
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
								{m["admin.instructors.admin_no_bookings"]()}
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
			<CardTitle>{m.admin_reviews()} ({data.reviews.length})</CardTitle>
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
								<p class="mt-1 text-sm">{review.comment || m.admin_no_comment()}</p>
								<p class="mt-1 text-xs text-muted-foreground">
									{m["admin.instructors.admin_by"]()} {review.clientEmail}
								</p>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">{m["admin.instructors.admin_no_reviews"]()}</p>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Audit Log -->
	<Card>
		<CardHeader>
			<CardTitle>{m["admin.instructors.admin_actions_history"]()}</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m["admin.instructors.table_action"]()}</Table.Head>
						<Table.Head>{m.role_admin()}</Table.Head>
						<Table.Head>{m["admin.instructors.table_details"]()}</Table.Head>
						<Table.Head>{m.table_date()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.auditLogs as log}
						<Table.Row>
							<Table.Cell class="font-medium">{log.action}</Table.Cell>
							<Table.Cell>{log.admin?.name || m["admin.instructors.admin_system"]()}</Table.Cell>
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
								{m["admin.instructors.admin_no_actions"]()}
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
			<Dialog.Title>{m["admin.instructors.admin_suspend_instructor"]()}</Dialog.Title>
			<Dialog.Description>
				{m["admin.instructors.admin_suspend_description"]()}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/suspend" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={suspendReason}
					placeholder={m["admin.instructors.admin_reason_placeholder"]()}
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showSuspendDialog = false)}>
						{m.button_cancel()}
					</Button>
					<Button type="submit" variant="destructive">
						{m["admin.instructors.button_suspend"]()}
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
			<Dialog.Title>{m["admin.instructors.admin_reject_verification"]()}</Dialog.Title>
			<Dialog.Description>
				{m["admin.instructors.admin_reject_description"]()}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/reject" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={rejectReason}
					placeholder={m["admin.instructors.admin_rejection_reason_placeholder"]()}
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showRejectDialog = false)}>
						{m.button_cancel()}
					</Button>
					<Button type="submit" variant="destructive">
						{m["admin.instructors.button_reject"]()}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
