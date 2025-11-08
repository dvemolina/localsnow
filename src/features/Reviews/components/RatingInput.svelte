<script lang="ts">
	import { Star } from '@lucide/svelte';

	let { value = $bindable(0), readonly = false, size = 24 } = $props();

	function handleClick(rating: number) {
		if (!readonly) {
			value = rating;
		}
	}

	function handleKeyDown(event: KeyboardEvent, rating: number) {
		if (!readonly && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			value = rating;
		}
	}
</script>

<div class="flex gap-1">
	{#each [1, 2, 3, 4, 5] as rating}
		<button
			type="button"
			onclick={() => handleClick(rating)}
			onkeydown={(e) => handleKeyDown(e, rating)}
			disabled={readonly}
			class="transition-all hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
			aria-label={`Rate ${rating} stars`}
		>
			<Star
				{size}
				fill={rating <= value ? 'currentColor' : 'none'}
				class={rating <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
			/>
		</button>
	{/each}
</div>
