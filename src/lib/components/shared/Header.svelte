<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import LanguageSwitch from './LanguageSwitch.svelte';
	import ModeSwitch from './ModeSwitch.svelte';
	import Breadcrumb from './Breadcrumb.svelte';
	import { items, isCurrentPath } from "$src/lib/utils/generics";

	let isMobileMenuOpen = $state(false);

	// Prevent scrolling when menu is open
	$effect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
	});
</script>

<div
	class="@container fixed top-6 z-50 flex w-full flex-col items-center justify-center gap-2 self-center transition-all"
>
	<div class="flex flex-row gap-2 items-center justify-center">
		<div
			class="header flex w-fit flex-row items-center justify-between gap-4 rounded-full border border-border bg-card pr-4 sm:gap-12"
		>
			<a href="/" class="group flex flex-row items-center justify-center">
				<div class="m-1 size-12 overflow-hidden rounded-full object-cover">
					<img
						src="/local-snow-head-big.png"
						alt="Local Snow Logo"
						class="opacity-85 invert-0 group-hover:opacity-100 group-focus:opacity-100 dark:invert p-1"
					/>
				</div>
				<p class="title4 mt-0 text-foreground/85 transition-all group-hover:text-foreground">
					localsnow
				</p>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden flex-row gap-6 sm:flex">
				<ul class="flex flex-row gap-4">
					{#each items as { href, label }}
						<li>
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
				<LanguageSwitch />
			</nav>

			<!-- Mobile Navigation Trigger -->
			<button
				class="sm:hidden"
				aria-label="Open Menu"
				aria-expanded={isMobileMenuOpen}
				onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
			>
				<img
					src="/icons/burger.svg"
					alt="Menu"
					class="size-6 opacity-80 invert-0 dark:invert hover:opacity-100 active:opacity-100"
				/>
			</button>
		</div>

		<!-- Mobile Menu Overlay -->
		{#if isMobileMenuOpen}
			<div
				transition:fade={{ duration: 200 }}
				class="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/90 backdrop-blur-lg"
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

				<nav class="flex flex-col items-center justify-center space-y-8">
					<a href="/" class="group flex flex-row items-center justify-center gap-2">
						<div class="m-1 size-12 overflow-hidden rounded-full object-cover">
							<img
								src="/logo-local-snow.png"
								alt="Local Snow Logo"
								class="opacity-85 invert-0 group-hover:opacity-100 group-focus:opacity-100 dark:invert"
							/>
						</div>
						<p class="title4 mt-0 text-foreground/85 transition-all group-hover:text-foreground">
							localsnow
						</p>
					</a>

					<ul class="flex flex-col items-center gap-6">
						{#each items as { href, label }}
							<li>
								<a
									{href}
									class="text-xl opacity-75 hover:opacity-100 {isCurrentPath(
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
				<LanguageSwitch />
			</div>
		{/if}
		<!-- <ModeSwitch /> -->
	</div>

	{#if !isCurrentPath("/", page.url.pathname)}
	<div
		class="breadcrumb flex w-full max-w-4xl flex-row items-center justify-between gap-4 rounded-full border border-border bg-background py-0.5 sm:gap-12 transition-all"
	>
		<Breadcrumb {items} {page} />
	</div>
	{/if}
</div>

<style>
	.header {
		backdrop-filter: blur(15px);
		-webkit-backdrop-filter: blur(15px);
	}
</style>
