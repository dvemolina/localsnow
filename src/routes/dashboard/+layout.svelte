<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$src/features/Dashboard/components/AppSidebar.svelte";
	import { t } from '$lib/i18n/i18n';
	import { getRoles, hasInstructorRole } from '$lib/utils/roles';
	import { generateInstructorSlug } from '$lib/utils/slug';
	let { data, children } = $props();
	const user = $derived(data.user);
	const isInstructor = $derived(hasInstructorRole(user));
	const profileSlug = $derived(generateInstructorSlug(user.id, user.name, user.lastName));
</script>

{#if getRoles(user).length === 0}
	{@render children?.()}
{:else}

	<!-- Dashboard with Sidebar -->
	<Sidebar.Provider>
		<AppSidebar {user}/>
		<main class="w-full min-h-screen ">
			<div class="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-white px-4 py-3 ">
				<Sidebar.Trigger />
				<div class="flex-1">
					<h2 class="text-lg font-semibold">{$t('admin_dashboard_title')}</h2>
				</div>
				<div class="flex items-center gap-3">
					{#if isInstructor}
						<a
							href="/instructors/{profileSlug}"
							target="_blank"
							rel="noopener"
							class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
						>
							<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
							My profile
						</a>
					{/if}
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
