<script lang="ts">
	import { page } from '$app/state';
	import { isCurrentPath } from '$src/lib/utils/generics';
	import * as m from '$lib/paraglide/messages';

	// Navigation items - use $derived for translation reactivity
	const items = $derived([
		{ label: m.nav_instructors(), href: '/instructors' },
		{ label: m.nav_resorts(), href: '/resorts' },
		{ label: m.nav_how_it_works(), href: '/how-it-works' },
		{ label: m.nav_about(), href: '/about' },
		{ label: m.nav_signup(), href: '/signup' }
	]);

	// Legal links - use $derived for translation reactivity
	const legalLinks = $derived([
		{ label: m.footer_privacy(), href: '/legal/privacy' },
		{ label: m.footer_terms(), href: '/legal/terms' },
		{ label: m.footer_cookies(), href: '/legal/cookies' }
	]);
</script>

<footer class="flex w-full items-center justify-center mt-12">
	<div
		class="grey-section mt-4 flex w-full max-w-4xl flex-col sm:flex-row items-center justify-between gap-8 rounded-md border border-border/50 bg-card p-6 shadow-xs sm:my-4 sm:p-12"
	>
		<div class="flex max-w-64 flex-col items-center justify-center gap-2 text-center">
			<img src="/local-snow.png" alt="Local Snow Ski Instructor Logo" class="w-36" />
			<h3 class="title4">{m.footer_tagline()}</h3>
		</div>

		<div class="flex flex-col gap-6 sm:flex-row sm:gap-12">
			<!-- Main Navigation -->
			<nav class="flex flex-col items-center justify-center">
				<h4 class="mb-2 text-sm font-semibold text-foreground">{m.footer_navigation()}</h4>
				<ul class="flex flex-col items-start gap-1">
					{#each items as { href, label }}
						<li>
							<a
								{href}
								class="text-sm opacity-75 hover:opacity-100 {isCurrentPath(href, page.url.pathname)
									? 'font-semibold text-foreground opacity-100'
									: ''}"
							>
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<!-- Legal Links -->
			<nav class="flex flex-col items-center justify-center">
				<h4 class="mb-2 text-sm font-semibold text-foreground">{m.footer_legal()}</h4>
				<ul class="flex flex-col items-start gap-1">
					{#each legalLinks as { href, label }}
						<li>
							<a
								{href}
								class="text-sm opacity-75 hover:opacity-100 {isCurrentPath(href, page.url.pathname)
									? 'font-semibold text-foreground opacity-100'
									: ''}"
							>
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</div>
</footer>
