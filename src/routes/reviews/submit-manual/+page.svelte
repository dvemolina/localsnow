<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { submitManualReviewSchema } from '$src/features/Reviews/lib/reviewSchema';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(submitManualReviewSchema)
	});

	const { form: formData, enhance, delayed, message: formMessage } = form;

	let selectedRating = $state($formData.rating || 0);
	let hoveredRating = $state(0);

	function selectRating(rating: number) {
		selectedRating = rating;
		$formData.rating = rating;
	}

	// Format lesson date
	const lessonDate = new Date(data.lesson.lessonDate).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<div class="container mx-auto max-w-2xl py-12 px-4">
	<div class="mb-8 text-center">
		<h1 class="title2 mb-2">Leave a Review</h1>
		<p class="text-muted-foreground">
			Share your experience with {data.lesson.instructorName}
		</p>
	</div>

	{#if $formMessage}
		<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
			<p class="text-sm font-medium">{$formMessage}</p>
		</div>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Your Lesson Details</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3 text-sm">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Instructor:</span>
				<span class="font-medium">{data.lesson.instructorName}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Date:</span>
				<span class="font-medium">{lessonDate}</span>
			</div>
			{#if data.lesson.sport}
				<div class="flex justify-between">
					<span class="text-muted-foreground">Sport:</span>
					<span class="font-medium">{data.lesson.sport}</span>
				</div>
			{/if}
			<div class="flex justify-between">
				<span class="text-muted-foreground">Duration:</span>
				<span class="font-medium">{data.lesson.duration} hours</span>
			</div>
		</Card.Content>
	</Card.Root>

	<form method="POST" use:enhance class="mt-6 space-y-6">
		<input type="hidden" name="token" bind:value={$formData.token} />

		<!-- Star Rating -->
		<div>
			<label class="mb-3 block text-sm font-medium">
				Rating <span class="text-red-500">*</span>
			</label>
			<div class="flex gap-2">
				{#each [1, 2, 3, 4, 5] as star}
					<button
						type="button"
						class="text-4xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
						onmouseenter={() => (hoveredRating = star)}
						onmouseleave={() => (hoveredRating = 0)}
						onclick={() => selectRating(star)}
					>
						{#if star <= (hoveredRating || selectedRating)}
							<span class="text-yellow-400">★</span>
						{:else}
							<span class="text-gray-300">☆</span>
						{/if}
					</button>
				{/each}
			</div>
			{#if selectedRating === 0}
				<p class="mt-2 text-xs text-muted-foreground">Please select a rating</p>
			{:else}
				<p class="mt-2 text-xs text-muted-foreground">
					{selectedRating} star{selectedRating > 1 ? 's' : ''}
					{#if selectedRating === 5}
						- Excellent!
					{:else if selectedRating === 4}
						- Very Good
					{:else if selectedRating === 3}
						- Good
					{:else if selectedRating === 2}
						- Fair
					{:else}
						- Needs Improvement
					{/if}
				</p>
			{/if}
		</div>

		<!-- Comment -->
		<div>
			<label class="mb-2 block text-sm font-medium" for="comment">
				Your Review (Optional)
			</label>
			<Textarea
				id="comment"
				bind:value={$formData.comment}
				placeholder="Share details about your experience..."
				rows={6}
				maxlength={2000}
				disabled={$delayed}
			/>
			<p class="mt-1 text-xs text-muted-foreground">
				{($formData.comment?.length || 0)}/2000 characters
			</p>
		</div>

		<!-- Info Box -->
		<div class="rounded-md border border-blue-200 bg-blue-50 p-4">
			<p class="text-sm text-blue-800">
				<strong>💡 Your feedback matters!</strong><br />
				Your review will appear on {data.lesson.instructorName}'s public profile and help other students
				find quality instruction.
			</p>
		</div>

		<!-- Submit Button -->
		<Button type="submit" disabled={$delayed || selectedRating === 0} class="w-full">
			{#if $delayed}
				<span class="flex items-center gap-2">
					<svg
						class="h-4 w-4 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Submitting...
				</span>
			{:else}
				Submit Review
			{/if}
		</Button>
	</form>
</div>
