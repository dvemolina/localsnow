<script lang="ts">
	import RatingInput from './RatingInput.svelte';
	import ReviewCard from './ReviewCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Review } from '$lib/server/db/schema';

	let {
		instructorId,
		initialReviews = [],
		initialStats = null
	}: {
		instructorId: number;
		initialReviews?: Review[];
		initialStats?: any;
	} = $props();

	let reviews = $state<Review[]>(initialReviews);
	let stats = $state(initialStats);
	let isLoading = $state(false);
	let hasMore = $state(initialReviews.length === 10);
	let offset = $state(initialReviews.length);

	async function loadMore() {
		isLoading = true;
		try {
			const response = await fetch(
				`/api/reviews/instructor/${instructorId}?limit=10&offset=${offset}`
			);
			const data = await response.json();

			if (data.success) {
				reviews = [...reviews, ...data.reviews];
				offset += data.reviews.length;
				hasMore = data.reviews.length === 10;

				// Update stats if not already loaded
				if (!stats && data.stats) {
					stats = data.stats;
				}
			}
		} catch (error) {
			console.error('Error loading more reviews:', error);
		} finally {
			isLoading = false;
		}
	}

	// Calculate rating distribution percentages
	function getRatingPercentage(count: number) {
		if (!stats?.totalReviews) return 0;
		return Math.round((count / stats.totalReviews) * 100);
	}
</script>

<div class="space-y-6">
	<!-- Stats Section -->
	{#if stats && stats.totalReviews > 0}
		<div class="rounded-lg border bg-card p-6">
			<div class="mb-6 flex items-center gap-4">
				<div>
					<div class="text-4xl font-bold">{stats.averageRating}</div>
					<RatingInput value={Math.round(stats.averageRating)} readonly={true} size={20} />
				</div>
				<div class="text-sm text-muted-foreground">
					Based on {stats.totalReviews}
					{stats.totalReviews === 1 ? 'review' : 'reviews'}
				</div>
			</div>

			<!-- Rating Distribution -->
			<div class="space-y-2">
				{#each [5, 4, 3, 2, 1] as star}
					{@const count =
						star === 5
							? stats.fiveStarCount
							: star === 4
								? stats.fourStarCount
								: star === 3
									? stats.threeStarCount
									: star === 2
										? stats.twoStarCount
										: stats.oneStarCount}
					{@const percentage = getRatingPercentage(count)}
					<div class="flex items-center gap-2">
						<span class="w-8 text-sm">{star} ★</span>
						<div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
							<div
								class="h-full bg-yellow-400 transition-all"
								style="width: {percentage}%"
							></div>
						</div>
						<span class="w-12 text-right text-sm text-muted-foreground">{count}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Reviews List -->
	{#if reviews.length > 0}
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Recent Reviews</h3>
			{#each reviews as review (review.id)}
				<ReviewCard {review} />
			{/each}
		</div>

		<!-- Load More Button -->
		{#if hasMore}
			<div class="flex justify-center">
				<Button variant="outline" onclick={loadMore} disabled={isLoading}>
					{isLoading ? 'Loading...' : 'Load More Reviews'}
				</Button>
			</div>
		{/if}
	{:else if stats && stats.totalReviews === 0}
		<div class="rounded-lg border bg-muted/50 p-8 text-center">
			<p class="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
		</div>
	{/if}
</div>
