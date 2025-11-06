<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';

	const bookingId = $page.url.searchParams.get('bookingId');
</script>

<svelte:head>
	<title>Booking Request Sent - Local Snow</title>
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
		<h1 class="title2 mb-4">Booking Request Sent Successfully!</h1>
		<p class="mb-6 text-muted-foreground">
			Your €15 deposit has been secured and your booking request has been sent to the instructor.
		</p>

		<!-- What Happens Next -->
		<div class="mb-8 rounded-lg bg-muted/50 p-6 text-left">
			<h2 class="mb-4 text-lg font-semibold">What Happens Next?</h2>
			<ol class="space-y-3 text-sm text-muted-foreground">
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
					<span>The instructor will review your request within 24 hours</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
					<span>If they accept, you'll receive their contact information via email</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
					<span>After the lesson is completed, your €15 deposit will be refunded</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
					<span>If no instructor accepts within 48 hours, you'll receive an automatic refund</span>
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
					<p class="font-semibold mb-1">About Your Deposit</p>
					<p>Your €15 deposit is held securely by Stripe and will be automatically refunded based on the outcome of your booking.</p>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button onclick={() => window.location.href = '/'} variant="default">
				Back to Home
			</Button>
			<Button onclick={() => window.location.href = '/instructors'} variant="outline">
				Browse More Instructors
			</Button>
		</div>

		{#if bookingId}
			<p class="mt-6 text-xs text-muted-foreground">
				Booking Reference: #{bookingId}
			</p>
		{/if}
	</div>
</section>