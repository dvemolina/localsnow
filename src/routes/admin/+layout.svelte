<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AdminSidebar from "$src/features/Admin/components/AdminSidebar.svelte";
	import * as m from '$lib/paraglide/messages';

	let { data, children } = $props();
	let user = $state(data.user);
</script>

<!-- Admin Dashboard with Sidebar -->
<Sidebar.Provider>
	<AdminSidebar />
	<main class="w-full min-h-screen">
		<div class="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-white px-4 py-3">
			<Sidebar.Trigger />
			<div class="flex-1">
				<h2 class="text-lg font-semibold">{m.admin_dashboard_title()}</h2>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">
					{user.name} ({m.role_admin()})
				</span>
			</div>
		</div>
		<div class="p-4 md:p-6">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>
