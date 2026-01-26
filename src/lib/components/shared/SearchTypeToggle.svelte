<script lang="ts">
	import { t } from '$lib/i18n/i18n';

	let { value = $bindable('instructors'), disabled = false } = $props<{
		value?: 'instructors' | 'schools';
		disabled?: boolean;
	}>();
</script>

<div class="search-type-toggle flex gap-2 rounded-lg bg-muted/50 p-1 ">
	<button
		type="button"
		class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all {value ===
		'instructors'
			? 'bg-primary text-primary-foreground shadow-sm'
			: 'text-muted-foreground hover:text-foreground'}"
		{disabled}
		onclick={() => (value = 'instructors')}
		aria-pressed={value === 'instructors'}
		aria-label={$t('home_hero_search_instructors')}
	>
		<div class="flex items-center justify-center gap-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-4 hidden sm:flex"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
				<circle cx="9" cy="7" r="4"></circle>
				<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
				<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
			</svg>
			<span>{$t('home_hero_search_instructors')}</span>
		</div>
	</button>

	<button
		type="button"
		class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all {value === 'schools'
			? 'bg-primary text-primary-foreground shadow-sm'
			: 'text-muted-foreground hover:text-foreground'}"
		{disabled}
		onclick={() => (value = 'schools')}
		aria-pressed={value === 'schools'}
		aria-label={$t('home_hero_search_schools')}
	>
		<div class="flex items-center justify-center gap-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-4 hidden sm:flex"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
				<polyline points="9 22 9 12 15 12 15 22"></polyline>
			</svg>
			<span>{$t('home_hero_search_schools')}</span>
		</div>
	</button>
</div>

<style>
	.search-type-toggle {
		border: 1px solid hsl(var(--border));
	}

	button:focus-visible {
		outline: 2px solid hsl(var(--ring));
		outline-offset: 2px;
	}
</style>
