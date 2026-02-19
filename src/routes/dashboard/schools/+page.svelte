<script lang="ts">	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { route } from '$lib/i18n/routeHelpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { schools, activeSchool } = $derived(data);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{activeSchool ? 'My School' : 'Browse Schools'}</h1>
			<p class="text-muted-foreground mt-1">
				{activeSchool
					? 'You are an active member of this school.'
					: 'Find and join schools at your resort to access group bookings and benefits'}
			</p>
		</div>
		{#if !activeSchool}
			<Button href={route('/dashboard/invitations')} variant="outline">
				View Invitations
			</Button>
		{/if}
	</div>

	<!-- ── ACTIVE SCHOOL MEMBERSHIP ──────────────────────────────────────────── -->
	{#if activeSchool}
		<Card.Root class="border-green-200 bg-white-80 ">
			<Card.Header>
				<div class="flex items-center gap-3">
					{#if activeSchool.schoolLogo}
						<img
							src={activeSchool.schoolLogo}
							alt={activeSchool.schoolName}
							class="h-14 w-14 rounded-lg object-cover"
						/>
					{:else}
						<div class="flex h-14 w-14 items-center justify-center rounded-lg bg-white-80 text-green-700">
							<svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
						</div>
					{/if}
					<div>
						<Card.Title class="text-lg text-green-900">
							{activeSchool.schoolName}
						</Card.Title>
						<Badge class="mt-1 bg-green-600 text-white">Active member</Badge>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="flex items-center justify-between">
				<p class="text-sm text-green-800 dark:text-green-200">
					Clients can find your profile through this school's directory.
					{#if activeSchool.acceptedAt}
						Member since {new Date(activeSchool.acceptedAt).toLocaleDateString()}.
					{/if}
				</p>
				<Button
					href={route(`/schools/${activeSchool.schoolSlug}`)}
					variant="outline"
					size="sm"
					class="ml-4 shrink-0 border-green-400 text-green-800 hover:bg-green-100"
				>
					View school
				</Button>
			</Card.Content>
		</Card.Root>

	<!-- ── BROWSE SCHOOLS (no active school) ─────────────────────────────────── -->
	{:else}
		<!-- Info Card -->
		<Card.Root class="border-blue-200 bg-blue-50">
			<Card.Header>
				<Card.Title class="text-blue-900">Why Join a School?</Card.Title>
				<Card.Description class="text-blue-700">
					Joining a school allows you to access group bookings, benefit from the school's marketing, and collaborate with other instructors. Schools handle pricing and booking management.
				</Card.Description>
			</Card.Header>
		</Card.Root>

		<!-- Schools List -->
		{#if schools.length === 0}
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="text-center py-12">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto h-12 w-12 text-muted-foreground"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						<h3 class="mt-4 text-lg font-medium">No schools available</h3>
						<p class="text-muted-foreground mt-2">
							There are currently no verified schools at your resort, or you've already applied to all available schools
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid gap-4">
				{#each schools as school}
					<Card.Root>
						<Card.Content class="pt-6">
							<div class="flex items-start justify-between">
								<!-- School Info -->
								<div class="flex gap-4 flex-1">
									{#if school.logo}
										<img
											src={school.logo}
											alt={school.name}
											class="h-16 w-16 rounded-lg object-cover border"
										/>
									{:else}
										<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 border">
											<span class="text-lg font-medium">
												{school.name[0]}
											</span>
										</div>
									{/if}

									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="text-lg font-semibold">
												{school.name}
											</h3>
											{#if school.isVerified}
												<Badge variant="secondary" class="bg-green-100 text-green-800">
													✓ Verified
												</Badge>
											{/if}
										</div>

										{#if school.bio}
											<p class="text-sm mb-3 line-clamp-2">{school.bio}</p>
										{/if}

										<!-- Contact Info -->
										<div class="space-y-1">
											<p class="text-sm text-muted-foreground">
												<span class="font-medium">Email:</span> {school.schoolEmail}
											</p>
											<p class="text-sm text-muted-foreground">
												<span class="font-medium">Phone:</span> {school.schoolPhone}
											</p>
										</div>
									</div>
								</div>

								<!-- Actions -->
								<div class="flex flex-col gap-2 ml-4">
									<Button
										href={route(`/schools/${school.slug}`)}
										variant="outline"
										size="sm"
									>
										View Profile
									</Button>

									<form method="POST" action="?/apply">
										<input type="hidden" name="schoolId" value={school.id} />
										<Button type="submit" class="w-full" size="sm">
											Apply to Join
										</Button>
									</form>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}
	{/if}
</div>
