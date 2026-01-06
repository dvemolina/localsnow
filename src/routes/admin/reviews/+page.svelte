<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{m["admin.reviews.admin_review_management"]()}</h1>
		<p class="text-muted-foreground">{m["admin.reviews.admin_review_management_desc"]()}</p>
	</div>

	<p class="text-sm text-muted-foreground">
		{m.admin_showing_of({ count: data.reviews.length, total: data.pagination.total })} {m.admin_reviews().toLowerCase()}
	</p>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.table_id()}</Table.Head>
						<Table.Head>{m.table_instructor()}</Table.Head>
						<Table.Head>{m.table_rating()}</Table.Head>
						<Table.Head>{m["admin.reviews.table_comment"]()}</Table.Head>
						<Table.Head>{m.table_client()}</Table.Head>
						<Table.Head>{m.table_date()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.reviews as review}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								#{review.id}
							</Table.Cell>
							<Table.Cell class="font-medium">
								{review.instructor.name} {review.instructor.lastName}
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-1">
									<span>{review.rating}</span>
									<span class="text-yellow-500">⭐</span>
								</div>
							</Table.Cell>
							<Table.Cell class="max-w-md">
								<p class="truncate text-sm">
									{review.comment || m.admin_no_comment()}
								</p>
							</Table.Cell>
							<Table.Cell class="text-sm text-muted-foreground">
								{review.clientEmail}
							</Table.Cell>
							<Table.Cell>{formatDate(review.createdAt)}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			{#if data.pagination.page > 1}
				<Button href="/admin/reviews?page={data.pagination.page - 1}" variant="outline" size="sm">
					{m.button_previous()}
				</Button>
			{/if}
			<span class="text-sm">{m.admin_page_of({ page: data.pagination.page, total: data.pagination.totalPages })}</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/reviews?page={data.pagination.page + 1}" variant="outline" size="sm">
					{m.button_next()}
				</Button>
			{/if}
		</div>
	{/if}
</div>
