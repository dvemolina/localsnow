<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { onMount, tick } from 'svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';
	import Breadcrumb from './Breadcrumb.svelte';
	import { isCurrentPath } from "$src/lib/utils/generics";
	import { t } from '$lib/i18n/i18n';
	import { route } from '$lib/i18n/routeHelpers';

	type User = {
		id: string;
		name: string;
		email: string;
		role?: string;
	} | null;

	let { user }: { user: User } = $props();

	let isMobileMenuOpen = $state(false);
	let isFindOpen = $state(false);
	let findMenu: HTMLDivElement;
	let findMenuList: HTMLUListElement;
	let findButton: HTMLButtonElement;
	let findCloseTimeout: ReturnType<typeof setTimeout> | null = null;

	// Navigation items - translations are reactive through $t store
	// Conditionally show Dashboard or Sign Up based on user state
	const items = $derived([
		{ href: route('/how-it-works'), label: $t('nav_how_it_works') },
		{ href: route('/about'), label: $t('nav_about') },
		user
			? { href: route('/dashboard'), label: $t('nav_dashboard') }
			: { href: route('/signup'), label: $t('nav_signup') }
	]);

	const findItems = $derived([
		{ href: route('/instructors'), label: $t('nav_instructors') },
		{ href: route('/schools'), label: $t('nav_schools') },
		{ href: route('/resorts'), label: $t('nav_resorts') }
	]);

	// Prevent scrolling when menu is open
	$effect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
	});

	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!findMenu?.contains(event.target as Node)) {
				isFindOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	async function openFindMenu() {
		isFindOpen = true;
		await tick();
		const firstItem = findMenuList?.querySelector('a');
		firstItem?.focus();
	}

	function closeFindMenu() {
		isFindOpen = false;
	}

	function cancelFindClose() {
		if (findCloseTimeout) {
			clearTimeout(findCloseTimeout);
			findCloseTimeout = null;
		}
	}

	function scheduleFindClose() {
		cancelFindClose();
		findCloseTimeout = setTimeout(() => {
			isFindOpen = false;
		}, 120);
	}

	function handleFindButtonKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openFindMenu();
		}
	}

	function handleFindMenuKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeFindMenu();
			findButton?.focus();
		}
	}

	function handleFindFocusOut(event: FocusEvent) {
		if (!findMenu?.contains(event.relatedTarget as Node)) {
			scheduleFindClose();
		}
	}

	function handleFindPointerLeave(event: PointerEvent) {
		if (!findMenu?.contains(event.relatedTarget as Node)) {
			scheduleFindClose();
		}
	}
</script>
<div class="header-wrapper fixed top-0 left-0 w-full z-30 pt-4 pb-4 px-2">
	<header
		class="flex w-full  flex-col items-center justify-center gap-2 self-center transition-all z-50"
	>
		<div class="flex w-full max-w-[685px] flex-row gap-2 items-center justify-center">
			<div
				class="header py-3 flex w-full flex-row items-center justify-evenly gap-4 px-4 rounded-full shadow-xs border border-border bg-card sm:gap-12"
			>
				<a href={route('/')} class="group flex flex-row items-center justify-center">
					<div class="m-1 flex items-center justify-center overflow-hidden border-0 object-cover">
						<img
							src="/localsnow-logo-h-black.png"
							alt="Local Snow Logo"
							class="mx-auto max-w-38 p-1 opacity-75 group-hover:opacity-90 group-focus:opacity-90"
						/>
					</div>
				</a>

				<!-- Desktop Navigation -->
				<nav class="hidden flex-row gap-4 md:flex items-center">
					<ul class="flex flex-row gap-3 text-sm">
						<li class="whitespace-nowrap">
							<div
								class="relative"
								bind:this={findMenu}
								onpointerenter={() => {
									cancelFindClose();
									isFindOpen = true;
								}}
								onpointerleave={handleFindPointerLeave}
								onfocusout={handleFindFocusOut}
								onfocusin={cancelFindClose}
							>
								<button
									type="button"
									class="flex items-center gap-1 opacity-75 hover:opacity-100"
									aria-haspopup="menu"
									aria-expanded={isFindOpen}
									aria-label="Find ski and snowboard instructors, schools, and resorts"
									bind:this={findButton}
									onkeydown={handleFindButtonKeydown}
									onclick={() => (isFindOpen = !isFindOpen)}
								>
									{$t('nav_find')}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="size-4 opacity-70"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
								{#if isFindOpen}
									<ul
										class="absolute left-0 top-full min-w-[160px] translate-y-2 rounded-md border border-border bg-card p-2 shadow-md transition duration-150 ease-out"
										role="menu"
										bind:this={findMenuList}
										onkeydown={handleFindMenuKeydown}
										transition:fade={{ duration: 120 }}
									>
										{#each findItems as { href, label }}
											<li role="none">
												<a
													{href}
													class="block rounded-sm px-2 py-1 text-sm opacity-80 hover:opacity-100 hover:bg-muted"
													role="menuitem"
													onfocus={() => (isFindOpen = true)}
												>
													{label}
												</a>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						</li>
						{#each items as { href, label }}
							<li class="whitespace-nowrap">
								<a
									{href}
									class="opacity-75 hover:opacity-100 {isCurrentPath(href, page.url.pathname)
										? 'text-foeground font-semibold opacity-100'
										: ''}"
								>
									{label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
				
				<div class="hidden md:flex flex-shrink-0">
					<LanguageSwitch /> <!-- Desktop Language Switcher-->
				</div>
				<!-- Mobile Navigation Trigger -->
				 <div class="md:hidden flex flex-row gap-4">

					 <button
					 aria-label="Open Menu"
					 aria-expanded={isMobileMenuOpen}
					 onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
					 >
					 <img
					 src="/icons/burger.svg"
					 alt="Menu"
					 class="size-6 opacity-80 hover:opacity-100 active:opacity-100"
					 />
					</button>
					<div class="flex-shrink-0">
						<LanguageSwitch /> <!-- Desktop Language Switcher-->
					</div>
				</div>
			</div>

			<!-- Mobile Menu Overlay -->
			{#if isMobileMenuOpen}
				<div
					transition:fade={{ duration: 200 }}
					class="absolute top-0 left-0 w-full h-screen z-50 flex flex-col items-center justify-center bg-card"
				>
					<button
						aria-label="Close Menu"
						class="absolute right-6 top-6"
						onclick={() => (isMobileMenuOpen = false)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<nav class="flex flex-col items-center justify-center space-y-8 mb-8">
						<a href={route('/')} class="group flex flex-row items-center justify-center gap-1">
							<div class="m-1 flex size-12 items-center justify-center overflow-hidden border-0 object-cover">
								<img
									src="/localsnow-logo-h-black.png"
									alt="Local Snow Logo"
									class="mx-auto max-w-38 opacity-75 group-hover:opacity-90 group-focus:opacity-90"
								/>
							</div>
						</a>

						<ul class="flex flex-col items-center gap-4">
							<li class="text-xs uppercase tracking-wide text-muted-foreground">
								{$t('nav_find')}
							</li>
							{#each findItems as { href, label }}
								<li>
									<a
										{href}
										class="text-md opacity-75 hover:opacity-100 {isCurrentPath(
											href,
											page.url.pathname
										)
											? 'font-semibold text-foreground opacity-100'
											: ''}"
										onclick={() => (isMobileMenuOpen = false)}
									>
										{label}
									</a>
								</li>
							{/each}
							{#each items as { href, label }}
								<li>
									<a
										{href}
										class="text-md opacity-75 hover:opacity-100 {isCurrentPath(
											href,
											page.url.pathname
										)
											? 'font-semibold text-foreground opacity-100'
											: ''}"
										onclick={() => (isMobileMenuOpen = false)}
									>
										{label}
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
				<LanguageSwitch />
			{/if}
		</div>

		{#if !isCurrentPath("/", page.url.pathname)}
		<div
			class="breadcrumb flex w-full max-w-[675px] flex-row items-center justify-between gap-4 rounded-full border border-border bg-background py-0.5 sm:gap-12 transition-all overflow-hidden"
		>
			<Breadcrumb {items} {page} />
		</div>
		{/if}
	</header>
</div>

<style>

.header-wrapper {
	background: linear-gradient(to bottom, hsl(0, 0%, 99%) 0%,hsla(0, 0%, 99%, 0.914) 50%,hsla(0, 0%, 99%, 0.64) 100%);
	backdrop-filter: blur(2px);
	-webkit-backdrop-filter: blur(2px)
}


</style>
