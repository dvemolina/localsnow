<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">Resort Management</h1>
		<p class="text-muted-foreground">View and manage ski resorts ({data.resorts.length} total)</p>
	</div>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Region</Table.Head>
						<Table.Head>Country</Table.Head>
						<Table.Head>Elevation</Table.Head>
						<Table.Head>Website</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.resorts as resort}
						<Table.Row>
							<Table.Cell class="font-medium">{resort.name}</Table.Cell>
							<Table.Cell>{resort.region.region}</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{resort.country.country}</Badge>
							</Table.Cell>
							<Table.Cell class="text-sm">
								{#if resort.minElevation && resort.maxElevation}
									{resort.minElevation}m - {resort.maxElevation}m
								{:else}
									-
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if resort.website}
									<a
										href={resort.website}
										target="_blank"
										class="text-sm text-blue-600 hover:underline"
									>
										Visit →
									</a>
								{:else}
									-
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
