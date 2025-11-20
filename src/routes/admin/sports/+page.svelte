<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{m.admin_sport_management()}</h1>
		<p class="text-muted-foreground">{m.admin_sport_management_desc()}</p>
	</div>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.table_id()}</Table.Head>
						<Table.Head>{m.table_sport()}</Table.Head>
						<Table.Head>{m.table_slug()}</Table.Head>
						<Table.Head>{m.admin_instructors_teaching()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.sports as sport}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								#{sport.id}
							</Table.Cell>
							<Table.Cell class="font-medium">{sport.sport}</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{sport.sportSlug}</Badge>
							</Table.Cell>
							<Table.Cell>
								<Badge>{sport.instructorCount} {m.admin_instructors().toLowerCase()}</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
