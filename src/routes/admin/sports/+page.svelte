<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="title2 mb-2">{m["admin.sports.admin_sport_management"]()}</h1>
			<p class="text-muted-foreground">{m["admin.sports.admin_sport_management_desc"]()}</p>
		</div>
		<Button href="/admin/sports/create">
			{m.admin_create_sport()}
		</Button>
	</div>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.table_id()}</Table.Head>
						<Table.Head>{m["admin.sports.table_sport"]()}</Table.Head>
						<Table.Head>{m["admin.sports.table_slug"]()}</Table.Head>
						<Table.Head>{m["admin.sports.admin_instructors_teaching"]()}</Table.Head>
						<Table.Head>{m.table_actions()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.sports.length === 0}
						<Table.Row>
							<Table.Cell colspan={5} class="text-center text-muted-foreground">
								{m["admin.sports.admin_no_sports_found"]()}
							</Table.Cell>
						</Table.Row>
					{:else}
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
								<Table.Cell>
									<Button href="/admin/sports/{sport.id}/edit" size="sm" variant="outline">
										{m.button_edit()}
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
