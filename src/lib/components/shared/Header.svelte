<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import LanguageSwitch from './LanguageSwitch.svelte';
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
<div class="header-wrapper fixed top-0 left-0 w-full z-30 pt-4 pb-4 px-2">
	<header
		class="flex w-full flex-col items-center justify-center gap-2 self-center transition-all z-50"
	>
		<div class="flex flex-row gap-2 items-center justify-center ">
			<div
				class="header flex w-fit flex-row items-center justify-between gap-4 rounded-full shadow-xs border border-border bg-card pr-4 sm:gap-12"
			>
				<a href="/" class="group flex flex-row items-center justify-center">
					<div class="m-1 size-12 overflow-hidden rounded-full object-cover">
						<img
							src="/local-snow-head-big.png"
							alt="Local Snow Logo"
							class="opacity-85 group-hover:opacity-100 group-focus:opacity-100 p-1"
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
						class="size-6 opacity-80 hover:opacity-100 active:opacity-100"
					/>
				</button>
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
						<a href="/" class="group flex flex-row items-center justify-center gap-1">
							<div class="m-1 size-12 overflow-hidden object-cover">
								<img
									src="/local-snow-head-big.png"
									alt="Local Snow Logo"
									class="opacity-85 group-hover:opacity-100 group-focus:opacity-100"
								/>
							</div>
							<p class="title4 mt-0 text-foreground/85 transition-all group-hover:text-foreground">
								localsnow
							</p>
						</a>

						<ul class="flex flex-col items-center gap-4">
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
					<LanguageSwitch />
				</div>
			{/if}
		</div>

		{#if !isCurrentPath("/", page.url.pathname)}
		<div
			class="breadcrumb flex w-full max-w-[550px] flex-row items-center justify-between gap-4 rounded-full border border-border bg-background py-0.5 sm:gap-12 transition-all overflow-hidden"
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
