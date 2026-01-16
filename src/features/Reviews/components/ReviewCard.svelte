<script lang="ts">
	import RatingInput from './RatingInput.svelte';
	import type { InstructorReview } from '$lib/server/db/schema';

	let { review }: { review: InstructorReview } = $props();

	function formatDate(date: Date | string | null) {
		if (!date) return '';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	// Get client initials for avatar
	const clientInitials = review.clientEmail
		.split('@')[0]
		.substring(0, 2)
		.toUpperCase();
</script>

<div class="rounded-lg border bg-card p-4">
	<div class="flex items-start gap-4">
		<!-- Client Avatar -->
		<div
			class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
		>
			<span class="text-sm font-semibold">{clientInitials}</span>
		</div>

		<!-- Review Content -->
		<div class="flex-1">
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<RatingInput value={review.rating} readonly={true} size={16} />
					{#if review.isVerified}
						<span class="text-xs text-muted-foreground">✓ Verified</span>
					{/if}
				</div>
				<span class="text-xs text-muted-foreground">
					{formatDate(review.createdAt)}
				</span>
			</div>

			{#if review.comment}
				<p class="text-sm text-foreground">{review.comment}</p>
			{/if}
		</div>
	</div>
</div>
