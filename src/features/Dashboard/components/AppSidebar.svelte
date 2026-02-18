<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { isMobile } from '$src/lib/hooks/is-mobile.svelte';
	import { get } from 'svelte/store';
	import { route } from '$lib/i18n/routeHelpers';
	import { t } from '$lib/i18n/i18n';
	import LanguageSwitch from '$lib/components/shared/LanguageSwitch.svelte';
	import { hasRole } from '$lib/utils/roles';
	let { user } = $props()

	const userItems = $derived([
		{
			title: $t('sidebar_home'),
			url: '/dashboard',
			icon: '/icons/home.svg'
		},
		{
			title: $t('sidebar_profile'),
			url: '/dashboard/profile',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: $t('sidebar_bookings'),
			url: '/dashboard/my-bookings',
			icon: '/icons/notebook.svg'
		}
	]);

	const instructorItems = $derived([
		{
			title: $t('sidebar_home'),
			url: '/dashboard',
			icon: '/icons/home.svg'
		},
		{
			title: $t('sidebar_profile'),
			url: '/dashboard/profile',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: $t('sidebar_lessons'),
			url: '/dashboard/lessons',
			icon: '/icons/service.svg'
		},
		{
			title: $t('sidebar_leads') || 'Leads',
			url: '/dashboard/leads',
			icon: '/icons/leads.svg'
		},
		{
			title: $t('sidebar_bookings') || 'Bookings',
			url: '/dashboard/bookings',
			icon: '/icons/appointment.svg'
		},
		{
			title: $t('sidebar_availability'),
			url: '/dashboard/availability',
			icon: '/icons/calendar.svg'
		}
	]);

	const instructorSchoolItems = $derived([
		{
			title: $t('sidebar_home'),
			url: '/dashboard',
			icon: '/icons/home.svg'
		},
		{
			title: $t('sidebar_profile'),
			url: '/dashboard/profile',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: $t('sidebar_leads') || 'Leads',
			url: '/dashboard/leads',
			icon: '/icons/notebook.svg'
		},
		{
			title: $t('sidebar_bookings') || 'Bookings',
			url: '/dashboard/bookings',
			icon: '/icons/calendar.svg'
		},
		{
			title: $t('sidebar_schools'),
			url: '/dashboard/schools',
			icon: '/icons/service.svg'
		},
		{
			title: 'Invitations',
			url: '/dashboard/invitations',
			icon: '/icons/notebook.svg'
		}
	]);

	const schoolAdminItems = $derived([
		{
			title: $t('sidebar_school_home'),
			url: '/dashboard/school',
			icon: '/icons/home.svg'
		},
		{
			title: $t('sidebar_school_profile'),
			url: '/dashboard/school/profile',
			icon: '/icons/ski-resort.svg'
		},
		{
			title: $t('sidebar_school_instructors'),
			url: '/dashboard/school/instructors',
			icon: '/icons/service.svg'
		},
		{
			title: $t('sidebar_school_lessons'),
			url: '/dashboard/school/lessons',
			icon: '/icons/service.svg'
		},
		{
			title: $t('sidebar_school_bookings'),
			url: '/dashboard/school/bookings',
			icon: '/icons/notebook.svg'
		}
	]);

	const adminItems = $derived([
		{
			title: $t('admin_panel') || 'Admin Panel',
			url: '/admin',
			icon: '/icons/certificate.svg'
		}
	]);

	const navItems = $derived(() => {
		const items = [];

		if (hasRole(user, 'client')) items.push(...userItems);
		if (hasRole(user, 'instructor-independent')) items.push(...instructorItems);
		if (hasRole(user, 'instructor-school')) items.push(...instructorSchoolItems);
		if (hasRole(user, 'school-admin')) items.push(...schoolAdminItems);
		if (hasRole(user, 'admin')) items.push(...adminItems);

		const seen = new Set();
		return items.filter(item => {
			if (seen.has(item.url)) return false;
			seen.add(item.url);
			return true;
		});
	});

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
			<div class="m-1 flex size-12 items-center justify-center object-cover">
				<img
					src="/localsnow-logo-h-black.png"
					alt="Local Snow Logo"
					class="mx-auto max-w-38 opacity-75 group-hover:opacity-85 group-focus:opacity-85"
				/>
			</div>
		</a>
	</Sidebar.Header>
	<Sidebar.Content class="px-3 bg-white">
		<Sidebar.Group />
		<Sidebar.GroupLabel>{$t('sidebar_application')}</Sidebar.GroupLabel>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each navItems() as item (item.url)}
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
			</Sidebar.Menu>
		</Sidebar.GroupContent>
		<Sidebar.Group />
	</Sidebar.Content>
	<Sidebar.Footer class="bg-white p-4">
		<div class="flex items-center justify-between">
			<span class="text-sm text-muted-foreground">{$t('sidebar_language')}</span>
			<LanguageSwitch />
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
