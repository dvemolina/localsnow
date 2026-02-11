<script lang="ts">
	import { page } from '$app/state';
	import { isCurrentPath } from '$src/lib/utils/generics';
	import { t } from '$lib/i18n/i18n';
	import { route } from '$lib/i18n/routeHelpers';
	// Navigation items - use $derived for translation reactivity
	const items = $derived([
		{ label: $t('nav_instructors'), href: route('/instructors') },
		{ label: $t('nav_schools'), href: route('/schools') },
		{ label: $t('nav_resorts'), href: route('/resorts') },
		{ label: $t('nav_how_it_works'), href: route('/how-it-works') },
		{ label: $t('nav_about'), href: route('/about') },
		{ label: $t('nav_signup'), href: route('/signup') },
		{ label: $t('nav_contact'), href: route('/contact')}
	]);

	// Legal links - use $derived for translation reactivity
	const legalLinks = $derived([
		{ label: $t('footer_privacy'), href: route('/legal/privacy') },
		{ label: $t('footer_terms'), href: route('/legal/terms') },
		{ label: $t('footer_cookies'), href: route('/legal/cookies') }
	]);
</script>

<footer class="flex w-full items-center justify-center mt-12">
	<div
		class="grey-section mt-4 flex w-full max-w-4xl flex-col sm:flex-row items-center justify-between gap-8 rounded-md border border-border/50 bg-card p-6 shadow-xs sm:my-4 sm:p-12"
	>
		<div class="flex max-w-64 flex-col items-center justify-center gap-2 text-center">
			<img src="/localsnow-logo-v.png" alt="Local Snow Ski Instructor Logo" class="w-36" />
			<h3 class="title4">{$t('footer_tagline')}</h3>
		</div>

		<div class="flex flex-col gap-6 sm:flex-row sm:gap-12">
			<!-- Main Navigation -->
			<nav class="flex flex-col items-center justify-start">
				<h4 class="mb-2 text-sm font-semibold text-foreground">{$t('footer_navigation')}</h4>
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
			<nav class="flex flex-col items-center justify-start">
				<h4 class="mb-2 text-sm font-semibold text-foreground">{$t('footer_legal')}</h4>
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
