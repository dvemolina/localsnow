<script lang="ts">
	let { score = 5 } = $props();
</script>

<div class="flex flex-row justify-center items-center rounded-md bg-yellow-200/75 pl-1 gap">
	<p class="text-sm text-text font-semibold ">{score}</p>
	<img src="/icons/star.svg" alt="Stars" class="size-4 invert-0 dark:invert"/>
</div>
