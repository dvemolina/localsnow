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
	let { pendingClaims } = $derived(data);

	let selectedClaim = $state<any>(null);
	let showReviewDialog = $state(false);
	let reviewAction = $state<'approve' | 'reject'>('approve');
	let responseMessage = $state('');
	let isSubmitting = $state(false);

	function openReviewDialog(claim: any, action: 'approve' | 'reject') {
		selectedClaim = claim;
		reviewAction = action;
		showReviewDialog = true;
		responseMessage = '';
	}

	async function handleReview() {
		if (!selectedClaim) return;

		isSubmitting = true;
		try {
			const response = await fetch(`/api/schools/claim/${selectedClaim.id}/review`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: reviewAction,
					responseMessage
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success(result.message);
				showReviewDialog = false;
				selectedClaim = null;
				responseMessage = '';
				// Reload the page to refresh claims
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

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold">Ownership Claims</h1>
		<p class="text-muted-foreground mt-1">
			Review and manage requests to claim ownership of your schools
		</p>
	</div>

	<!-- Info Card -->
	<Card.Root class="border-yellow-200 bg-yellow-50">
		<Card.Header>
			<Card.Title class="text-yellow-900">About Ownership Claims</Card.Title>
			<Card.Description class="text-yellow-700">
				Other users can request to claim ownership of schools you manage. Review each request carefully before approving or rejecting. Approving transfers ownership to the claimant.
			</Card.Description>
		</Card.Header>
	</Card.Root>

	<!-- Claims List -->
	{#if pendingClaims.length === 0}
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
					<h3 class="mt-4 text-lg font-medium">No pending claims</h3>
					<p class="text-muted-foreground mt-2">
						There are currently no ownership claims waiting for your review
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each pendingClaims as claim}
				<Card.Root>
					<Card.Header>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-1">
									<Card.Title class="text-lg">{claim.schoolName}</Card.Title>
									<Badge variant="outline" class="bg-yellow-50">Pending Review</Badge>
								</div>
								<Card.Description>
									Claimed by <strong>{claim.claimantName}</strong> ({claim.claimantEmail})
								</Card.Description>
							</div>
							<div class="text-sm text-muted-foreground">
								{formatDate(claim.createdAt)}
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						{#if claim.message}
							<div class="mb-4">
								<p class="text-sm font-medium mb-1">Claimant's Message:</p>
								<p class="text-sm bg-gray-50 p-3 rounded border">{claim.message}</p>
							</div>
						{/if}

						<div class="flex gap-2">
							<Button
								onclick={() => openReviewDialog(claim, 'approve')}
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
								Approve & Transfer Ownership
							</Button>
							<Button
								onclick={() => openReviewDialog(claim, 'reject')}
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
								Reject Claim
							</Button>
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
				{reviewAction === 'approve' ? 'Approve Claim' : 'Reject Claim'}
			</Dialog.Title>
			<Dialog.Description>
				{#if reviewAction === 'approve'}
					<span class="text-red-600 font-medium">Warning:</span> Approving this claim will transfer ownership
					of "{selectedClaim?.schoolName}" to {selectedClaim?.claimantName}. You will lose admin access to this school.
				{:else}
					Rejecting this claim will notify {selectedClaim?.claimantName} that their request was denied.
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="response">Response Message (Optional)</Label>
				<Textarea
					id="response"
					bind:value={responseMessage}
					placeholder="Add a message to explain your decision..."
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
