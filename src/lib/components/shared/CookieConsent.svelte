<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { route } from '$lib/i18n/routeHelpers';
	import { t } from '$lib/i18n/i18n';

	let showBanner = $state(false);
	let mounted = $state(false);

	const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

	function getCookie(name: string): string | null {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			return decodeURIComponent(parts.pop()?.split(';').shift() ?? '');
		}
		return null;
	}

	function getStoredConsent(): 'accepted' | 'rejected' | null {
		const localStorageValue = localStorage.getItem('cookie_consent');
		if (localStorageValue === 'accepted' || localStorageValue === 'rejected') {
			return localStorageValue;
		}

		const cookieValue = getCookie('cookie_consent');
		if (cookieValue === 'accepted' || cookieValue === 'rejected') {
			return cookieValue;
		}

		return null;
	}

	function setConsentCookie(name: string, value: string) {
		const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secureAttr}`;
	}

	function persistConsent(value: 'accepted' | 'rejected') {
		const timestamp = new Date().toISOString();
		localStorage.setItem('cookie_consent', value);
		localStorage.setItem('cookie_consent_date', timestamp);
		setConsentCookie('cookie_consent', value);
		setConsentCookie('cookie_consent_date', timestamp);
	}

	onMount(() => {
		mounted = true;
		// Check if user has already made a choice
		const consent = getStoredConsent();
		if (!consent) {
			// Show banner after a short delay for better UX
			setTimeout(() => {
				showBanner = true;
			}, 1000);
		}
	});

	function acceptCookies() {
		persistConsent('accepted');
		showBanner = false;
	}

	function rejectCookies() {
		persistConsent('rejected');
		showBanner = false;
	}
</script>

{#if mounted && showBanner}
	<div
		class="border-border bg-card fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg transition-transform duration-300"
		role="dialog"
		aria-label="Cookie consent"
		aria-describedby="cookie-consent-description"
	>
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<!-- Cookie Message -->
				<div class="flex-1 pr-4">
					<div class="flex items-start gap-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<p id="cookie-consent-description" class="text-foreground text-sm">
								{$t('cookie_banner_description')}
								<a
									href={route('/legal/cookies')}
									class="hover:text-foreground underline"
									target="_blank"
									rel="noopener noreferrer"
								>
									{$t('cookie_banner_link')}
								</a>.
							</p>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-col gap-2 sm:flex-shrink-0 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={rejectCookies}
						class="w-full sm:w-auto"
					>
						{$t('cookie_banner_reject')}
					</Button>
					<Button
						type="button"
						variant="default"
						size="sm"
						onclick={acceptCookies}
						class="w-full sm:w-auto"
					>
						{$t('cookie_banner_accept')}
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Smooth slide-up animation */
	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	div[role='dialog'] {
		animation: slideUp 0.3s ease-out;
	}
</style>
