<script lang="ts">
	import { page } from '$app/state';
	import { locales, getLocale } from '$lib/paraglide/runtime';
	import { localizeHref } from '$lib/paraglide/runtime';

	const currentLocale = getLocale();

	function changeLanguage(event: Event) {
		const target = event.target as HTMLSelectElement;
		const selectedLocale = target.value;
		window.location.href = localizeHref(page.url.pathname, { locale: selectedLocale });
	}
</script>

<div class="language-switcher">
	<div class="custom-select">
		<img src={`/flags/${currentLocale}.svg`} alt="Flag" class="selected-flag" />
		<select onchange={changeLanguage} class="language-select">
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
		gap: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 0 0.1rem;
		cursor: pointer;
		background: white;
	}

	.selected-flag {
		width: 20px;
		height: 15px;
		object-fit: contain;
	}

	.language-select {
		background: transparent;
		border: none;
		font-size: 0.7rem;
		cursor: pointer;
		padding: 0.1rem;
		appearance: none; /* Hides default dropdown styling */
	}

	.language-select:focus {
		outline: none;
	}

	/* Style dropdown options */
	.language-select option {
		background: white;
		color: black;
	}
</style>