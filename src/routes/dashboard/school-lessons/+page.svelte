<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-6xl">
	<div class="mb-6">
		<h1 class="title2 mb-2">School Lessons</h1>
		<p class="text-muted-foreground">
			View and manage all lessons offered by your school
		</p>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Lessons</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col items-center justify-center py-12">
				<svg class="mb-4 h-16 w-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
				<h3 class="mb-2 text-lg font-semibold">No lessons yet</h3>
				<p class="text-sm text-muted-foreground text-center max-w-md">
					This feature is coming soon. You'll be able to view all lessons from your school's instructors here.
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</div>
