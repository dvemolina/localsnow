<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { formatDate } from '$src/lib/utils/generics';

	let { data } = $props();

	let rating = $state(5);
	let comment = $state('');
	let isSubmitting = $state(false);
	let submitSuccess = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		try {
			// Validation
			if (rating < 1 || rating > 5) {
				toast.error('Please select a rating between 1 and 5 stars');
				isSubmitting = false;
				return;
			}

			if (comment && comment.trim().length > 1000) {
				toast.error('Comment must be less than 1000 characters');
				isSubmitting = false;
				return;
			}

			// Submit review
			const response = await fetch('/api/reviews/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					token: data.token,
					rating,
					comment: comment.trim() || undefined
				})
			});

			const result = await response.json();

			if (!response.ok) {
				if (response.status === 400) {
					toast.error(result.error || 'Invalid review submission');
				} else if (response.status === 404) {
					toast.error('Review link not found or already used');
				} else {
					toast.error('Failed to submit review. Please try again.');
				}
				isSubmitting = false;
				return;
			}

			// Success
			submitSuccess = true;
			toast.success('Thank you! Your review has been submitted successfully');

			// Redirect after 3 seconds
			setTimeout(() => {
				goto(`/instructors/${data.booking.instructorSlug}`);
			}, 3000);
		} catch (error) {
			console.error('Error submitting review:', error);
			toast.error('Failed to submit review. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Submit Review - LocalSnow</title>
</svelte:head>

<div class="container mx-auto max-w-2xl py-12 px-4">
	{#if data.alreadySubmitted}
		<!-- Already Submitted State -->
		<Card.Root class="border-2 border-blue-200">
			<Card.Content class="p-12">
				<div class="flex flex-col items-center gap-6 text-center">
					<div class="flex size-20 items-center justify-center rounded-full bg-blue-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-10 text-blue-600"
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
					</div>
					<div>
						<h1 class="text-2xl font-bold mb-2">Review Already Submitted</h1>
						<p class="text-muted-foreground mb-2">
							You have already submitted a review for this lesson on {formatDate(
								new Date(data.booking.reviewSubmittedAt!)
							)}.
						</p>
						<p class="text-muted-foreground">
							Thank you for your feedback! Your review has been recorded and will appear on {data
								.booking.instructorName}'s profile.
						</p>
					</div>
					<Button onclick={() => goto(`/instructors/${data.booking.instructorSlug}`)}>
						View Instructor Profile
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if submitSuccess}
		<!-- Success State -->
		<Card.Root class="border-2 border-green-200">
			<Card.Content class="p-12">
				<div class="flex flex-col items-center gap-6 text-center">
					<div class="flex size-20 items-center justify-center rounded-full bg-green-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-10 text-green-600"
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
					</div>
					<div>
						<h1 class="text-2xl font-bold mb-2">Thank You!</h1>
						<p class="text-muted-foreground">
							Your review has been submitted successfully and will appear on {data.booking
								.instructorName}'s profile.
						</p>
					</div>

					<div class="flex flex-col gap-2 w-full max-w-sm">
						<Button onclick={() => goto(`/instructors/${data.booking.instructorSlug}`)}>
							View Instructor Profile
						</Button>

						{#if !data.user}
							<!-- Sign-up CTA for anonymous reviewers -->
							<div class="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
								<div class="flex items-start gap-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="size-5 shrink-0 text-primary mt-0.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
									<div class="flex-1 text-left">
										<h3 class="text-sm font-semibold mb-1">Want to build your ski profile?</h3>
										<p class="text-xs text-muted-foreground mb-3">
											Create an account to showcase your reviews, get matched with instructors, and track your ski journey.
										</p>
										<Button
											variant="outline"
											size="sm"
											class="w-full"
											onclick={() => goto(`/register?from=review&email=${encodeURIComponent(data.booking.clientEmail)}`)}
										>
											Create Free Account
										</Button>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Review Form -->
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold mb-2">Leave a Review</h1>
			<p class="text-muted-foreground">Share your experience with {data.booking.instructorName}</p>
		</div>

		<!-- Instructor Info Card -->
		<Card.Root class="mb-8">
			<Card.Content class="p-6">
				<div class="flex items-center gap-4">
					<img
						src={data.booking.instructorProfileImage || '/local-snow-head.png'}
						alt={data.booking.instructorName}
						class="size-16 rounded-full object-cover"
					/>
					<div class="flex-1">
						<h2 class="text-xl font-semibold">{data.booking.instructorName}</h2>
						<p class="text-sm text-muted-foreground">
							Lesson on {formatDate(new Date(data.booking.startDate))}
							{#if data.booking.endDate}
								- {formatDate(new Date(data.booking.endDate))}
							{/if}
						</p>
						<p class="text-sm text-muted-foreground">
							{data.booking.numberOfStudents}
							{data.booking.numberOfStudents === 1 ? 'student' : 'students'}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Review Form -->
		<Card.Root>
			<Card.Content class="p-6">
				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- Rating -->
					<div class="space-y-3">
						<Label class="text-base font-semibold">Rating *</Label>
						<p class="text-sm text-muted-foreground">
							How would you rate your experience with {data.booking.instructorName}?
						</p>
						<div class="flex gap-2">
							{#each [1, 2, 3, 4, 5] as star}
								<button
									type="button"
									onclick={() => (rating = star)}
									class="transition-transform hover:scale-110"
									disabled={isSubmitting}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="size-12 {rating >= star
											? 'fill-yellow-400 text-yellow-400'
											: 'fill-none text-gray-300'}"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
										/>
									</svg>
								</button>
							{/each}
						</div>
						<p class="text-sm font-medium">
							{#if rating === 5}
								Excellent! 🌟
							{:else if rating === 4}
								Very Good! 👍
							{:else if rating === 3}
								Good
							{:else if rating === 2}
								Fair
							{:else}
								Needs Improvement
							{/if}
						</p>
					</div>

					<!-- Comment -->
					<div class="space-y-2">
						<Label for="comment" class="text-base font-semibold"
							>Your Review <span class="text-xs text-muted-foreground font-normal"
								>(Optional)</span
							></Label
						>
						<Textarea
							id="comment"
							bind:value={comment}
							placeholder="Tell us about your experience... What did you enjoy? Any suggestions for improvement?"
							rows={6}
							maxlength={1000}
							disabled={isSubmitting}
						/>
						<p class="text-xs text-muted-foreground">{comment.length}/1000 characters</p>
					</div>

					<!-- Submit Button -->
					<div class="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onclick={() => goto('/')}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} class="min-w-32">
							{#if isSubmitting}
								<svg
									class="mr-2 size-4 animate-spin"
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
							{:else}
								Submit Review
							{/if}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>

		<!-- Privacy Notice & Sign-up Hint -->
		<div class="mt-6 space-y-3">
			<p class="text-center text-xs text-muted-foreground">
				Your review will be verified and published on the instructor's profile. Your email address will
				not be publicly displayed.
			</p>

			{#if !data.user}
				<!-- Subtle sign-up hint for anonymous users -->
				<div class="mx-auto max-w-md rounded-md border border-muted bg-muted/30 px-4 py-3">
					<p class="text-center text-xs text-muted-foreground">
						💡 <strong>Pro tip:</strong>
						<a href="/register?from=review&email={encodeURIComponent(data.booking.clientEmail)}" class="text-primary hover:underline">
							Create an account
						</a>
						to showcase your review with your profile picture and build your ski profile!
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
