<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();

	// Search and filter state
	let searchQuery = $state('');
	let filterReviewed = $state<'all' | 'reviewed' | 'not-reviewed'>('all');
	let sortBy = $state<'recent' | 'lessons' | 'hours' | 'name'>('recent');

	// Filtered and sorted clients
	const filteredClients = $derived(() => {
		let filtered = data.clients;

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(client) =>
					client.clientName.toLowerCase().includes(query) ||
					client.clientEmail.toLowerCase().includes(query)
			);
		}

		// Review filter
		if (filterReviewed === 'reviewed') {
			filtered = filtered.filter((client) => client.hasReview);
		} else if (filterReviewed === 'not-reviewed') {
			filtered = filtered.filter((client) => !client.hasReview);
		}

		// Sort
		const sorted = [...filtered];
		switch (sortBy) {
			case 'recent':
				sorted.sort(
					(a, b) => new Date(b.lastLessonDate).getTime() - new Date(a.lastLessonDate).getTime()
				);
				break;
			case 'lessons':
				sorted.sort((a, b) => b.lessonCount - a.lessonCount);
				break;
			case 'hours':
				sorted.sort((a, b) => parseFloat(b.totalHours.toString()) - parseFloat(a.totalHours.toString()));
				break;
			case 'name':
				sorted.sort((a, b) => a.clientName.localeCompare(b.clientName));
				break;
		}

		return sorted;
	});

	// Format date
	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Format hours
	function formatHours(hours: number) {
		return parseFloat(hours.toString()).toFixed(1);
	}
</script>

<svelte:head>
	<title>My Clients | LocalSnow</title>
</svelte:head>

<div class="container mx-auto max-w-7xl py-6 px-4">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">My Clients</h1>
		<p class="text-muted-foreground">Manage your client relationships and track lesson history</p>
	</div>

	<!-- Stats Cards -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Description>Total Clients</Card.Description>
				<Card.Title class="text-3xl">{data.stats.totalClients}</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Description>Total Lessons</Card.Description>
				<Card.Title class="text-3xl">{data.stats.totalLessons}</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Description>Total Hours</Card.Description>
				<Card.Title class="text-3xl">{formatHours(data.stats.totalHours)}</Card.Title>
			</Card.Header>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Description>With Reviews</Card.Description>
				<Card.Title class="text-3xl">{data.stats.clientsWithReviews}</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>

	<!-- Filters and Search -->
	<Card.Root class="mb-6">
		<Card.Content class="pt-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<!-- Search -->
				<div class="flex-1 max-w-sm">
					<Input
						type="search"
						placeholder="Search by name or email..."
						bind:value={searchQuery}
					/>
				</div>

				<!-- Filter and Sort -->
				<div class="flex gap-2">
					<!-- Review Filter -->
					<select
						bind:value={filterReviewed}
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="all">All Clients</option>
						<option value="reviewed">Has Review</option>
						<option value="not-reviewed">No Review</option>
					</select>

					<!-- Sort -->
					<select
						bind:value={sortBy}
						class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="recent">Most Recent</option>
						<option value="lessons">Most Lessons</option>
						<option value="hours">Most Hours</option>
						<option value="name">Name (A-Z)</option>
					</select>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Clients Table -->
	{#if filteredClients().length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<svg
						class="h-8 w-8 text-muted-foreground"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
				<h3 class="mb-2 text-lg font-semibold">
					{#if searchQuery || filterReviewed !== 'all'}
						No clients match your filters
					{:else}
						No clients yet
					{/if}
				</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					{#if searchQuery || filterReviewed !== 'all'}
						Try adjusting your search or filters
					{:else}
						Add lessons to start building your client database
					{/if}
				</p>
				{#if !searchQuery && filterReviewed === 'all'}
					<Button href="/dashboard/my-lessons/add">Add Your First Lesson</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Content class="p-0">
				<!-- Desktop Table -->
				<div class="hidden md:block overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Client</Table.Head>
								<Table.Head>Contact</Table.Head>
								<Table.Head class="text-center">Lessons</Table.Head>
								<Table.Head class="text-center">Hours</Table.Head>
								<Table.Head>Last Lesson</Table.Head>
								<Table.Head class="text-center">Review</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredClients() as client}
								<Table.Row>
									<Table.Cell class="font-medium">
										{client.clientName}
									</Table.Cell>
									<Table.Cell>
										<div class="flex flex-col gap-1 text-sm">
											<a
												href="mailto:{client.clientEmail}"
												class="text-primary hover:underline"
											>
												{client.clientEmail}
											</a>
											{#if client.clientPhone}
												<a
													href="tel:{client.clientCountryCode}{client.clientPhone}"
													class="text-muted-foreground hover:text-primary"
												>
													{client.clientCountryCode} {client.clientPhone}
												</a>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell class="text-center">
										<Badge variant="secondary">{client.lessonCount}</Badge>
									</Table.Cell>
									<Table.Cell class="text-center">
										{formatHours(client.totalHours)}h
									</Table.Cell>
									<Table.Cell>
										<span class="text-sm text-muted-foreground">
											{formatDate(client.lastLessonDate)}
										</span>
									</Table.Cell>
									<Table.Cell class="text-center">
										{#if client.hasReview}
											<Badge variant="default" class="bg-green-100 text-green-800">
												✓ Yes
											</Badge>
										{:else}
											<Badge variant="outline">No</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex items-center justify-end gap-2">
											<Button
												href="mailto:{client.clientEmail}"
												variant="ghost"
												size="sm"
												title="Send Email"
											>
												<svg
													class="h-4 w-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
													/>
												</svg>
											</Button>
											{#if client.clientPhone}
												<Button
													href="tel:{client.clientCountryCode}{client.clientPhone}"
													variant="ghost"
													size="sm"
													title="Call"
												>
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
														/>
													</svg>
												</Button>
											{/if}
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<!-- Mobile Cards -->
				<div class="md:hidden divide-y">
					{#each filteredClients() as client}
						<div class="p-4">
							<div class="mb-3 flex items-start justify-between">
								<div>
									<h3 class="font-semibold">{client.clientName}</h3>
									<a
										href="mailto:{client.clientEmail}"
										class="text-sm text-primary hover:underline"
									>
										{client.clientEmail}
									</a>
									{#if client.clientPhone}
										<a
											href="tel:{client.clientCountryCode}{client.clientPhone}"
											class="block text-sm text-muted-foreground hover:text-primary"
										>
											{client.clientCountryCode} {client.clientPhone}
										</a>
									{/if}
								</div>
								{#if client.hasReview}
									<Badge variant="default" class="bg-green-100 text-green-800">
										✓ Review
									</Badge>
								{:else}
									<Badge variant="outline">No Review</Badge>
								{/if}
							</div>

							<div class="mb-3 flex gap-4 text-sm">
								<div>
									<span class="text-muted-foreground">Lessons:</span>
									<span class="ml-1 font-medium">{client.lessonCount}</span>
								</div>
								<div>
									<span class="text-muted-foreground">Hours:</span>
									<span class="ml-1 font-medium">{formatHours(client.totalHours)}h</span>
								</div>
								<div>
									<span class="text-muted-foreground">Last:</span>
									<span class="ml-1 font-medium">{formatDate(client.lastLessonDate)}</span>
								</div>
							</div>

							<div class="flex gap-2">
								<Button href="mailto:{client.clientEmail}" variant="outline" size="sm" class="flex-1">
									<svg
										class="mr-2 h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
									Email
								</Button>
								{#if client.clientPhone}
									<Button
										href="tel:{client.clientCountryCode}{client.clientPhone}"
										variant="outline"
										size="sm"
										class="flex-1"
									>
										<svg
											class="mr-2 h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
											/>
										</svg>
										Call
									</Button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Results Count -->
		<div class="mt-4 text-center text-sm text-muted-foreground">
			Showing {filteredClients().length} of {data.clients.length} clients
		</div>
	{/if}
</div>
