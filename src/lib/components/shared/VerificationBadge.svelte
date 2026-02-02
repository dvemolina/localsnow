<script lang="ts">
	import { t } from '$lib/i18n/i18n';

	type BadgeSize = 'sm' | 'md' | 'lg';

	let {
		isVerified,
		size = 'md',
		showUnverified = false,
		class: className = ''
	}: {
		isVerified: boolean;
		size?: BadgeSize;
		showUnverified?: boolean;
		class?: string;
	} = $props();

	// Size mappings - keeping icons small and subtle like Twitter/Instagram
	const iconSizes = {
		sm: 'size-3.5',
		md: 'size-4',
		lg: 'size-5'
	};

	// Tooltip text
	const tooltipText = $derived(
		isVerified
			? $t('verification_tooltip_verified')
			: $t('verification_tooltip_not_verified')
	);
</script>

{#if isVerified}
	<!-- Verified badge - clean blue checkmark like Twitter/Instagram -->
	<span
		class="inline-flex items-center justify-center {className}"
		title={tooltipText}
		aria-label={$t('badge_verified')}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="{iconSizes[size]} text-blue-500"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
				clip-rule="evenodd"
			/>
		</svg>
	</span>
{:else if showUnverified}
	<!-- Only show unverified indicator if explicitly requested - very subtle -->
	<span
		class="inline-flex items-center justify-center {className}"
		title={tooltipText}
		aria-label={$t('badge_not_verified')}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="{iconSizes[size]} text-muted-foreground/40"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
		>
			<circle cx="12" cy="12" r="9" />
		</svg>
	</span>
{/if}
