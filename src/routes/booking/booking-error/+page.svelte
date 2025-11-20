<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';

	const reason = $page.url.searchParams.get('reason');

	const errorMessages = $derived({
		no_session: {
			title: m.error_no_session_title(),
			description: m.error_no_session_desc()
		},
		payment_failed: {
			title: m.error_payment_failed_title(),
			description: m.error_payment_failed_desc()
		},
		processing_error: {
			title: m.error_processing_title(),
			description: m.error_processing_desc()
		}
	});

	const error = $derived(errorMessages[reason || 'processing_error'] || errorMessages.processing_error);
</script>

<svelte:head>
	<title>{m.booking_error_page_title()} - Local Snow</title>
</svelte:head>

<section class="mx-auto max-w-2xl py-12">
	<div class="rounded-lg border border-red-200 bg-card p-8 text-center">
		<!-- Error Icon -->
		<div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
			<svg class="size-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</div>

		<!-- Error Message -->
		<h1 class="title2 mb-4 text-red-900">{error.title}</h1>
		<p class="mb-8 text-muted-foreground">
			{error.description}
		</p>

		<!-- Support Info -->
		<div class="mb-6 rounded-lg bg-muted/50 p-4 text-left text-sm">
			<p class="font-semibold mb-2">{m.error_need_help()}</p>
			<p class="text-muted-foreground">
				{m.error_support_message()}
			</p>
		</div>

		<!-- Actions -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button onclick={() => window.history.back()} variant="default">
				{m.button_try_again()}
			</Button>
			<Button onclick={() => window.location.href = '/instructors'} variant="outline">
				{m.button_browse_instructors()}
			</Button>
		</div>
	</div>
</section>