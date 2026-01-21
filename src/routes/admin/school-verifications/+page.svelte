<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { pendingRequests } = $derived(data);

	let selectedRequest = $state<any>(null);
	let showReviewDialog = $state(false);
	let reviewAction = $state<'approve' | 'reject'>('approve');
	let adminNotes = $state('');
	let isSubmitting = $state(false);

	function openReviewDialog(request: any, action: 'approve' | 'reject') {
		selectedRequest = request;
		reviewAction = action;
		showReviewDialog = true;
		adminNotes = '';
	}

	async function handleReview() {
		if (!selectedRequest) return;

		isSubmitting = true;
		try {
			const response = await fetch(`/api/admin/school-verifications/${selectedRequest.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: reviewAction,
					adminNotes
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success(result.message);
				showReviewDialog = false;
				selectedRequest = null;
				adminNotes = '';
				// Reload page
				window.location.reload();
			} else {
				toast.error(result.error || 'Failed to process review');
			}
		} catch (error) {
			console.error('Review error:', error);
			toast.error('Failed to process review');
		} finally {
			isSubmitting = false;
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="container mx-auto py-8 space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold">School Verification Requests</h1>
		<p class="text-muted-foreground mt-1">
			Review and approve requests from users who want to manage schools
		</p>
	</div>

	<!-- Info Card -->
	<Card.Root class="border-blue-200 bg-blue-50">
		<Card.Header>
			<Card.Title class="text-blue-900">About School Verification</Card.Title>
			<Card.Description class="text-blue-700">
				Users submit requests to get access to school profiles. Review each request carefully,
				verify their identity through the contact info they provide, and approve or reject accordingly.
				Approving grants them school-admin access.
			</Card.Description>
		</Card.Header>
	</Card.Root>

	<!-- Requests List -->
	{#if pendingRequests.length === 0}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-center py-12">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto h-12 w-12 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-medium">No pending requests</h3>
					<p class="text-muted-foreground mt-2">
						There are currently no school verification requests waiting for review
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each pendingRequests as request}
				<Card.Root>
					<Card.Header>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-2">
									<Card.Title class="text-lg">{request.schoolName}</Card.Title>
									<Badge variant="outline" class="bg-yellow-50">Pending Review</Badge>
									{#if request.existingSchool}
										<Badge variant="secondary" class="bg-blue-100 text-blue-800">
											Existing School
										</Badge>
									{:else}
										<Badge variant="outline" class="bg-green-50 text-green-700">
											New School Request
										</Badge>
									{/if}
								</div>
								{#if request.requester}
									<Card.Description>
										Requested by <strong>{request.requester.name}</strong> ({request.requester.email})
										{#if request.requester.role}
											• Current role: {request.requester.role}
										{/if}
									</Card.Description>
								{/if}
							</div>
							<div class="text-sm text-muted-foreground">
								{formatDate(request.createdAt)}
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							{#if request.resort}
								<div>
									<p class="text-sm font-medium mb-1">Resort:</p>
									<p class="text-sm">{request.resort.name}</p>
								</div>
							{/if}

							{#if request.message}
								<div>
									<p class="text-sm font-medium mb-1">Message from Requester:</p>
									<p class="text-sm bg-gray-50 p-3 rounded border">{request.message}</p>
								</div>
							{/if}

							{#if request.proofDocument}
								<div>
									<p class="text-sm font-medium mb-1">Proof Document:</p>
									<a
										href={request.proofDocument}
										target="_blank"
										class="text-sm text-blue-600 hover:underline"
									>
										View Document →
									</a>
								</div>
							{/if}

							{#if request.existingSchool}
								<div>
									<p class="text-sm font-medium mb-1">Existing School Info:</p>
									<div class="text-sm bg-gray-50 p-3 rounded border space-y-1">
										<p><strong>Name:</strong> {request.existingSchool.name}</p>
										<p><strong>Verified:</strong> {request.existingSchool.isVerified ? 'Yes' : 'No'}</p>
										<a
											href={`/admin/schools/${request.existingSchool.id}`}
											class="text-blue-600 hover:underline inline-block mt-2"
										>
											View School Profile →
										</a>
									</div>
								</div>
							{/if}

							<div class="flex gap-2 pt-2">
								<Button
									onclick={() => openReviewDialog(request, 'approve')}
									variant="default"
									class="bg-green-600 hover:bg-green-700"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="mr-2 h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Approve & Grant Access
								</Button>
								<Button
									onclick={() => openReviewDialog(request, 'reject')}
									variant="destructive"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="mr-2 h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
									Reject Request
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<!-- Review Dialog -->
<Dialog.Root bind:open={showReviewDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
			</Dialog.Title>
			<Dialog.Description>
				{#if reviewAction === 'approve'}
					Approving will grant {selectedRequest?.requester?.name} school-admin access to manage "{selectedRequest?.schoolName}".
					Make sure you've verified their identity!
				{:else}
					Rejecting will deny the request. The user will be notified.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="adminNotes">Admin Notes (Optional)</Label>
				<Textarea
					id="adminNotes"
					bind:value={adminNotes}
					placeholder="Add notes about your decision or instructions for the user..."
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showReviewDialog = false)}>Cancel</Button>
			<Button
				onclick={handleReview}
				disabled={isSubmitting}
				variant={reviewAction === 'approve' ? 'default' : 'destructive'}
			>
				{isSubmitting ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
