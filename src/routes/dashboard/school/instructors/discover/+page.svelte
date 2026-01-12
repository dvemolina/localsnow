<script lang="ts">	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { route } from '$lib/i18n/routeHelpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { availableInstructors, school } = $derived(data);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Discover Instructors</h1>
			<p class="text-muted-foreground mt-1">Find and invite instructors to join {school.name}</p>
		</div>
		<Button href={route('/dashboard/school/instructors')} variant="outline">
			Back to Roster
		</Button>
	</div>

	<!-- Available Instructors -->
	{#if availableInstructors.length === 0}
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
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-medium">No available instructors</h3>
					<p class="text-muted-foreground mt-2">
						All verified instructors at your resort are already invited or part of your school
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each availableInstructors as instructor}
				<Card.Root>
					<Card.Content class="pt-6">
						<div class="flex items-start justify-between">
							<!-- Instructor Info -->
							<div class="flex gap-4 flex-1">
								{#if instructor.profileImageUrl}
									<img
										src={instructor.profileImageUrl}
										alt={instructor.name}
										class="h-16 w-16 rounded-full object-cover"
									/>
								{:else}
									<div
										class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
									>
										<span class="text-lg font-medium">
											{instructor.name[0]}{instructor.lastName[0]}
										</span>
									</div>
								{/if}

								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="text-lg font-semibold">
											{instructor.name}
											{instructor.lastName}
										</h3>
										{#if instructor.isVerified}
											<Badge variant="secondary">Verified</Badge>
										{/if}
									</div>

									<p class="text-sm text-muted-foreground mb-3">{instructor.email}</p>

									<!-- Bio -->
									{#if instructor.bio}
										<p class="text-sm mb-3 line-clamp-2">{instructor.bio}</p>
									{/if}

									<!-- Sports -->
									{#if instructor.sports && instructor.sports.length > 0}
										<div class="mb-2">
											<p class="text-xs text-muted-foreground mb-1">Sports</p>
											<div class="flex flex-wrap gap-1">
												{#each instructor.sports as sport}
													<Badge variant="default">{sport.sport}</Badge>
												{/each}
											</div>
										</div>
									{/if}

									<!-- Resorts -->
									{#if instructor.resorts && instructor.resorts.length > 0}
										<div class="mb-2">
											<p class="text-xs text-muted-foreground mb-1">Resorts</p>
											<div class="flex flex-wrap gap-1">
												{#each instructor.resorts as resort}
													<Badge variant="outline">{resort.name}</Badge>
												{/each}
											</div>
										</div>
									{/if}

									<!-- Languages -->
									{#if instructor.spokenLanguages && instructor.spokenLanguages.length > 0}
										<div>
											<p class="text-xs text-muted-foreground mb-1">Languages</p>
											<div class="flex flex-wrap gap-1">
												{#each instructor.spokenLanguages.slice(0, 4) as lang}
													<Badge variant="outline" class="text-xs">{lang}</Badge>
												{/each}
												{#if instructor.spokenLanguages.length > 4}
													<Badge variant="outline" class="text-xs">
														+{instructor.spokenLanguages.length - 4}
													</Badge>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							</div>

							<!-- Actions -->
							<div class="flex flex-col gap-2 ml-4">
								<Button
									href={route(`/instructors/${instructor.id}`)}
									variant="outline"
									size="sm"
								>
									View Profile
								</Button>

								<form method="POST" action="?/invite">
									<input type="hidden" name="instructorId" value={instructor.id} />
									<input type="hidden" name="instructorEmail" value={instructor.email} />
									<input
										type="hidden"
										name="instructorName"
										value="{instructor.name} {instructor.lastName}"
									/>
									<Button type="submit" class="w-full" size="sm">Send Invitation</Button>
								</form>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
