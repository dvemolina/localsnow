<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { enhance } from '$app/forms';

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

<div class="space-y-6">
	<!-- Back Button -->
	<Button href="/admin/instructors" variant="outline" size="sm">
		← Back to Instructors
	</Button>

	<!-- Instructor Header -->
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold">
				{data.instructor.name} {data.instructor.lastName}
			</h1>
			<p class="text-muted-foreground">{data.instructor.email}</p>
			<div class="mt-2 flex gap-2">
				{#if data.instructor.isSuspended}
					<Badge variant="destructive">Suspended</Badge>
				{:else if data.instructor.isVerified}
					<Badge class="bg-green-100 text-green-800">Verified</Badge>
				{:else}
					<Badge class="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
				{/if}
				<Badge variant="outline">{data.instructor.role}</Badge>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			{#if !data.instructor.isVerified && data.instructor.qualificationUrl}
				<form method="POST" action="?/verify" use:enhance>
					<Button type="submit" class="bg-green-600 hover:bg-green-700">
						Verify Instructor
					</Button>
				</form>
				<Button variant="destructive" onclick={() => (showRejectDialog = true)}>
					Reject
				</Button>
			{/if}

			{#if data.instructor.isSuspended}
				<form method="POST" action="?/unsuspend" use:enhance>
					<Button type="submit" variant="outline">
						Unsuspend
					</Button>
				</form>
			{:else}
				<Button variant="destructive" onclick={() => (showSuspendDialog = true)}>
					Suspend
				</Button>
			{/if}
		</div>
	</div>

	<!-- Instructor Details Grid -->
	<div class="grid gap-4 md:grid-cols-2">
		<!-- Basic Information -->
		<Card>
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Phone</p>
					<p>{data.instructor.phone || 'Not provided'}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Professional Phone</p>
					<p>{data.instructor.professionalPhone || 'Not provided'}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Bio</p>
					<p class="text-sm">{data.instructor.bio || 'No bio provided'}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Joined</p>
					<p>{formatDate(data.instructor.createdAt)}</p>
				</div>
			</CardContent>
		</Card>

		<!-- Certification -->
		<Card>
			<CardHeader>
				<CardTitle>Certification</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.instructor.qualificationUrl}
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">
							Certification document uploaded
						</p>
						<a
							href={data.instructor.qualificationUrl}
							target="_blank"
							class="inline-block"
						>
							<Button variant="outline" size="sm">
								View Certificate →
							</Button>
						</a>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">
						No certification document uploaded yet
					</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Resorts -->
		<Card>
			<CardHeader>
				<CardTitle>Resorts</CardTitle>
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
						<p class="text-sm text-muted-foreground">No resorts assigned</p>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- Sports -->
		<Card>
			<CardHeader>
				<CardTitle>Sports</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					{#each data.instructor.sports as { sport }}
						<Badge>{sport.sport}</Badge>
					{:else}
						<p class="text-sm text-muted-foreground">No sports assigned</p>
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Suspension Info -->
	{#if data.instructor.isSuspended}
		<Card class="border-red-200 bg-red-50">
			<CardHeader>
				<CardTitle class="text-red-900">Suspension Details</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<div>
						<p class="text-sm font-medium">Reason:</p>
						<p class="text-sm">{data.instructor.suspensionReason}</p>
					</div>
					<div>
						<p class="text-sm font-medium">Suspended At:</p>
						<p class="text-sm">{formatDate(data.instructor.suspendedAt)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Bookings -->
	<Card>
		<CardHeader>
			<CardTitle>Booking History ({data.bookings.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Client</Table.Head>
						<Table.Head>Date</Table.Head>
						<Table.Head>Students</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Price</Table.Head>
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
								No bookings yet
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
			<CardTitle>Reviews ({data.reviews.length})</CardTitle>
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
								<p class="mt-1 text-sm">{review.comment || 'No comment'}</p>
								<p class="mt-1 text-xs text-muted-foreground">
									by {review.clientEmail}
								</p>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">No reviews yet</p>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Audit Log -->
	<Card>
		<CardHeader>
			<CardTitle>Admin Actions History</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Action</Table.Head>
						<Table.Head>Admin</Table.Head>
						<Table.Head>Details</Table.Head>
						<Table.Head>Date</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.auditLogs as log}
						<Table.Row>
							<Table.Cell class="font-medium">{log.action}</Table.Cell>
							<Table.Cell>{log.admin?.name || 'System'}</Table.Cell>
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
								No admin actions recorded
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
			<Dialog.Title>Suspend Instructor</Dialog.Title>
			<Dialog.Description>
				Provide a reason for suspending this instructor. They will not be able to receive bookings while suspended.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/suspend" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={suspendReason}
					placeholder="Reason for suspension..."
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showSuspendDialog = false)}>
						Cancel
					</Button>
					<Button type="submit" variant="destructive">
						Suspend
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
			<Dialog.Title>Reject Verification</Dialog.Title>
			<Dialog.Description>
				Provide a reason for rejecting this instructor's verification. They will be able to re-upload their certification.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/reject" use:enhance>
			<div class="space-y-4">
				<Textarea
					name="reason"
					bind:value={rejectReason}
					placeholder="Reason for rejection..."
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (showRejectDialog = false)}>
						Cancel
					</Button>
					<Button type="submit" variant="destructive">
						Reject
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
