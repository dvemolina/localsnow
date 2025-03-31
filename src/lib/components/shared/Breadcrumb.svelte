<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	let { page = $bindable(), items } = $props();

	// Function to remove language prefix for comparison
	function removeLanguagePrefix(path: string): string {
		return path.replace(/^\/[a-z]{2}(\/|$)/, '/');
	}

	let currentPath: string | undefined = $state();
	let breadcrumbItems: { href: string; label: string }[] = $state();

	// Generate the breadcrumb trail based on current path
	$effect(() => {
		currentPath = removeLanguagePrefix(page.url.pathname);
		breadcrumbItems = generateBreadcrumbTrail(currentPath, items);
	});

	function generateBreadcrumbTrail(
		currentPath: string,
		allItems: Array<{ href: string; label: string }>
	): Array<{ href: string; label: string }> {
		// Split the current path into segments
		const segments = currentPath.split('/').filter(Boolean);

		// Build the trail progressively
		let trail = [];
		let accumulatedPath = '';

		// Always include home if available
		const homeItem = allItems.find((item) => removeLanguagePrefix(item.href) === '/');
		if (homeItem) {
			trail.push(homeItem);
			accumulatedPath = '/';
		}

		// Build the rest of the trail
		for (const segment of segments) {
			accumulatedPath += `${segment}/`;
			const matchingItem = allItems.find(
				(item) => removeLanguagePrefix(item.href) === accumulatedPath.slice(0, -1) // Remove trailing slash
			);

			if (matchingItem) {
				trail.push(matchingItem);
			} else {
				// For dynamic routes where we don't have explicit menu items
				trail.push({
					href: accumulatedPath.slice(0, -1), // Remove trailing slash
					label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
				});
			}
		}

		return trail;
	}
</script>

<Breadcrumb.Root
	class="group flex flex-row items-center gap-2 px-3 text-xs text-foreground "
>
	<a	href="/" class="flex flex-row"
		><img
			src="/icons/home.svg"
			alt="Path-Breadcrumb"
			class="opacity-75 hover:opacity-100 cursor-pointer size-4 invert-0 dark:invert"
		/>
		<p>></p>
	</a>

	<Breadcrumb.List>
		{#each breadcrumbItems as { href, label }, index}
			<Breadcrumb.Item class="opacity-75 hover:opacity-100 cursor-pointer">
				{#if index === breadcrumbItems.length - 1}
					<Breadcrumb.Page>{label}</Breadcrumb.Page>
				{:else}
					<Breadcrumb.Link {href}>{label}</Breadcrumb.Link>
				{/if}
			</Breadcrumb.Item>
			{#if index !== breadcrumbItems.length - 1}
				<Breadcrumb.Separator />
			{/if}
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
