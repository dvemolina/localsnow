<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { isMobile } from '$src/lib/hooks/is-mobile.svelte';
	import { get } from 'svelte/store';
	import { route } from '$lib/i18n/routeHelpers';
	import * as m from '$lib/paraglide/messages';
	import LanguageSwitch from '$lib/components/shared/LanguageSwitch.svelte';

	let { user } = $props()

	const userItems = $derived([
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
			title: m.sidebar_bookings(),
			url: '/dashboard/my-bookings',
			icon: '/icons/notebook.svg'
		}
	]);

	const instructorItems = $derived([
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

	const instructorSchoolItems = $derived([
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
			title: m.sidebar_bookings(),
			url: '/dashboard/bookings',
			icon: '/icons/notebook.svg'
		},
		{
			title: m.sidebar_schools(),
			url: '/dashboard/instructors/schools',
			icon: '/icons/service.svg'
		}
	]);

	const schoolAdminItems = $derived([
		{
			title: m.sidebar_school_home(),
			url: '/dashboard/school',
			icon: '/icons/home.svg'
		},
		{
			title: m.sidebar_school_profile(),
			url: '/dashboard/school/profile',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: m.sidebar_school_instructors(),
			url: '/dashboard/school/instructors',
			icon: '/icons/service.svg'
		},
		{
			title: m.sidebar_school_lessons(),
			url: '/dashboard/school/lessons',
			icon: '/icons/service.svg'
		},
		{
			title: m.sidebar_school_bookings(),
			url: '/dashboard/school/bookings',
			icon: '/icons/notebook.svg'
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
		<a href={route('/')} class="group flex flex-row items-center justify-center gap-1">
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
				{#if user.role === "client"}
					{#each userItems as item (item.url)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={route(item.url)} {...props} onclick={handleClick}>
										<img src={item.icon} alt={item.title} class="size-5" />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				{:else if user.role === "instructor-independent"}
					{#each instructorItems as item (item.url)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={route(item.url)} {...props} onclick={handleClick}>
										<img src={item.icon} alt={item.title} class="size-5" />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				{:else if user.role === "instructor-school"}
					{#each instructorSchoolItems as item (item.url)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={route(item.url)} {...props} onclick={handleClick}>
										<img src={item.icon} alt={item.title} class="size-5" />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				{:else if user.role === "school-admin"}
					{#each schoolAdminItems as item (item.url)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={route(item.url)} {...props} onclick={handleClick}>
										<img src={item.icon} alt={item.title} class="size-5" />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				{/if}
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
