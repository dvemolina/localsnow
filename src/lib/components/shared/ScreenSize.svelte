<script lang="ts">
	import { onMount } from 'svelte';

	let width = $state();

	// Determine the Tailwind CSS breakpoint
	function getBreakpoint(screenWidth: number): string {
		if (screenWidth < 640) return 'Default (< 640px)';
		if (screenWidth < 768) return 'sm (≥ 640px)';
		if (screenWidth < 1024) return 'md (≥ 768px)';
		if (screenWidth < 1280) return 'lg (≥ 1024px)';
		if (screenWidth < 1536) return 'xl (≥ 1280px)';
		return '2xl (≥ 1536px)';
	}

	onMount(() => {
		const handleResize = () => {
			width = window.innerWidth;
		};

		window.addEventListener('resize', handleResize);

		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div class="fixed bottom-4 left-4 bg-black/70 text-white p-2 rounded-lg z-50 text-sm">
	<div>Width: {width}px</div>
	<div>Breakpoint: {getBreakpoint(width)}</div>
</div>