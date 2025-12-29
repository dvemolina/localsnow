<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { route } from '$lib/i18n/routeHelpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { activeInstructors, school } = $derived(data);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">School Instructors</h1>
			<p class="text-muted-foreground mt-1">
				Manage your school's instructor roster
			</p>
		</div>
		<div class="flex gap-2">
			<Button href={route('/dashboard/school/instructors/pending')} variant="outline">
				Pending Requests
			</Button>
			<Button href={route('/dashboard/school/instructors/discover')}>
				Invite Instructors
			</Button>
		</div>
	</div>

	<!-- Active Instructors Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Active Instructors ({activeInstructors.length})</Card.Title>
			<Card.Description>
				All instructors currently part of {school.name}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if activeInstructors.length === 0}
				<div class="text-center py-12">
					<p class="text-muted-foreground mb-4">No active instructors yet</p>
					<Button href={route('/dashboard/school/instructors/discover')}>
						Invite Your First Instructor
					</Button>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Instructor</Table.Head>
							<Table.Head>Sports</Table.Head>
							<Table.Head>Languages</Table.Head>
							<Table.Head>Contact</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each activeInstructors as instructor}
							<Table.Row>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-3">
										{#if instructor.profileImageUrl}
											<img
												src={instructor.profileImageUrl}
												alt={instructor.name}
												class="h-10 w-10 rounded-full object-cover"
											/>
										{:else}
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200"
											>
												<span class="text-sm font-medium">
													{instructor.name[0]}{instructor.lastName[0]}
												</span>
											</div>
										{/if}
										<div>
											<p class="font-medium">{instructor.name} {instructor.lastName}</p>
											<p class="text-sm text-muted-foreground">{instructor.email}</p>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-wrap gap-1">
										{#if instructor.sports && instructor.sports.length > 0}
											{#each instructor.sports as sport}
												<Badge variant="secondary">{sport.sport}</Badge>
											{/each}
										{:else}
											<span class="text-muted-foreground text-sm">None</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-wrap gap-1">
										{#if instructor.spokenLanguages && instructor.spokenLanguages.length > 0}
											{#each instructor.spokenLanguages.slice(0, 2) as lang}
												<Badge variant="outline">{lang}</Badge>
											{/each}
											{#if instructor.spokenLanguages.length > 2}
												<Badge variant="outline">+{instructor.spokenLanguages.length - 2}</Badge>
											{/if}
										{:else}
											<span class="text-muted-foreground text-sm">None</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>
									{#if instructor.professionalPhone}
										<p class="text-sm">
											+{instructor.professionalCountryCode} {instructor.professionalPhone}
										</p>
									{:else}
										<span class="text-muted-foreground text-sm">No phone</span>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button
											href={route(`/instructors/${instructor.id}`)}
											variant="ghost"
											size="sm"
										>
											View Profile
										</Button>
										<form method="POST" action="?/deactivate">
											<input type="hidden" name="instructorId" value={instructor.id} />
											<Button type="submit" variant="outline" size="sm">
												Remove
											</Button>
										</form>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
