<script lang="ts">
	import RatingInput from './RatingInput.svelte';
	import * as Avatar from '$lib/components/ui/avatar';

	let { review }: { review: any } = $props();

	function formatDate(date: Date | string | null) {
		if (!date) return '';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	// Determine display name and profile picture
	// Priority: logged-in account data > booking client data > email prefix
	const hasAccount = !!review.reviewerId;
	const reviewerName = hasAccount && review.reviewerName
		? `${review.reviewerName}${review.reviewerLastName ? ' ' + review.reviewerLastName : ''}`
		: review.clientName || review.clientEmail.split('@')[0];

	const profileImage = hasAccount ? review.reviewerProfileImage : null;

	// Get initials from name
	const clientInitials = reviewerName
		.split(' ')
		.map((n: string) => n[0])
		.join('')
		.substring(0, 2)
		.toUpperCase();
</script>

<div class="rounded-lg border bg-card p-4">
	<div class="flex items-start gap-4">
		<!-- Reviewer Avatar -->
		<Avatar.Root class="size-10 shrink-0">
			{#if profileImage}
				<Avatar.Image src={profileImage} alt={reviewerName} />
			{/if}
			<Avatar.Fallback class="bg-primary text-primary-foreground">
				{clientInitials}
			</Avatar.Fallback>
		</Avatar.Root>

		<!-- Review Content -->
		<div class="flex-1">
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-sm font-semibold">{reviewerName}</span>
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
