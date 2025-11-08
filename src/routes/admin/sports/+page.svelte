<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Sport Management</h1>
		<p class="text-muted-foreground">View platform sports and instructor distribution</p>
	</div>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Sport</Table.Head>
						<Table.Head>Slug</Table.Head>
						<Table.Head>Instructors Teaching</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.sports as sport}
						<Table.Row>
							<Table.Cell class="font-medium">{sport.sport}</Table.Cell>
							<Table.Cell>
								<Badge variant="outline">{sport.sportSlug}</Badge>
							</Table.Cell>
							<Table.Cell>
								<Badge>{sport.instructorCount} instructors</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
