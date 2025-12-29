<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { route } from '$lib/i18n/routeHelpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { school, stats, recentBookings, pendingInstructors } = $derived(data);

	function formatDate(dateString: string | Date) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getStatusBadgeClass(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'accepted':
				return 'bg-green-100 text-green-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="space-y-6">
	<!-- School Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{school.name}</h1>
			<p class="text-muted-foreground mt-1">School Dashboard</p>
		</div>
		<Button href={route('/dashboard/school/profile')} variant="outline">
			Edit School Profile
		</Button>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Instructors</Card.Title>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					class="h-4 w-4 text-muted-foreground"
				>
					<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
					<circle cx="9" cy="7" r="4" />
					<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.instructorCount}</div>
				<p class="text-xs text-muted-foreground">Active instructors in your school</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Pending Requests</Card.Title>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					class="h-4 w-4 text-muted-foreground"
				>
					<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.pendingCount}</div>
				<p class="text-xs text-muted-foreground">Instructor applications awaiting review</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Recent Bookings</Card.Title>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					class="h-4 w-4 text-muted-foreground"
				>
					<rect width="20" height="14" x="2" y="5" rx="2" />
					<path d="M2 10h20" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{recentBookings.length}</div>
				<p class="text-xs text-muted-foreground">Last 5 booking requests</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Pending Instructor Requests -->
	{#if pendingInstructors.length > 0}
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<Card.Title>Pending Instructor Requests</Card.Title>
					<Button href={route('/dashboard/school/instructors/pending')} variant="ghost" size="sm">
						View All
					</Button>
				</div>
				<Card.Description>Instructors waiting for approval</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each pendingInstructors as request}
						<div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
							<div class="flex items-center gap-4">
								{#if request.instructor?.profileImageUrl}
									<img
										src={request.instructor.profileImageUrl}
										alt={request.instructor.name}
										class="h-10 w-10 rounded-full object-cover"
									/>
								{:else}
									<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
										<span class="text-sm font-medium">
											{request.instructor?.name?.[0]}{request.instructor?.lastName?.[0]}
										</span>
									</div>
								{/if}
								<div>
									<p class="font-medium">
										{request.instructor?.name} {request.instructor?.lastName}
									</p>
									<p class="text-sm text-muted-foreground">
										Applied {formatDate(request.requestedAt)}
									</p>
								</div>
							</div>
							<Button
								href={route('/dashboard/school/instructors/pending')}
								variant="outline"
								size="sm"
							>
								Review
							</Button>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Recent Bookings -->
	{#if recentBookings.length > 0}
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<Card.Title>Recent Bookings</Card.Title>
					<Button href={route('/dashboard/school/bookings')} variant="ghost" size="sm">
						View All
					</Button>
				</div>
				<Card.Description>Latest booking requests for your instructors</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each recentBookings as booking}
						<div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
							<div>
								<p class="font-medium">{booking.clientName}</p>
								<p class="text-sm text-muted-foreground">
									{formatDate(booking.startDate)} • {booking.numberOfStudents} student{booking.numberOfStudents >
									1
										? 's'
										: ''}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span
									class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {getStatusBadgeClass(
										booking.status
									)}"
								>
									{booking.status}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Quick Actions -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card.Root class="cursor-pointer transition-colors hover:bg-accent">
			<a href={route('/dashboard/school/instructors/discover')} class="block">
				<Card.Header>
					<Card.Title class="text-base">Invite Instructors</Card.Title>
					<Card.Description>Browse and invite instructors to join your school</Card.Description>
				</Card.Header>
			</a>
		</Card.Root>

		<Card.Root class="cursor-pointer transition-colors hover:bg-accent">
			<a href={route('/dashboard/school/lessons')} class="block">
				<Card.Header>
					<Card.Title class="text-base">Manage Pricing</Card.Title>
					<Card.Description>Set lesson prices and packages for your school</Card.Description>
				</Card.Header>
			</a>
		</Card.Root>

		<Card.Root class="cursor-pointer transition-colors hover:bg-accent">
			<a href={route('/dashboard/school/instructors')} class="block">
				<Card.Header>
					<Card.Title class="text-base">View Roster</Card.Title>
					<Card.Description>See all active instructors in your school</Card.Description>
				</Card.Header>
			</a>
		</Card.Root>
	</div>
</div>
