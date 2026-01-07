<script lang="ts">
	import { page } from '$app/state';
	import { getLocalizedRedirect } from '$lib/i18n/routeHelpers';
	import type { Locale } from '$lib/i18n/routes';

	// Props using Svelte 5 syntax
	const { position = 'auto' }: { position?: 'auto' | 'top' | 'bottom' } = $props();

	// Available locales for the switcher
	const locales: Locale[] = ['en', 'es'];

	// Extract current locale from URL path
	function getCurrentLocale(): Locale {
		const pathname = page.url.pathname;
		// Extract locale from path (e.g., /en/about -> en)
		const parts = pathname.split('/').filter(Boolean);
		const firstPart = parts[0];

		if (firstPart === 'en' || firstPart === 'es') {
			return firstPart;
		}

		// Check if path matches a Spanish route
		const spanishRoutes = ['/acerca-de', '/como-funciona', '/instructores', '/estaciones',
			'/iniciar-sesion', '/registrarse', '/panel', '/contacto'];
		if (spanishRoutes.some(route => pathname.includes(route))) {
			return 'es';
		}

		return 'en'; // Default to English
	}

	const currentLocale = $derived(getCurrentLocale());
	let isOpen = $state(false);

	let triggerEl: HTMLElement | null = null;
	let dropdownPlacement: 'top' | 'bottom' = $state('bottom');

	function toggleDropdown() {
		isOpen = !isOpen;

		if (isOpen) updateAutoPosition();
	}

	/** Smart auto-flip */
	function updateAutoPosition() {
		if (position !== 'auto' || !triggerEl) {
			dropdownPlacement = position === 'top' ? 'top' : 'bottom';
			return;
		}

		const rect = triggerEl.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;

		// If little space below but enough above → flip
		if (spaceBelow < 200 && spaceAbove > spaceBelow) {
			dropdownPlacement = 'top';
		} else {
			dropdownPlacement = 'bottom';
		}
	}

	function selectLocale(locale: string) {
		isOpen = false;

		const localizedUrl = getLocalizedRedirect(page.url.pathname, locale as Locale);
		const searchParams = page.url.search;

		window.location.href = localizedUrl + searchParams;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.language-switcher')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onresize={updateAutoPosition} />

<div class="language-switcher">
	<button
		bind:this={triggerEl}
		type="button"
		class="custom-select"
		onclick={toggleDropdown}
		aria-label="Select language"
		aria-expanded={isOpen}
	>
		<img src={`/flags/${currentLocale}.svg`} alt="Current language" class="selected-flag" />
		<svg class="chevron" class:open={isOpen} width="10" height="6" viewBox="0 0 10 6" fill="none">
			<path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</button>

	{#if isOpen}
		<div
			class="dropdown"
			class:top={dropdownPlacement === 'top'}
			class:bottom={dropdownPlacement === 'bottom'}
		>
			{#each locales as locale}
				<button
					type="button"
					class="dropdown-item"
					class:active={locale === currentLocale}
					onclick={() => selectLocale(locale)}
				>
					<img src={`/flags/${locale}.svg`} alt={locale} class="flag" />
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.language-switcher {
		position: relative;
		display: flex;
		align-items: center;
	}

	.custom-select {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 0.3rem 0.4rem;
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
	}

	.chevron {
		width: 8px;
		height: 8px;
		color: #666;
		transition: transform 0.2s ease;
	}
	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		right: 0;
		background: white;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		z-index: 100;
		overflow: hidden;
	}

	/* Default bottom placement */
	.dropdown.bottom {
		top: calc(100% + 4px);
	}

	/* Flip upwards */
	.dropdown.top {
		bottom: calc(100% + 4px);
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		background: transparent;
		border: none;
		width: 100%;
	}
	.dropdown-item:hover {
		background: #f5f5f5;
	}
	.dropdown-item.active {
		background: #e8f4fd;
	}

	.flag {
		width: 20px;
		height: 15px;
		object-fit: contain;
	}
</style>
