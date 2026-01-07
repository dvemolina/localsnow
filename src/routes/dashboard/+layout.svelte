<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$src/features/Dashboard/components/AppSidebar.svelte";
	import { useIntlayer } from 'svelte-intlayer';

	const admin = useIntlayer('admin');

	let { data, children } = $props();
	let user = $state(data.user);
</script>

{#if !user.role}
	{@render children?.()}
{:else}

	<!-- Dashboard with Sidebar -->
	<Sidebar.Provider>
		<AppSidebar {user}/>
		<main class="w-full min-h-screen ">
			<div class="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-white px-4 py-3 ">
				<Sidebar.Trigger />
				<div class="flex-1">
					<h2 class="text-lg font-semibold">{$admin.dashboard_title.value}</h2>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-muted-foreground">
						{user.name}
					</span>
				</div>
			</div>
			<div class="p-4 md:p-6">
				{@render children?.()}
			</div>
		</main>
	</Sidebar.Provider>

{/if}