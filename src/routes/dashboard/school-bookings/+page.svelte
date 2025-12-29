<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-6xl">
	<div class="mb-6">
		<h1 class="title2 mb-2">School Bookings</h1>
		<p class="text-muted-foreground">
			View all bookings for your school's instructors
		</p>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Bookings</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col items-center justify-center py-12">
				<svg class="mb-4 h-16 w-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				<h3 class="mb-2 text-lg font-semibold">No bookings yet</h3>
				<p class="text-sm text-muted-foreground text-center max-w-md">
					This feature is coming soon. You'll be able to view all bookings across your school's instructors here.
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
