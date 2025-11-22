<script lang="ts">
	import { Button } from '$src/lib/components/ui/button';
	import { Badge } from '$src/lib/components/ui/badge';
	import { route } from '$lib/i18n/routeHelpers';

	let { data } = $props();
	
	const booking = data.bookingRequest;

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<svelte:head>
	<title>Booking Contact Info - Local Snow</title>
</svelte:head>

<section class="mx-auto max-w-3xl py-8">
	<div class="mb-6">
		<a
			href={route('/dashboard')}
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

	<!-- Success Message -->
	<div class="mb-6 rounded-lg border border-green-200 bg-green-50 p-6 ">
		<div class="flex items-start gap-4">
			<div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 ">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-6 text-green-600 "
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div class="flex-1">
				<h1 class="mb-2 text-xl font-bold text-green-900 ">Payment Successful!</h1>
				<p class="text-green-700 ">
					You've unlocked the contact information for this booking request. The details have also been sent to your email.
				</p>
			</div>
		</div>
	</div>

	<!-- Contact Information Card -->
	<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold">Client Contact Information</h2>
		
		<div class="space-y-4">
			<!-- Name -->
			<div class="flex items-center justify-between rounded-lg bg-muted/50 p-4">
				<div class="flex-1">
					<p class="mb-1 text-xs text-muted-foreground">Full Name</p>
					<p class="text-lg font-medium">{booking.clientName}</p>
				</div>
				<button
					onclick={() => copyToClipboard(booking.clientName)}
					class="rounded p-2 transition-colors hover:bg-muted"
					title="Copy to clipboard"
				>
					<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				</button>
			</div>

			<!-- Email -->
			<div class="flex items-center justify-between rounded-lg bg-muted/50 p-4">
				<div class="flex-1">
					<p class="mb-1 text-xs text-muted-foreground">Email Address</p>
					<a 
						href={`mailto:${booking.clientEmail}`}
						class="text-lg font-medium text-primary hover:underline"
					>
						{booking.clientEmail}
					</a>
				</div>
				<button
					onclick={() => copyToClipboard(booking.clientEmail)}
					class="rounded p-2 transition-colors hover:bg-muted"
					title="Copy to clipboard"
				>
					<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				</button>
			</div>

			<!-- Phone -->
			{#if booking.clientPhone}
				<div class="flex items-center justify-between rounded-lg bg-muted/50 p-4">
					<div class="flex-1">
						<p class="mb-1 text-xs text-muted-foreground">Phone Number</p>
						<a 
							href={`tel:+${booking.clientCountryCode}${booking.clientPhone}`}
							class="text-lg font-medium text-primary hover:underline"
						>
							+{booking.clientCountryCode} {booking.clientPhone}
						</a>
					</div>
					<button
						onclick={() => copyToClipboard(`+${booking.clientCountryCode}${booking.clientPhone}`)}
						class="rounded p-2 transition-colors hover:bg-muted"
						title="Copy to clipboard"
					>
						<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					</button>
				</div>
			{/if}
		</div>

		<!-- Quick Actions -->
		<div class="mt-6 flex flex-wrap gap-3">
			<Button 
				onclick={() => window.location.href = `mailto:${booking.clientEmail}?subject=Booking Request - Local Snow`}
				class="flex-1"
			>
				<svg class="mr-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
				Send Email
			</Button>
			{#if booking.clientPhone}
				<Button 
					variant="outline"
					onclick={() => window.location.href = `tel:+${booking.clientCountryCode}${booking.clientPhone}`}
					class="flex-1"
				>
					<svg class="mr-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
					</svg>
					Call Client
				</Button>
			{/if}
		</div>
	</div>

	<!-- Booking Details -->
	<div class="mt-6 rounded-lg border border-border bg-card p-6">
		<h2 class="mb-4 text-lg font-semibold">Booking Details</h2>
		
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<p class="mb-1 text-sm text-muted-foreground">Number of Students</p>
				<p class="font-medium">{booking.numberOfStudents}</p>
			</div>
			
			<div>
				<p class="mb-1 text-sm text-muted-foreground">Hours per Day</p>
				<p class="font-medium">{booking.hoursPerDay}h</p>
			</div>
			
			<div>
				<p class="mb-1 text-sm text-muted-foreground">Start Date</p>
				<p class="font-medium">{formatDate(booking.startDate)}</p>
			</div>
			
			{#if booking.endDate}
				<div>
					<p class="mb-1 text-sm text-muted-foreground">End Date</p>
					<p class="font-medium">{formatDate(booking.endDate)}</p>
				</div>
			{/if}
			
			<div>
				<p class="mb-1 text-sm text-muted-foreground">Skill Level</p>
				<Badge variant="outline">{booking.skillLevel}</Badge>
			</div>
			
			<div>
				<p class="mb-1 text-sm text-muted-foreground">Sports</p>
				<div class="flex flex-wrap gap-1">
					{#each booking.sports as sport}
						<Badge variant="secondary" class="text-xs">{sport}</Badge>
					{/each}
				</div>
			</div>
		</div>

		{#if booking.estimatedPrice}
			<div class="mt-4 border-t border-border pt-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Estimated Value</span>
					<span class="text-xl font-bold text-primary">
						{booking.estimatedPrice}{booking.currency || '€'}
					</span>
				</div>
			</div>
		{/if}

		{#if booking.message}
			<div class="mt-4 border-t border-border pt-4">
				<p class="mb-2 text-sm font-medium">Client Message:</p>
				<p class="text-sm text-muted-foreground">{booking.message}</p>
			</div>
		{/if}
	</div>

	<!-- Next Steps -->
	<div class="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6">
		<h3 class="mb-3 font-semibold">Next Steps</h3>
		<ol class="space-y-2 text-sm">
			<li class="flex items-start gap-2">
				<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
				<span>Contact the client via email or phone to confirm availability</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
				<span>Discuss and finalize lesson details, schedule, and pricing</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
				<span>Arrange payment directly with the client</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
				<span>Deliver an amazing lesson experience! ⛷️</span>
			</li>
		</ol>
	</div>
</section>