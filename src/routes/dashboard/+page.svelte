<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$src/lib/components/ui/button/button.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as Card from '$src/lib/components/ui/card';
	import ProfileVisitsCard from '$src/features/Dashboard/components/ProfileVisitsCard.svelte';
	import LeadStatsCard from '$src/features/Leads/components/LeadStatsCard.svelte';
	import RequestsCard from '$src/features/Requests/components/RequestsCard.svelte';
	import ProfileCompletionCard from '$src/features/Dashboard/components/ProfileCompletionCard.svelte';
	import { t } from '$lib/i18n/i18n';
	import { getRoles, hasInstructorRole, hasRole } from '$lib/utils/roles';
	import { generateInstructorSlug } from '$lib/utils/slug';
	let { data } = $props();
	const user = $derived(data.user);

	const getWelcomeMessage = $derived(() => {
		const hour = new Date().getHours();
		if (hour < 12) return $t('dashboard_greeting_morning');
		if (hour < 18) return $t('dashboard_greeting_afternoon');
		return $t('dashboard_greeting_evening');
	});

	// Onboarding state (only set for unverified instructors)
	const requiredRemaining = $derived(
		data.profileCompletion?.items.filter((i) => !i.completed && i.required).length ?? 0
	);
	const profileIsComplete = $derived(requiredRemaining === 0);
	const instructorSlug = $derived(generateInstructorSlug(user.id, user.name, user.lastName));

	const quickActions = $derived([
		{
			title: $t('dashboard_action_view_profile'),
			description: $t('dashboard_action_view_profile_desc'),
			icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
			href: '/dashboard/profile',
			show: true
		},
		{
			title: $t('dashboard_action_view_bookings'),
			description: $t('dashboard_action_view_bookings_desc'),
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
			href: '/dashboard/bookings',
			show: hasInstructorRole(user)
		},
		{
			title: $t('dashboard_action_my_bookings'),
			description: $t('dashboard_action_desc'),
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
			href: '/dashboard/my-bookings',
			show: hasRole(user, 'client') || getRoles(user).length === 0
		},
		{
			title: $t('dashboard_action_manage_lessons'),
			description: $t('dashboard_action_manage_lessons_desc'),
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
			href: '/dashboard/lessons',
			show: hasInstructorRole(user)
		},
		{
			title: 'School Profile',
			description: 'Manage your school information and settings',
			icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
			href: '/dashboard/profile',
			show: hasRole(user, 'school-admin')
		}

	].filter(action => action.show));
</script>

{#if getRoles(user).length === 0}
	<div class="flex flex-col items-center justify-center">
		<p class="title3">{$t('dashboard_choose_role_greeting')}, {user.name}!</p>
		<Button onclick={() => goto('/dashboard/choose-role')} class="w-full">
			{$t('dashboard_choose_role_button')}
		</Button>
	</div>

{:else if hasInstructorRole(user) && !user.isVerified && data.profileCompletion}

	<!-- ═══════════════════════════════════════════════════════
	     ONBOARDING MODES — unverified instructors only
	     ═══════════════════════════════════════════════════════ -->

	{#if !profileIsComplete}
		<!-- ── SETUP MODE: profile still has required items missing ── -->
		<div class="container mx-auto max-w-2xl py-8">
			<div class="mb-8 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
							d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h1 class="title2 mb-2">Welcome to LocalSnow, {user.name}!</h1>
				<p class="text-muted-foreground">
					Complete your profile to go live and start receiving student inquiries.
				</p>
			</div>

			<ProfileCompletionCard
				completionItems={data.profileCompletion.items}
				completedCount={data.profileCompletion.completedCount}
				totalCount={data.profileCompletion.items.length}
			/>

			<div class="mt-6 flex justify-center">
				<a href="/dashboard/setup">
					<Button size="lg">Complete my profile →</Button>
				</a>
			</div>
		</div>

	{:else}
		<!-- ── PENDING VERIFICATION MODE: profile done, awaiting admin review ── -->
		<div class="container mx-auto max-w-2xl py-8">

			<!-- Hero: submitted! -->
			<div class="mb-8 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
					<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h1 class="title2 mb-2">Profile submitted!</h1>
				<p class="text-muted-foreground">
					We're reviewing your credentials. You'll get an email once your profile goes live — usually within 24 hours.
				</p>
			</div>

			<!-- Profile preview card — the aha moment -->
			<div class="mb-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
				<p class="mb-1 text-sm font-medium">Here's what students will see</p>
				<p class="mb-4 text-sm text-muted-foreground">
					Your profile is ready. Take a look and share it while you wait.
				</p>
				<a href="/instructors/{instructorSlug}" target="_blank" rel="noopener">
					<Button size="lg">
						View my profile
						<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</Button>
				</a>
				<p class="mt-3 text-xs text-muted-foreground">
					Copy the link and share it — your profile page works even before your listing goes public.
				</p>
			</div>

			<!-- What to do while waiting -->
			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="text-base">While you wait...</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					<a href="/dashboard/availability/working-hours"
						class="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
							<svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium">Set your availability</p>
							<p class="text-xs text-muted-foreground">Let students know when you're free to teach</p>
						</div>
						<svg class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</a>
					<a href="/dashboard/profile"
						class="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
							<svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium">Polish your profile</p>
							<p class="text-xs text-muted-foreground">Add a bio, photo, and languages to stand out</p>
						</div>
						<svg class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</a>
				</Card.Content>
			</Card.Root>

			<!-- Optional items remaining -->
			{#if data.profileCompletion.completedCount < data.profileCompletion.items.length}
				<div class="mt-4">
					<ProfileCompletionCard
						completionItems={data.profileCompletion.items}
						completedCount={data.profileCompletion.completedCount}
						totalCount={data.profileCompletion.items.length}
					/>
				</div>
			{/if}
		</div>
	{/if}

{:else}

	<!-- ═══════════════════════════════════════════════════════
	     FULL DASHBOARD — verified instructors, school admins, clients
	     ═══════════════════════════════════════════════════════ -->
	<div class="container mx-auto max-w-6xl">
		<!-- Welcome Header -->
		<div class="mb-8">
			<h1 class="title2 mb-2">
				{getWelcomeMessage()}, {user.name}!
			</h1>
			<p class="text-muted-foreground">
				{$t('dashboard_welcome_subtitle')}
			</p>
		</div>

		<!-- Stats Overview -->
		<div class="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium text-muted-foreground">
						{$t('dashboard_account_status')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<Badge variant={user.isVerified ? 'default' : 'secondary'} class={user.isVerified ? 'bg-green-600' : ''}>
							{user.isVerified ? `✓ ${$t('status_verified')}` : $t('status_pending')}
						</Badge>
						{#if !user.isVerified}
							<span class="text-xs text-muted-foreground">
								{$t('dashboard_review_in_progress')}
							</span>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			{#if hasInstructorRole(user)}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium text-muted-foreground">
							{$t('dashboard_total_bookings')}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">0</div>
						<p class="text-xs text-muted-foreground">
							{$t('dashboard_no_bookings_yet')}
						</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium text-muted-foreground">
							{$t('dashboard_active_lessons')}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">0</div>
						<p class="text-xs text-muted-foreground">
							{$t('dashboard_create_first_lesson')}
						</p>
					</Card.Content>
				</Card.Root>

				<ProfileVisitsCard visits={data.profileVisits || 0} />

				<LeadStatsCard leadStats={data.leadStats as any} />
			{:else if hasRole(user, 'school-admin')}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium text-muted-foreground">
							School Instructors
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">0</div>
						<p class="text-xs text-muted-foreground">
							Add instructors to your school
						</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium text-muted-foreground">
							Total Bookings
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">0</div>
						<p class="text-xs text-muted-foreground">
							Bookings across all instructors
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
							Available for booking
						</p>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Quick Actions -->
		<div class="mb-8">
			<h2 class="title4 mb-4">{$t('dashboard_quick_actions')}</h2>
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

		<!-- Recent Leads Section (for instructors) -->
		{#if hasInstructorRole(user) && data.recentLeads}
			<div class="mb-8">
				<RequestsCard requests={data.recentLeads as any} type="lead" instructorId={user.id} />
			</div>
		{/if}

		<!-- School admin: complete profile notice -->
		{#if !user.isVerified && hasRole(user, 'school-admin')}
			<Card.Root class="border-yellow-200 bg-yellow-50" >
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<svg class="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
						</svg>
						Complete Your School Profile
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="mb-4 text-sm text-yellow-800 ">
						Your school profile is under review. Complete your profile to get verified and start managing your instructors.
					</p>
					<ul class="mb-4 space-y-2 text-sm text-yellow-800 ">
						<li class="flex items-start gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Complete your school's information and upload your logo</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Add contact information for student inquiries</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Wait for our team to review and verify your school</span>
						</li>
					</ul>
					<Button onclick={() => goto('/dashboard/profile')} variant="outline" size="sm">
						Go to School Profile
					</Button>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
{/if}
