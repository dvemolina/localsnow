<!-- src/features/Dashboard/components/ProfileVisitsCard.svelte -->
<script lang="ts">
	import * as Card from '$src/lib/components/ui/card';

	let { visits = 0 } = $props();
</script>

<Card.Root>
	<Card.Header class="pb-2">
		<Card.Title class="text-sm font-medium text-muted-foreground">
			Profile Visits
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="text-2xl font-bold">{visits}</div>
		<p class="text-xs text-muted-foreground">
			This month
		</p>
	</Card.Content>
</Card.Root>