<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { useIntlayer } from 'svelte-intlayer';

	const reason = $page.url.searchParams.get('reason');

	const errorMessages = $derived({
		no_session: {
			title: $booking_error.error_no_session_title.value,
			description: $booking_error.error_no_session_desc.value
		},
		payment_failed: {
			title: $booking_error.error_payment_failed_title.value,
			description: $booking_error.error_payment_failed_desc.value
		},
		processing_error: {
			title: $booking_error.error_processing_title.value,
			description: $booking_error.error_processing_desc.value
		}
	});

	const error = $derived(errorMessages[reason || 'processing_error'] || errorMessages.processing_error);
</script>

<svelte:head>
	<title>{$booking_error.booking_error_page_title.value} - Local Snow</title>
	<meta name="robots" content="noindex, nofollow" />
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
			<p class="font-semibold mb-2">{$booking_error.error_need_help.value}</p>
			<p class="text-muted-foreground">
				{$booking_error.error_support_message.value}
			</p>
		</div>

		<!-- Actions -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button onclick={() => window.history.back()} variant="default">
				{$booking_error.button_try_again.value}
			</Button>
			<Button onclick={() => window.location.href = '/instructors'} variant="outline">
				{$booking_error.button_browse_instructors.value}
			</Button>
		</div>
	</div>
</section>