<!-- src/lib/components/shared/GoogleBtn.svelte -->
<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	
	// Get current URL to return to after OAuth
	let currentUrl = $state('');
	
	// Set currentUrl only on client side
	$effect(() => {
		if (typeof window !== 'undefined') {
			currentUrl = window.location.href;
		}
	});
	
	// Build OAuth URL with return parameter
	const getOAuthUrl = () => {
		if (currentUrl) {
			return `/oauth/google?returnTo=${encodeURIComponent(currentUrl)}`;
		}
		return '/oauth/google';
	};
</script>

<a href={getOAuthUrl()}>
	<button class="button border border-border bg-secondary text-foreground">
		<img src="/icons/google.svg" alt="Google" class="size-5" />
		{@render children?.()}
	</button>
</a>

<style>
	.button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 0.9rem 1.7rem;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.1s ease-in-out;
		border-radius: 12px;
	}

	.button:hover {
		cursor: pointer;
	}
</style>