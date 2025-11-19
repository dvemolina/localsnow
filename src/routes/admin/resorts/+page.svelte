<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{m.admin_resort_management()}</h1>
		<p class="text-muted-foreground">{m.admin_resort_management_desc({ count: data.resorts.length })}</p>
	</div>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.table_id()}</Table.Head>
						<Table.Head>{m.table_name()}</Table.Head>
						<Table.Head>{m.table_region()}</Table.Head>
						<Table.Head>{m.table_country()}</Table.Head>
						<Table.Head>{m.table_image()}</Table.Head>
						<Table.Head>{m.table_actions()}</Table.Head>
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
										<span class="text-xs text-muted-foreground">{m.admin_set()}</span>
									</div>
								{:else}
									<span class="text-xs text-muted-foreground">{m.admin_no_image()}</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Button href="/admin/resorts/{resort.id}" size="sm" variant="outline">
									{m.button_edit()}
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
