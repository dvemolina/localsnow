<script lang="ts">	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { route } from '$lib/i18n/routeHelpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { pendingInstructors, school } = $derived(data);

	function formatDate(dateString: string | Date) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Pending Instructor Requests</h1>
			<p class="text-muted-foreground mt-1">Review and approve instructor applications</p>
		</div>
		<Button href={route('/dashboard/school/instructors')} variant="outline">
			Back to Roster
		</Button>
	</div>

	<!-- Pending Requests -->
	{#if pendingInstructors.length === 0}
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
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-medium">No pending requests</h3>
					<p class="text-muted-foreground mt-2">
						All instructor applications have been reviewed
					</p>
					<div class="mt-6">
						<Button href={route('/dashboard/school/instructors/discover')}>
							Invite Instructors
						</Button>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each pendingInstructors as request}
				<Card.Root>
					<Card.Content class="pt-6">
						<div class="flex items-start justify-between">
							<!-- Instructor Info -->
							<div class="flex gap-4">
								{#if request.instructor?.profileImageUrl}
									<img
										src={request.instructor.profileImageUrl}
										alt={request.instructor.name}
										class="h-16 w-16 rounded-full object-cover"
									/>
								{:else}
									<div
										class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
									>
										<span class="text-lg font-medium">
											{request.instructor?.name?.[0]}{request.instructor?.lastName?.[0]}
										</span>
									</div>
								{/if}

								<div class="flex-1">
									<div class="flex items-center gap-2">
										<h3 class="text-lg font-semibold">
											{request.instructor?.name}
											{request.instructor?.lastName}
										</h3>
										{#if request.instructor?.isVerified}
											<Badge variant="secondary">Verified</Badge>
										{/if}
									</div>

									<p class="text-sm text-muted-foreground mb-3">
										{request.instructor?.email}
										{#if request.instructor?.professionalPhone}
											• +{request.instructor.professionalCountryCode}
											{request.instructor.professionalPhone}
										{/if}
									</p>

									<!-- Request Type Badge -->
									<div class="mb-3">
										{#if request.requestedBy === 'instructor'}
											<Badge variant="default">Application from Instructor</Badge>
										{:else}
											<Badge variant="outline">Invited by School</Badge>
										{/if}
										<span class="ml-2 text-sm text-muted-foreground">
											{formatDate(request.requestedAt)}
										</span>
									</div>

									<!-- Bio -->
									{#if request.instructor?.bio}
										<p class="text-sm mb-3 line-clamp-2">{request.instructor.bio}</p>
									{/if}

									<!-- Sports & Languages -->
									<div class="flex gap-4">
										{#if request.instructor?.spokenLanguages && request.instructor.spokenLanguages.length > 0}
											<div>
												<p class="text-xs text-muted-foreground mb-1">Languages</p>
												<div class="flex flex-wrap gap-1">
													{#each request.instructor.spokenLanguages.slice(0, 3) as lang}
														<Badge variant="outline" class="text-xs">{lang}</Badge>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>

							<!-- Actions -->
							<div class="flex flex-col gap-2 ml-4">
								<Button
									href={route(`/instructors/${request.instructorId}`)}
									variant="outline"
									size="sm"
								>
									View Full Profile
								</Button>

								<form method="POST" action="?/accept">
									<input type="hidden" name="instructorId" value={request.instructorId} />
									<input type="hidden" name="instructorEmail" value={request.instructor?.email} />
									<input
										type="hidden"
										name="instructorName"
										value="{request.instructor?.name} {request.instructor?.lastName}"
									/>
									<Button type="submit" class="w-full" size="sm">Accept</Button>
								</form>

								<form method="POST" action="?/reject">
									<input type="hidden" name="instructorId" value={request.instructorId} />
									<input type="hidden" name="instructorEmail" value={request.instructor?.email} />
									<input
										type="hidden"
										name="instructorName"
										value="{request.instructor?.name} {request.instructor?.lastName}"
									/>
									<Button type="submit" variant="outline" class="w-full" size="sm">
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
</div>
