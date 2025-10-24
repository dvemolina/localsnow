<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$src/features/Dashboard/components/AppSidebar.svelte";
	import { Button } from "$src/lib/components/ui/button";
	import { goto } from "$app/navigation";

	
	let { data, children } = $props();
	let user = $state(data.user);
</script>

{#if !user.role}
	<!-- Role Selection Screen -->
	<div class="flex min-h-dvh w-full flex-col items-center justify-center bg-gray-50  p-4">
		<div class="w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-lg">
			<div class="mb-6 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
				<h1 class="title2 mb-2">Welcome, {user.name}!</h1>
				<p class="text-muted-foreground">
					Choose your account type to get started on Local Snow
				</p>
			</div>

			<div class="space-y-4">
				<Button 
					onclick={() => goto('/dashboard/choose-role')} 
					class="w-full justify-start h-auto py-4"
					variant="outline"
				>
					<div class="flex w-full items-center gap-4">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 ">
							<svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						</div>
						<div class="flex-1 text-left">
							<p class="font-semibold">Choose Account Type</p>
							<p class="text-sm text-muted-foreground">Select if you're a student, instructor, or school admin</p>
						</div>
						<svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</Button>
			</div>

			<div class="mt-6 rounded-md  p-4 ">
				<div class="flex gap-3">
					<svg class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
					<p class="text-sm text-blue-800 dark:text-blue-200">
						<strong>Note:</strong> You won't be able to change your account type later. 
						If you need to change it, please contact our support team.
					</p>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Dashboard with Sidebar -->
	<Sidebar.Provider>
		<AppSidebar />
		<main class="w-full min-h-screen ">
			<div class="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-white px-4 py-3 ">
				<Sidebar.Trigger />
				<div class="flex-1">
					<h2 class="text-lg font-semibold">Dashboard</h2>
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