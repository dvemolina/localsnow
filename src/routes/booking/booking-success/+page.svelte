<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { useIntlayer } from 'svelte-intlayer';

	const bookingId = $page.url.searchParams.get('bookingId');
</script>

<svelte:head>
	<title>{$booking_success.booking_success_page_title.value} - Local Snow</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="mx-auto max-w-2xl py-12">
	<div class="rounded-lg border border-border bg-card p-8 text-center">
		<!-- Success Icon -->
		<div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
			<svg class="size-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</div>

		<!-- Success Message -->
		<h1 class="title2 mb-4">{$booking_success.booking_success_heading.value}</h1>
		<p class="mb-6 text-muted-foreground">
			{$booking_success.booking_success_message.value}
		</p>

		<!-- What Happens Next -->
		<div class="mb-8 rounded-lg bg-muted/50 p-6 text-left">
			<h2 class="mb-4 text-lg font-semibold">{$booking_success.booking_success_next_steps.value}</h2>
			<ol class="space-y-3 text-sm text-muted-foreground">
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
					<span>{$booking_success.booking_success_step1.value}</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
					<span>{$booking_success.booking_success_step2.value}</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
					<span>{$booking_success.booking_success_step3.value}</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
					<span>{$booking_success.booking_success_step4.value}</span>
				</li>
			</ol>
		</div>

		<!-- Deposit Info -->
		<div class="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-left">
			<div class="flex items-start gap-3">
				<svg class="mt-0.5 size-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div class="text-sm text-blue-900">
					<p class="font-semibold mb-1">{$booking_success.booking_success_deposit_title.value}</p>
					<p>{$booking_success.booking_success_deposit_info.value}</p>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button onclick={() => window.location.href = '/'} variant="default">
				{$booking_success.button_back_to_home.value}
			</Button>
			<Button onclick={() => window.location.href = '/instructors'} variant="outline">
				{$booking_success.button_browse_more_instructors.value}
			</Button>
		</div>

		{#if bookingId}
			<p class="mt-6 text-xs text-muted-foreground">
				{$booking_success.booking_reference.value}: #{bookingId}
			</p>
		{/if}
	</div>
</section>