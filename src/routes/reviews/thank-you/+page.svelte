<script>
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Thank You for Your Review | Local Snow</title>
</svelte:head>

<section class="container mx-auto max-w-2xl px-4 py-12">
	<Card>
		<CardContent class="py-12 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto mb-6 size-20 text-green-500"
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

			<h1 class="mb-3 text-3xl font-bold">Thank You!</h1>

			<p class="mb-2 text-lg text-muted-foreground">
				Your review has been submitted successfully.
			</p>

			<p class="mb-8 text-sm text-muted-foreground">
				Your €15 deposit will be refunded within 5-7 business days.
			</p>

			<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
				<Button href="/" size="lg">Back to Home</Button>
				<Button href="/instructors" variant="outline" size="lg">
					Find More Instructors
				</Button>
			</div>
		</CardContent>
	</Card>
</section>
