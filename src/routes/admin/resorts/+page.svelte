<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
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
						<Table.Head>ID</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Region</Table.Head>
						<Table.Head>Country</Table.Head>
						<Table.Head>Image</Table.Head>
						<Table.Head>Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.resorts as resort}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								#{resort.id}
							</Table.Cell>
							<Table.Cell class="font-medium">{resort.name}</Table.Cell>
							<Table.Cell>
								{#if resort.region}
									{resort.region.region}
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{resort.country.country}</Badge>
							</Table.Cell>
							<Table.Cell>
								{#if resort.image}
									<div class="flex items-center gap-2">
										<img src={resort.image} alt={resort.name} class="h-8 w-12 rounded object-cover" />
										<span class="text-xs text-muted-foreground">Set</span>
									</div>
								{:else}
									<span class="text-xs text-muted-foreground">No image</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Button href="/admin/resorts/{resort.id}" size="sm" variant="outline">
									Edit
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
