<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<Button onclick={toggleMode} variant="outline" class="group bg-card rounded-full" size="icon">
	<img
		src="/icons/sun.svg"
		alt="Light Mode"
		class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 invert-0 dark:invert opacity-75 group-hover:opacity-100 group-focus:opacity-100"
	/>
	<img
		src="/icons/moon.svg"
		alt="Dark Mode"
		class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 invert-0 dark:invert opacity-75 group-hover:opacity-100 group-focus:opacity-100"
	/>
	<span class="sr-only">Mode Toggle</span>
</Button>
