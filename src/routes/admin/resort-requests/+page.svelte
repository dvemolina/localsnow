<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data, form } = $props();

	// Dialog state
	let rejectDialogOpen = $state(false);
	let selectedRequest = $state<any>(null);
	let rejectionReason = $state('');
	let isSubmitting = $state(false);

	// Show toast on form result
	$effect(() => {
		if (form?.success) {
			toast.success(form.message || 'Action completed successfully');
			rejectDialogOpen = false;
			selectedRequest = null;
			rejectionReason = '';
		} else if (form?.error) {
			toast.error(form.error || 'Action failed');
		}
	});

	function getStatusBadge(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-500';
			case 'approved':
				return 'bg-green-600';
			case 'rejected':
				return 'bg-red-600';
			default:
				return 'bg-gray-500';
		}
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function openRejectDialog(request: any) {
		selectedRequest = request;
		rejectionReason = '';
		rejectDialogOpen = true;
	}

	function changeStatusFilter(status: string | null) {
		const url = new URL(page.url);
		if (status) {
			url.searchParams.set('status', status);
		} else {
			url.searchParams.delete('status');
		}
		url.searchParams.set('page', '1');
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Resort Requests - Admin - Local Snow</title>
</svelte:head>

<div class="container mx-auto py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Resort Requests</h1>
		<p class="text-muted-foreground">Manage instructor requests to add new resorts</p>
	</div>

	<!-- Statistics Cards -->
	<div class="mb-6 grid gap-4 md:grid-cols-4">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Pending</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.pending}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Approved</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-green-600">{data.stats.approved}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Rejected</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-red-600">{data.stats.rejected}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Total</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.total}</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Filters -->
	<div class="mb-4 flex gap-2">
		<Button
			variant={!data.filters.status ? 'default' : 'outline'}
			size="sm"
			onclick={() => changeStatusFilter(null)}
		>
			All
		</Button>
		<Button
			variant={data.filters.status === 'pending' ? 'default' : 'outline'}
			size="sm"
			onclick={() => changeStatusFilter('pending')}
		>
			Pending ({data.stats.pending})
		</Button>
		<Button
			variant={data.filters.status === 'approved' ? 'default' : 'outline'}
			size="sm"
			onclick={() => changeStatusFilter('approved')}
		>
			Approved
		</Button>
		<Button
			variant={data.filters.status === 'rejected' ? 'default' : 'outline'}
			size="sm"
			onclick={() => changeStatusFilter('rejected')}
		>
			Rejected
		</Button>
	</div>

	<!-- Requests Table -->
	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Resort Name</Table.Head>
						<Table.Head>Country/Region</Table.Head>
						<Table.Head>Requester</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Requested</Table.Head>
						<Table.Head>Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.requests.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="text-center text-muted-foreground">
								No resort requests found
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.requests as request}
							<Table.Row>
								<Table.Cell class="font-medium">
									{request.resortName}
									{#if request.website}
										<a
											href={request.website}
											target="_blank"
											rel="noopener noreferrer"
											class="ml-2 text-xs text-blue-600 hover:underline"
										>
											🔗 Website
										</a>
									{/if}
									{#if request.additionalInfo}
										<div class="mt-1 text-xs text-muted-foreground">
											{request.additionalInfo}
										</div>
									{/if}
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col">
										<span>{request.country?.country || 'N/A'}</span>
										{#if request.region}
											<span class="text-xs text-muted-foreground">{request.region.region}</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col">
										<span>{request.requesterName}</span>
										<span class="text-xs text-muted-foreground">{request.requesterEmail}</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge class={getStatusBadge(request.status)}>
										{request.status}
									</Badge>
									{#if request.createdResort}
										<div class="mt-1 text-xs text-muted-foreground">
											→ {request.createdResort.name}
										</div>
									{/if}
									{#if request.rejectionReason}
										<div class="mt-1 text-xs text-red-600">
											{request.rejectionReason}
										</div>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-sm">
									{formatDate(request.createdAt)}
								</Table.Cell>
								<Table.Cell>
									{#if request.status === 'pending'}
										<div class="flex gap-2">
											<form method="POST" action="?/approve">
												<input type="hidden" name="requestId" value={request.id} />
												<Button type="submit" size="sm" variant="default" class="bg-green-600">
													✓ Approve
												</Button>
											</form>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => openRejectDialog(request)}
											>
												✗ Reject
											</Button>
										</div>
									{:else}
										<span class="text-xs text-muted-foreground">
											{request.reviewedByAdmin?.name || 'System'}
											on {formatDate(request.reviewedAt || request.createdAt)}
										</span>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Pagination -->
	{#if data.pagination.totalPages > 1}
		<div class="mt-4 flex items-center justify-between">
			<div class="text-sm text-muted-foreground">
				Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
			</div>
			<div class="flex gap-2">
				{#if data.pagination.page > 1}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const url = new URL(page.url);
							url.searchParams.set('page', String(data.pagination.page - 1));
							goto(url.toString());
						}}
					>
						Previous
					</Button>
				{/if}
				{#if data.pagination.page < data.pagination.totalPages}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const url = new URL(page.url);
							url.searchParams.set('page', String(data.pagination.page + 1));
							goto(url.toString());
						}}
					>
						Next
					</Button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Reject Dialog -->
<Dialog.Root bind:open={rejectDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Reject Resort Request</Dialog.Title>
			<Dialog.Description>
				Provide a reason for rejecting the request for "{selectedRequest?.resortName}". The requester
				will be notified by email.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/reject" onsubmit={() => (isSubmitting = true)}>
			<input type="hidden" name="requestId" value={selectedRequest?.id} />

			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<Label for="reason">Rejection Reason</Label>
					<Textarea
						id="reason"
						name="reason"
						bind:value={rejectionReason}
						placeholder="e.g., This resort is not a ski resort, or the information provided is insufficient..."
						rows={4}
						required
					/>
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (rejectDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="destructive" disabled={isSubmitting || !rejectionReason}>
					{isSubmitting ? 'Rejecting...' : 'Reject Request'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
