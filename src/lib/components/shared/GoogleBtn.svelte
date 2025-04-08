<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<a href="/google">
	<button class="button bg-secondary text-foreground border border-border">
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
