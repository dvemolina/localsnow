<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';

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
		<h1 class="title2 mb-2">Review Management</h1>
		<p class="text-muted-foreground">Monitor and moderate platform reviews</p>
	</div>

	<p class="text-sm text-muted-foreground">
		Showing {data.reviews.length} of {data.pagination.total} reviews
	</p>

	<Card>
		<CardContent class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>Instructor</Table.Head>
						<Table.Head>Rating</Table.Head>
						<Table.Head>Comment</Table.Head>
						<Table.Head>Client</Table.Head>
						<Table.Head>Date</Table.Head>
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
									{review.comment || 'No comment'}
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
					Previous
				</Button>
			{/if}
			<span class="text-sm">Page {data.pagination.page} of {data.pagination.totalPages}</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<Button href="/admin/reviews?page={data.pagination.page + 1}" variant="outline" size="sm">
					Next
				</Button>
			{/if}
		</div>
	{/if}
</div>
