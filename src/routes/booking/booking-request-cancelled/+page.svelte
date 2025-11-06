<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>Booking Cancelled - Local Snow</title>
</svelte:head>

<section class="mx-auto max-w-2xl py-12">
	<div class="rounded-lg border border-border bg-card p-8 text-center">
		<!-- Cancelled Icon -->
		<div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gray-100">
			<svg class="size-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</div>

		<!-- Message -->
		<h1 class="title2 mb-4">Booking Request Cancelled</h1>
		<p class="mb-8 text-muted-foreground">
			Your booking request was not submitted. No charges were made to your account.
		</p>

		<!-- Info Box -->
		<div class="mb-6 rounded-lg bg-muted/50 p-4 text-left text-sm">
			<p class="text-muted-foreground">
				You can restart the booking process at any time by selecting an instructor and filling out the booking form again.
			</p>
		</div>

		<!-- Actions -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button onclick={() => window.location.href = '/instructors'} variant="default">
				Find an Instructor
			</Button>
			<Button onclick={() => window.location.href = '/'} variant="outline">
				Back to Home
			</Button>
		</div>
	</div>
</section>