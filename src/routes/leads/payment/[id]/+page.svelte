<script lang="ts">
	import { Button } from '$src/lib/components/ui/button';
	import { Badge } from '$src/lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data, form } = $props();
	
	const booking = data.bookingRequest;
	const leadPrice = data.leadPrice;
	
	let isProcessing = $state(false);

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Unlock Booking Request - Local Snow</title>
</svelte:head>

<section class="mx-auto max-w-2xl py-8">
	<div class="mb-6">
		<a
			href={localizeHref('/dashboard')}
			class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			Back to Dashboard
		</a>
	</div>

	<div class="rounded-lg border border-border bg-card p-8">
		<div class="mb-6 text-center">
			<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-8 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			</div>
			<h1 class="title2 mb-2">New Booking Request!</h1>
			<p class="text-muted-foreground">
				You have a new booking request. Pay €{leadPrice} to unlock the client's contact information.
			</p>
		</div>

		<!-- Booking Details Preview -->
		<div class="mb-6 rounded-lg border border-border bg-muted/50 p-6">
			<h2 class="mb-4 text-lg font-semibold">Booking Details</h2>
			
			<div class="space-y-3 text-sm">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Client Name:</span>
					<span class="font-medium">{booking.clientName}</span>
				</div>
				
				<div class="flex justify-between">
					<span class="text-muted-foreground">Number of Students:</span>
					<span class="font-medium">{booking.numberOfStudents}</span>
				</div>
				
				<div class="flex justify-between">
					<span class="text-muted-foreground">Start Date:</span>
					<span class="font-medium">{formatDate(booking.startDate)}</span>
				</div>
				
				{#if booking.endDate}
					<div class="flex justify-between">
						<span class="text-muted-foreground">End Date:</span>
						<span class="font-medium">{formatDate(booking.endDate)}</span>
					</div>
				{/if}
				
				<div class="flex justify-between">
					<span class="text-muted-foreground">Hours per Day:</span>
					<span class="font-medium">{booking.hoursPerDay}h</span>
				</div>
				
				<div class="flex justify-between">
					<span class="text-muted-foreground">Skill Level:</span>
					<Badge variant="outline">{booking.skillLevel}</Badge>
				</div>
				
				{#if booking.estimatedPrice}
					<div class="flex justify-between border-t border-border pt-3">
						<span class="text-muted-foreground">Estimated Value:</span>
						<span class="text-lg font-bold text-primary">
							{booking.estimatedPrice}{booking.currency || '€'}
						</span>
					</div>
				{/if}
			</div>

			{#if booking.message}
				<div class="mt-4 border-t border-border pt-4">
					<p class="mb-1 text-xs font-medium text-muted-foreground">Client Message:</p>
					<p class="text-sm italic">{booking.message}</p>
				</div>
			{/if}
		</div>

		<!-- Payment Section -->
		<div class="mb-6 rounded-lg bg-primary/5 p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="font-medium">Accept & Unlock Contact Info</span>
				<span class="text-2xl font-bold text-primary">€{leadPrice}</span>
			</div>
			<p class="text-sm text-muted-foreground">
				By paying, you accept this booking and receive client's email, phone, and full details.
			</p>
		</div>

		{#if form?.message}
					<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
						<p class="text-sm">{form.message}</p>
					</div>
				{/if}


		<form method="POST" action="?/createCheckout" use:enhance={() => {
					isProcessing = true;
					return async ({ update }) => {
						await update();
						isProcessing = false;
					};
				}}>
			<Button 
				type="submit" 
				class="w-full" 
				size="lg"
				disabled={isProcessing}
			>
				{#if isProcessing}
					Processing...
				{:else}
					Pay €{leadPrice} & Accept Booking
				{/if}
			</Button>
		</form>

		<p class="mt-4 text-center text-xs text-muted-foreground">
			🔒 Payment confirms your acceptance of this booking request
		</p>
	</div>

	<!-- Info Box -->
	<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
		<h3 class="mb-2 font-medium">What happens next?</h3>
		<ul class="space-y-2 text-sm text-muted-foreground">
			<li class="flex items-start gap-2">
				<svg class="mt-0.5 size-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
				</svg>
				<span>After payment, you'll receive the client's full contact information via email</span>
			</li>
			<li class="flex items-start gap-2">
				<svg class="mt-0.5 size-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
				</svg>
				<span>Contact the client directly to confirm booking and finalize details</span>
			</li>
			<li class="flex items-start gap-2">
				<svg class="mt-0.5 size-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
				</svg>
				<span>Arrange your lesson and get paid directly by the client</span>
			</li>
		</ul>
	</div>
</section>