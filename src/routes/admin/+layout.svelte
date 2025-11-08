<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: 'home' },
		{ href: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
		{ href: '/admin/instructors', label: 'Instructors', icon: 'users' },
		{ href: '/admin/resorts', label: 'Resorts', icon: 'mountain' },
		{ href: '/admin/stats', label: 'Statistics', icon: 'chart' }
	];
</script>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside class="w-64 border-r border-border bg-card">
		<div class="p-6">
			<h1 class="text-2xl font-bold">Admin Panel</h1>
			<p class="text-sm text-muted-foreground">Local Snow</p>
		</div>

		<nav class="space-y-1 px-3">
			{#each navItems as item}
				<a
					href={item.href}
					class="block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent {$page.url
						.pathname === item.href
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="absolute bottom-0 w-64 border-t border-border p-4">
			<p class="text-sm text-muted-foreground">
				Logged in as <span class="font-medium">{data.user.name}</span>
			</p>
			<a href="/dashboard" class="mt-2 text-sm text-primary hover:underline">Back to Dashboard</a>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 p-8">
		{@render children()}
	</main>
</div>
