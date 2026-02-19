<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Button from '$src/lib/components/ui/button/button.svelte';
	import * as Card from '$src/lib/components/ui/card';

	interface CompletionItem {
		key: string;
		label: string;
		description: string;
		completed: boolean;
		/** If true, shows a "Required for verification" badge on incomplete items */
		required: boolean;
		/** Where the "Add →" link points. Defaults to /dashboard/profile */
		href?: string;
	}

	let {
		completionItems,
		completedCount,
		totalCount
	}: {
		completionItems: CompletionItem[];
		completedCount: number;
		totalCount: number;
	} = $props();

	const STORAGE_KEY = 'profileCompletionCardCollapsed';

	let collapsed = $state(false);

	$effect(() => {
		if (browser) {
			collapsed = sessionStorage.getItem(STORAGE_KEY) === 'true';
		}
	});

	function toggleCollapsed() {
		collapsed = !collapsed;
		if (browser) {
			sessionStorage.setItem(STORAGE_KEY, String(collapsed));
		}
	}

	const progressPercent = $derived(Math.round((completedCount / totalCount) * 100));

	// Colour thresholds for progress bar
	const progressColor = $derived(
		progressPercent >= 80
			? 'bg-green-500'
			: progressPercent >= 50
				? 'bg-amber-500'
				: 'bg-red-500'
	);

	const requiredRemaining = $derived(
		completionItems.filter((i) => i.required && !i.completed).length
	);
</script>

<Card.Root class="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
	<!-- Header (always visible) -->
	<Card.Header class="pb-3">
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1 min-w-0">
				<Card.Title class="flex items-center gap-2 text-amber-900 dark:text-amber-100">
					<svg class="h-5 w-5 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd" />
					</svg>
					Complete your profile
				</Card.Title>

				<!-- Progress row -->
				<div class="mt-2 flex items-center gap-3">
					<div class="relative h-2 flex-1 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-800">
						<div
							class="h-full rounded-full transition-all duration-500 {progressColor}"
							style="width: {progressPercent}%"
						></div>
					</div>
					<span class="flex-shrink-0 text-xs font-medium text-amber-800 dark:text-amber-200">
						{completedCount} / {totalCount}
					</span>
				</div>

				{#if requiredRemaining > 0}
					<p class="mt-1.5 text-xs text-amber-700 dark:text-amber-300">
						{requiredRemaining} required field{requiredRemaining > 1 ? 's' : ''} still needed for verification
					</p>
				{:else if completedCount < totalCount}
					<p class="mt-1.5 text-xs text-amber-700 dark:text-amber-300">
						All required fields done — finish the optional ones to strengthen your profile
					</p>
				{:else}
					<p class="mt-1.5 text-xs text-green-700 dark:text-green-300">
						Profile complete! Awaiting admin verification.
					</p>
				{/if}
			</div>

			<!-- Collapse toggle -->
			<button
				onclick={toggleCollapsed}
				class="flex-shrink-0 rounded-md p-1 text-amber-700 transition-colors hover:bg-amber-200 dark:text-amber-300 dark:hover:bg-amber-800"
				aria-label={collapsed ? 'Expand profile checklist' : 'Collapse profile checklist'}
			>
				<svg
					class="h-5 w-5 transition-transform duration-200 {collapsed ? '' : 'rotate-180'}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</div>
	</Card.Header>

	<!-- Checklist (collapsible) -->
	{#if !collapsed}
		<Card.Content class="pt-0">
			<ul class="space-y-2">
				{#each completionItems as item (item.key)}
					<li
						class="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors
							{item.completed
								? 'bg-green-50 dark:bg-green-950/30'
								: item.required
									? 'bg-red-50 dark:bg-red-950/30'
									: 'bg-white/60 dark:bg-white/5'}"
					>
						<!-- Status icon -->
						{#if item.completed}
							<span class="flex-shrink-0">
								<svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd" />
								</svg>
							</span>
						{:else if item.required}
							<span class="flex-shrink-0">
								<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd" />
								</svg>
							</span>
						{:else}
							<span class="flex-shrink-0">
								<svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
										clip-rule="evenodd" />
								</svg>
							</span>
						{/if}

						<!-- Label + description -->
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-1.5">
								<span
									class="text-sm font-medium
										{item.completed
											? 'text-green-800 dark:text-green-200'
											: item.required
												? 'text-red-800 dark:text-red-200'
												: 'text-foreground'}"
								>
									{item.label}
								</span>
								{#if item.required && !item.completed}
									<span class="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/50 dark:text-red-300">
										Required
									</span>
								{/if}
							</div>
							<p class="text-xs text-muted-foreground">{item.description}</p>
						</div>

						<!-- CTA for incomplete items -->
						{#if !item.completed}
							<a
								href={item.href ?? '/dashboard/profile'}
								class="flex-shrink-0 text-xs font-medium text-primary hover:underline"
							>
								Add →
							</a>
						{/if}
					</li>
				{/each}
			</ul>

			<div class="mt-4">
				<Button onclick={() => goto('/dashboard/profile')} size="sm" variant="default">
					Complete my profile
				</Button>
			</div>
		</Card.Content>
	{/if}
</Card.Root>
