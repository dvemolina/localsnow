<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { isMobile } from '$src/lib/hooks/is-mobile.svelte';
	import { get } from 'svelte/store';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import LanguageSwitch from '$lib/components/shared/LanguageSwitch.svelte';

	const items = $derived([
		{
			title: m.sidebar_home(),
			url: '/dashboard',
			icon: '/icons/home.svg'
		},
		{
			title: m.sidebar_profile(),
			url: '/dashboard/profile',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: m.sidebar_lessons(),
			url: '/dashboard/lessons',
			icon: '/icons/service.svg'
		},
		{
			title: m.sidebar_bookings(),
			url: '/dashboard/bookings',
			icon: '/icons/notebook.svg'
		},
		{
			title: m.sidebar_availability(),
			url: '/dashboard/availability',
			icon: '/icons/calendar.svg'
		}
	]);

	const sidebar = Sidebar.useSidebar();

	function handleClick() {
		// Only close on mobile
		if (get(isMobile)) {
			// Use the sidebar API correctly
			sidebar.setOpenMobile(false);
		}
	}

</script>

<Sidebar.Root class="bg-background">
	<Sidebar.Header class="bg-white">
		<a href={localizeHref('/')} class="group flex flex-row items-center justify-center gap-1">
			<div class="m-1 size-12 overflow-hidden object-cover">
				<img
					src="/local-snow-head-big.png"
					alt="Local Snow Logo"
					class="opacity-85 group-hover:opacity-100 group-focus:opacity-100"
				/>
			</div>
			<p class="title4 mt-0 text-foreground/85 transition-all group-hover:text-foreground">
				localsnow
			</p>
		</a>
	</Sidebar.Header>
	<Sidebar.Content class="px-3 bg-white">
		<Sidebar.Group />
		<Sidebar.GroupLabel>{m.sidebar_application()}</Sidebar.GroupLabel>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each items as item (item.url)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href={localizeHref(item.url)} {...props} onclick={handleClick}>
									<img src={item.icon} alt={item.title} class="size-5" />
									<span>{item.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
		<Sidebar.Group />
	</Sidebar.Content>
	<Sidebar.Footer class="bg-white p-4">
		<div class="flex items-center justify-between">
			<span class="text-sm text-muted-foreground">{m.sidebar_language()}</span>
			<LanguageSwitch />
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
