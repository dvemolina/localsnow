<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';

	let showBanner = $state(false);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		// Check if user has already made a choice
		const consent = localStorage.getItem('cookie_consent');
		if (!consent) {
			// Show banner after a short delay for better UX
			setTimeout(() => {
				showBanner = true;
			}, 1000);
		}
	});

	function acceptCookies() {
		localStorage.setItem('cookie_consent', 'accepted');
		localStorage.setItem('cookie_consent_date', new Date().toISOString());
		showBanner = false;
	}

	function rejectCookies() {
		localStorage.setItem('cookie_consent', 'rejected');
		localStorage.setItem('cookie_consent_date', new Date().toISOString());
		showBanner = false;
	}
</script>

{#if mounted && showBanner}
	<div
		class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg transition-transform duration-300"
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
							class="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground"
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
							<p id="cookie-consent-description" class="text-sm text-foreground">
								We use essential cookies to keep you logged in and make our platform work. We
								also use optional cookies to remember your preferences. You can choose which
								cookies to accept.
								<a
									href="/legal/cookies"
									class="underline hover:text-foreground"
									target="_blank"
									rel="noopener noreferrer"
								>
									Learn more in our Cookie Policy
								</a>.
							</p>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-col gap-2 sm:flex-row sm:flex-shrink-0">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={rejectCookies}
						class="w-full sm:w-auto"
					>
						Essential Only
					</Button>
					<Button
						type="button"
						variant="default"
						size="sm"
						onclick={acceptCookies}
						class="w-full sm:w-auto"
					>
						Accept All
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
