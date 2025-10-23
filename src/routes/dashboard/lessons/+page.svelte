<!-- src/routes/dashboard/lessons/+page.svelte -->
<script lang="ts">
	import LessonForm from '$src/features/Lessons/components/LessonForm.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';

	let { data } = $props();
	
	// Mock lesson data - replace with actual data from server
	let lessons = $state([
		{
			id: 1,
			title: 'Private Ski Lesson',
			duration: '1 hour',
			basePrice: 60,
			currency: 'EUR',
			isPublished: true,
			sportId: 1
		}
	]);
</script>

<div class="container mx-auto max-w-6xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">Lesson Management</h1>
		<p class="text-muted-foreground">
			Create and manage your lesson offerings for potential clients
		</p>
	</div>

	<Tabs.Root value="active" class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="active">Active Lessons</Tabs.Trigger>
			<Tabs.Trigger value="create">Create New</Tabs.Trigger>
			<Tabs.Trigger value="drafts">Drafts</Tabs.Trigger>
		</Tabs.List>

		<!-- Active Lessons Tab -->
		<Tabs.Content value="active" class="mt-6">
			<div class="space-y-4">
				{#if lessons.length === 0}
					<div class="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
						<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-semibold">No lessons yet</h3>
						<p class="mb-4 text-sm text-muted-foreground">
							Create your first lesson to start accepting bookings from clients
						</p>
						<Button onclick={() => {
							// Switch to create tab
							document.querySelector('[value="create"]')?.click();
						}}>
							Create Your First Lesson
						</Button>
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each lessons as lesson}
							<div class="rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
								<div class="mb-3 flex items-start justify-between">
									<div>
										<h3 class="font-semibold">{lesson.title}</h3>
										<p class="text-sm text-muted-foreground">{lesson.duration}</p>
									</div>
									<Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
										{lesson.isPublished ? 'Published' : 'Draft'}
									</Badge>
								</div>
								
								<div class="mb-4 flex items-baseline gap-1">
									<span class="text-2xl font-bold">{lesson.basePrice}</span>
									<span class="text-sm text-muted-foreground">{lesson.currency}</span>
								</div>

								<div class="flex gap-2">
									<Button variant="outline" size="sm" class="flex-1">
										Edit
									</Button>
									<Button variant="ghost" size="sm">
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
										</svg>
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</Tabs.Content>

		<!-- Create New Lesson Tab -->
		<Tabs.Content value="create" class="mt-6">
			<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
				<div class="mb-6">
					<h2 class="title4 mb-1">Create New Lesson</h2>
					<p class="text-sm text-muted-foreground">
						Define your lesson details, pricing, and availability
					</p>
				</div>
				<LessonForm lessonForm={data.lessonForm} />
			</div>
		</Tabs.Content>

		<!-- Drafts Tab -->
		<Tabs.Content value="drafts" class="mt-6">
			<div class="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
					<svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h3 class="mb-2 text-lg font-semibold">No draft lessons</h3>
				<p class="text-sm text-muted-foreground">
					Draft lessons will appear here before you publish them
				</p>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>