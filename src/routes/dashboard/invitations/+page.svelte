<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { route } from '$lib/i18n/routeHelpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { invitations, applications } = $derived(data);

	function formatDate(dateString: Date | string | null) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">School Invitations & Applications</h1>
			<p class="text-muted-foreground mt-1">
				Manage your school invitations and track your applications
			</p>
		</div>
		<Button href={route('/dashboard/schools')} variant="outline">
			Browse Schools
		</Button>
	</div>

	<!-- Tabs for Invitations and Applications -->
	<Tabs.Root value="invitations" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="invitations">
				Invitations
				{#if invitations.length > 0}
					<Badge variant="default" class="ml-2">{invitations.length}</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="applications">
				My Applications
				{#if applications.length > 0}
					<Badge variant="secondary" class="ml-2">{applications.length}</Badge>
				{/if}
			</Tabs.Trigger>
		</Tabs.List>

		<!-- Invitations Tab -->
		<Tabs.Content value="invitations" class="mt-6">
			{#if invitations.length === 0}
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
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							<h3 class="mt-4 text-lg font-medium">No pending invitations</h3>
							<p class="text-muted-foreground mt-2">
								You don't have any school invitations at the moment
							</p>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="grid gap-4">
					{#each invitations as invitation}
						<Card.Root>
							<Card.Content class="pt-6">
								<div class="flex items-start justify-between">
									<!-- School Info -->
									<div class="flex gap-4 flex-1">
										{#if invitation.school.logo}
											<img
												src={invitation.school.logo}
												alt={invitation.school.name}
												class="h-16 w-16 rounded-lg object-cover border"
											/>
										{:else}
											<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 border">
												<span class="text-lg font-medium">
													{invitation.school.name[0]}
												</span>
											</div>
										{/if}

										<div class="flex-1">
											<h3 class="text-lg font-semibold mb-1">
												{invitation.school.name}
											</h3>
											{#if invitation.school.bio}
												<p class="text-sm mb-3 line-clamp-2">{invitation.school.bio}</p>
											{/if}
											<p class="text-sm text-muted-foreground">
												Invited on {formatDate(invitation.requestedAt)}
											</p>
										</div>
									</div>

									<!-- Actions -->
									<div class="flex flex-col gap-2 ml-4">
										<Button
											href={route(`/schools/${invitation.school.slug}`)}
											variant="outline"
											size="sm"
										>
											View Profile
										</Button>

										<form method="POST" action="?/acceptInvitation">
											<input type="hidden" name="schoolId" value={invitation.school.id} />
											<Button type="submit" class="w-full" size="sm">
												Accept
											</Button>
										</form>

										<form method="POST" action="?/rejectInvitation">
											<input type="hidden" name="schoolId" value={invitation.school.id} />
											<Button type="submit" variant="destructive" class="w-full" size="sm">
												Reject
											</Button>
										</form>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</Tabs.Content>

		<!-- Applications Tab -->
		<Tabs.Content value="applications" class="mt-6">
			{#if applications.length === 0}
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
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<h3 class="mt-4 text-lg font-medium">No pending applications</h3>
							<p class="text-muted-foreground mt-2">
								You haven't applied to any schools yet
							</p>
							<div class="mt-6">
								<Button href={route('/dashboard/schools')}>
									Browse Schools
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="grid gap-4">
					{#each applications as application}
						<Card.Root>
							<Card.Content class="pt-6">
								<div class="flex items-start justify-between">
									<!-- School Info -->
									<div class="flex gap-4 flex-1">
										{#if application.school.logo}
											<img
												src={application.school.logo}
												alt={application.school.name}
												class="h-16 w-16 rounded-lg object-cover border"
											/>
										{:else}
											<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 border">
												<span class="text-lg font-medium">
													{application.school.name[0]}
												</span>
											</div>
										{/if}

										<div class="flex-1">
											<div class="flex items-center gap-2 mb-1">
												<h3 class="text-lg font-semibold">
													{application.school.name}
												</h3>
												<Badge variant="secondary" class="bg-yellow-100 text-yellow-800">
													Pending Review
												</Badge>
											</div>
											{#if application.school.bio}
												<p class="text-sm mb-3 line-clamp-2">{application.school.bio}</p>
											{/if}
											<p class="text-sm text-muted-foreground">
												Applied on {formatDate(application.requestedAt)}
											</p>
										</div>
									</div>

									<!-- Actions -->
									<div class="flex flex-col gap-2 ml-4">
										<Button
											href={route(`/schools/${application.school.slug}`)}
											variant="outline"
											size="sm"
										>
											View Profile
										</Button>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</div>
