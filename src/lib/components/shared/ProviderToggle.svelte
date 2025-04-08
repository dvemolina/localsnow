<!-- src/lib/components/search/ProviderToggle.svelte -->
<script lang="ts">
	export let searchType: 'school' | 'instructor';
</script>

<div class="toggle-container">
	<button 
		class:active={searchType === 'school'}
		on:click={() => searchType = 'school'}
	>
		🏫 Schools
	</button>
	<button 
		class:active={searchType === 'instructor'}
		on:click={() => searchType = 'instructor'}
	>
		⛷ Instructors
	</button>
</div>

<style>
	.toggle-container {
		@apply mb-8 flex justify-center gap-4;
		
		button {
			@apply rounded-full bg-gray-100 px-6 py-2 transition-colors hover:bg-gray-200;
			
			&.active {
				@apply bg-primary text-white hover:bg-primary;
			}
		}
	}
</style>