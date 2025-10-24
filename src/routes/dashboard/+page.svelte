<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$src/lib/components/ui/button/button.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as Card from '$src/lib/components/ui/card';
	import ProfileVisitsCard from '$src/features/Dashboard/components/ProfileVisitsCard.svelte';

	let { data } = $props();
	let user = $state(data.user);

	const getWelcomeMessage = () => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	};

	const quickActions = $derived([
		{
			title: 'View Profile',
			description: 'Update your personal information',
			icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
			href: '/dashboard/profile',
			show: true
		},
		{
			title: 'Manage Lessons',
			description: 'Create and edit your lesson offerings',
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
			href: '/dashboard/lessons',
			show: user.role === 'instructor-independent' || user.role === 'instructor-school'
		},
		{
			title: 'View Bookings',
			description: 'See your upcoming lesson requests',
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
			href: '/dashboard/bookings',
			show: user.role === 'instructor-independent' || user.role === 'instructor-school'
		}
	].filter(action => action.show));
</script>

{#if !user.role}
	<div class="flex flex-col items-center justify-center">
		<p class="title3">Hey {user.name}, Let's Choose Your Account Type</p>
		<Button onclick={() => goto('/dashboard/choose-role')} class="w-full">
			Choose Account Type
		</Button>
	</div>
{:else}
	<div class="container mx-auto max-w-6xl">
		<!-- Welcome Header -->
		<div class="mb-8">
			<h1 class="title2 mb-2">
				{getWelcomeMessage()}, {user.name}!
			</h1>
			<p class="text-muted-foreground">
				Welcome to your Local Snow dashboard
			</p>
		</div>

		<!-- Stats Overview -->
		<div class="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground">
						Account Status
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<Badge variant={user.isVerified ? 'default' : 'secondary'} class={user.isVerified ? 'bg-green-600' : ''}>
							{user.isVerified ? '✓ Verified' : 'Pending'}
						</Badge>
						{#if !user.isVerified}
							<span class="text-xs text-muted-foreground">
								Review in progress
							</span>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			{#if user.role === 'instructor-independent' || user.role === 'instructor-school'}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium text-muted-foreground">
							Total Bookings
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">0</div>
						<p class="text-xs text-muted-foreground">
							No bookings yet
						</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium text-muted-foreground">
							Active Lessons
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">0</div>
						<p class="text-xs text-muted-foreground">
							Create your first lesson
						</p>
					</Card.Content>
				</Card.Root>

				<ProfileVisitsCard visits={data.profileVisits || 0} />
			{/if}
		</div>

		<!-- Quick Actions -->
		<div class="mb-8">
			<h2 class="title4 mb-4">Quick Actions</h2>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each quickActions as action}
					<a
						href={action.href}
						class="group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary"
					>
						<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
							<svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon} />
							</svg>
						</div>
						<h3 class="mb-1 font-semibold">{action.title}</h3>
						<p class="text-sm text-muted-foreground">{action.description}</p>
					</a>
				{/each}
			</div>
		</div>

		<!-- Getting Started (for unverified users) -->
		{#if !user.isVerified && (user.role === 'instructor-independent' || user.role === 'instructor-school')}
			<Card.Root class="border-yellow-200 bg-yellow-50" >
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<svg class="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
						</svg>
						Complete Your Profile
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="mb-4 text-sm text-yellow-800 ">
						Your instructor profile is under review. To speed up verification:
					</p>
					<ul class="mb-4 space-y-2 text-sm text-yellow-800 ">
						<li class="flex items-start gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Ensure your certification documents are clear and valid</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Add a professional profile photo</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Complete your biography with teaching experience</span>
						</li>
					</ul>
					<Button onclick={() => goto('/dashboard/profile')} variant="outline" size="sm">
						Go to Profile
					</Button>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
{/if}