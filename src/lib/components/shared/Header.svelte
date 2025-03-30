<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	const items = [
		{ label: 'Instructors', href: '/instructors' },
		{ label: 'Resorts', href: '/location' },
		{ label: 'Contact', href: '/contact' },
		{ label: 'About', href: '/about' }
	];

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

<div class="@container fixed top-6 z-50 flex w-full items-center justify-center self-center">
	<div
		class="header flex w-fit flex-row items-center justify-between gap-4 rounded-full border-2 border-border bg-background/75 sm:gap-12"
	>
		<a href="/" class="group flex flex-row items-center justify-center gap-2">
			<div class="m-1 size-12 overflow-hidden rounded-full object-cover">
				<img
					src="/logo-local-snow.png"
					alt="Local Snow Logo"
					class="opacity-85 invert-0 group-hover:opacity-100 group-focus:opacity-100 dark:invert"
				/>
			</div>
			<p class="title4 transition-all group-hover:text-foreground text-foreground/85 mt-0">LocalSnow</p>
		</a>

		<!-- Desktop Navigation -->
		<nav class="hidden sm:block">
			<ul class="flex flex-row gap-4 pr-6">
				{#each items as { href, label }}
					<li>
						<a
							{href}
							class="opacity-75 hover:opacity-100 {page.url.pathname === href
								? 'font-semibold text-primary'
								: ''}"
						>
							{label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Mobile Navigation Trigger -->
		<button
			class="pr-4 sm:hidden"
			aria-label="Open Menu"
			aria-expanded={isMobileMenuOpen}
			onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
		>
			<img
				src="/icons/burger.svg"
				alt="Menu"
				class="size-6 opacity-80 invert hover:opacity-100 active:opacity-100"
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
					<p class="title4 transition-all group-hover:text-foreground text-foreground/85 mt-0">LocalSnow</p>
				</a>

				<ul class="flex flex-col items-center gap-6">
					{#each items as { href, label }}
						<li>
							<a
								{href}
								class="text-xl opacity-75 hover:opacity-100 {page.url.pathname === href
									? 'font-semibold text-primary'
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
	{/if}
</div>

<style>
	.header {
		backdrop-filter: blur(15px);
		-webkit-backdrop-filter: blur(15px);
	}
</style>
