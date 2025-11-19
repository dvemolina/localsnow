<script lang="ts">
	import { page } from '$app/state';
	import { locales, getLocale } from '$lib/paraglide/runtime';
	import { localizeHref } from '$lib/paraglide/runtime';

	// Use $derived to make locale reactive when it changes
	const currentLocale = $derived(getLocale());

	function changeLanguage(event: Event) {
		const target = event.target as HTMLSelectElement;
		const selectedLocale = target.value;
		window.location.href = localizeHref(page.url.pathname + page.url.search, { locale: selectedLocale });
	}
</script>

<div class="language-switcher">
	<div class="custom-select">
		<img src={`/flags/${currentLocale}.svg`} alt="Current language" class="selected-flag" />
		<select onchange={changeLanguage} class="language-select" aria-label="Select language">
			{#each locales as locale}
				<option value={locale} selected={locale === currentLocale}>
					{locale.toUpperCase()}
				</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.language-switcher {
		position: relative;
		display: flex;
		align-items: center;
	}

	.custom-select {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 0.1rem;
		cursor: pointer;
		background: white;
		min-width: 36px;
		min-height: 28px;
	}

	.custom-select:hover {
		border-color: #999;
	}

	.selected-flag {
		width: 20px;
		height: 15px;
		object-fit: contain;
		pointer-events: none;
	}

	.language-select {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
		width: 100%;
		height: 100%;
	}
</style>
