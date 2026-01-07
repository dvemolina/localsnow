<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { isMobile } from '$src/lib/hooks/is-mobile.svelte';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { route } from '$lib/i18n/routeHelpers';
	import { useIntlayer } from 'svelte-intlayer';
	import LanguageSwitch from '$lib/components/shared/LanguageSwitch.svelte';

	const admin = useIntlayer('admin');
	const sidebarContent = useIntlayer('sidebar');

	const items = $derived([
		{
			title: $admin.sidebar_overview.value,
			url: '/admin/dashboard',
			icon: '/icons/home.svg'
		},
		{
			title: $admin.sidebar_instructors.value,
			url: '/admin/instructors',
			icon: '/icons/service.svg'
		},
		{
			title: $admin.sidebar_bookings.value,
			url: '/admin/bookings',
			icon: '/icons/notebook.svg'
		},
		{
			title: $admin.sidebar_users.value,
			url: '/admin/users',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: $admin.sidebar_reviews.value,
			url: '/admin/reviews',
			icon: '/icons/calendar.svg'
		},
		{
			title: $admin.sidebar_resorts.value,
			url: '/admin/resorts',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: $admin.sidebar_sports.value,
			url: '/admin/sports',
			icon: '/icons/service.svg'
		},
		{
			title: $admin.sidebar_launch_codes.value,
			url: '/admin/launch-codes',
			icon: '/icons/notebook.svg'
		},
		{
			title: $admin.sidebar_payments.value,
			url: '/admin/payments',
			icon: '/icons/notebook.svg'
		}
	]);

	const sidebar = Sidebar.useSidebar();

	function handleClick() {
		// Only close on mobile
		if (get(isMobile)) {
			sidebar.setOpenMobile(false);
		}
	}

	// Function to check if path is active
	function isActive(url: string): boolean {
		const currentPath = get(page).url.pathname;
		return currentPath === url || currentPath.startsWith(url + '/');
	}
</script>

<Sidebar.Root class="bg-background">
	<Sidebar.Header class="bg-white">
		<a href={route('/')} class="group flex flex-row items-center justify-center gap-1">
			<div class="m-1 size-12 overflow-hidden object-cover">
				<img
					src="/local-snow-head-big.png"
					alt="Local Snow Logo"
					class="opacity-85 group-hover:opacity-100 group-focus:opacity-100"
				/>
			</div>
			<div class="flex flex-col">
				<p class="title4 mt-0 text-foreground/85 transition-all group-hover:text-foreground">
					localsnow
				</p>
				<span class="text-xs text-muted-foreground">{$admin.panel.value}</span>
			</div>
		</a>
	</Sidebar.Header>
	<Sidebar.Content class="px-3 bg-white">
		<Sidebar.Group />
		<Sidebar.GroupLabel>{$admin.dashboard.value}</Sidebar.GroupLabel>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each items as item (item.url)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a
									href={route(item.url)}
									{...props}
									onclick={handleClick}
									class:font-semibold={isActive(item.url)}
									class:text-primary={isActive(item.url)}
								>
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
		<div class="flex flex-col gap-3">
			<a href={route('/dashboard')} class="text-sm text-muted-foreground hover:text-foreground">
				← {$admin.back_to_dashboard.value}
			</a>
			<div class="flex items-center justify-between border-t pt-3">
				<span class="text-sm text-muted-foreground">{$sidebarContent.language.value}</span>
				<LanguageSwitch />
			</div>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
