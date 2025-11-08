<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import RatingInput from './RatingInput.svelte';
	import { toast } from 'svelte-sonner';

	let {
		bookingRequestId,
		clientEmail,
		onSuccess
	}: {
		bookingRequestId: number;
		clientEmail: string;
		onSuccess?: () => void;
	} = $props();

	let rating = $state(0);
	let comment = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit() {
		if (rating === 0) {
			toast.error('Please select a rating');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/reviews/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					bookingRequestId,
					clientEmail,
					rating,
					comment: comment.trim() || undefined
				})
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Failed to submit review');
			}

			toast.success('Review submitted successfully! Your deposit will be refunded shortly.');

			// Reset form
			rating = 0;
			comment = '';

			// Call success callback
			onSuccess?.();
		} catch (error) {
			console.error('Error submitting review:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to submit review');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="rounded-lg border bg-card p-6">
	<h3 class="mb-4 text-lg font-semibold">Leave a Review</h3>

	<div class="space-y-4">
		<div>
			<Label for="rating" class="mb-2 block">Rating *</Label>
			<RatingInput bind:value={rating} size={32} />
		</div>

		<div>
			<Label for="comment" class="mb-2 block">Comment (optional)</Label>
			<Textarea
				id="comment"
				bind:value={comment}
				placeholder="Share your experience with this instructor..."
				rows={4}
				maxlength={1000}
				class="resize-none"
			/>
			<p class="mt-1 text-xs text-muted-foreground">{comment.length}/1000 characters</p>
		</div>

		<Button onclick={handleSubmit} disabled={isSubmitting || rating === 0} class="w-full">
			{isSubmitting ? 'Submitting...' : 'Submit Review & Get Refund'}
		</Button>

		<p class="text-xs text-muted-foreground">
			* Your €15 deposit will be refunded automatically after submitting your review.
		</p>
	</div>
</div>
