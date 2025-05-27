<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	const items = [
		{
			title: 'Home',
			url: '/dashboard',
			icon: '/icons/home.svg'
		},
		{
			title: 'Profile',
			url: '/dashboard/profile',
			icon: '/icons/ski-resort.svg'
		},
		
	];
</script>

<Sidebar.Root class="bg-background">
	<Sidebar.Header>
      <a href="http://localhost:5173" class="group flex flex-row items-center justify-center gap-1">
        <div class="m-1 size-12 overflow-hidden  object-cover">
          <img
            src="/local-snow-head-big.png"
            alt="Local Snow Logo"
            class="opacity-85 invert-0 group-hover:opacity-100 group-focus:opacity-100 dark:invert"
          />
        </div>
        <p class="title4 mt-0 text-foreground/85 transition-all group-hover:text-foreground">
          localsnow
        </p>
      </a>
  </Sidebar.Header>
	<Sidebar.Content class="px-3">
		<Sidebar.Group />
		<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each items as item (item.title)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									<img src={item.icon} alt={item.title} class="size-5">
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
	<Sidebar.Footer />
</Sidebar.Root>
