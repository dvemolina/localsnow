<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ReviewForm from '$src/features/Reviews/components/ReviewForm.svelte';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	function handleReviewSuccess() {
		// Redirect to thank you page or instructor profile
		goto('/reviews/thank-you');
	}

	function formatDate(date: Date | string) {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>Leave a Review | Local Snow</title>
</svelte:head>

<section class="container mx-auto max-w-3xl px-4 py-8">
	<!-- Back Button -->
	<div class="mb-6">
		<a
			href="/"
			class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			Back to Home
		</a>
	</div>

	<h1 class="mb-8 text-3xl font-bold">Leave a Review</h1>

	<!-- Booking Details -->
	<Card class="mb-6">
		<CardHeader>
			<CardTitle>Your Booking</CardTitle>
			<CardDescription>Booking #{data.booking.id}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-2">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Date:</span>
				<span class="text-sm font-medium">
					{formatDate(data.booking.startDate)}
					{#if data.booking.endDate}
						- {formatDate(data.booking.endDate)}
					{/if}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Students:</span>
				<span class="text-sm font-medium">{data.booking.numberOfStudents}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Hours per day:</span>
				<span class="text-sm font-medium">{data.booking.hoursPerDay}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Status:</span>
				<Badge variant={data.booking.status === 'accepted' ? 'default' : 'secondary'}>
					{data.booking.status}
				</Badge>
			</div>
		</CardContent>
	</Card>

	<!-- Review Form or Message -->
	{#if data.alreadyReviewed}
		<Card>
			<CardContent class="py-8 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mx-auto mb-4 size-16 text-green-500"
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
				<h2 class="mb-2 text-xl font-semibold">Review Already Submitted</h2>
				<p class="text-muted-foreground">
					You've already left a review for this booking. Thank you!
				</p>
				<Button href="/" class="mt-6">Back to Home</Button>
			</CardContent>
		</Card>
	{:else if !data.canReview}
		<Card>
			<CardContent class="py-8 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mx-auto mb-4 size-16 text-yellow-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<h2 class="mb-2 text-xl font-semibold">Cannot Leave Review Yet</h2>
				<p class="text-muted-foreground mb-6">{data.reason}</p>
				<Button href="/" variant="outline">Back to Home</Button>
			</CardContent>
		</Card>
	{:else}
		<ReviewForm
			bookingRequestId={data.booking.id}
			clientEmail={data.clientEmail}
			onSuccess={handleReviewSuccess}
		/>
	{/if}
</section>
