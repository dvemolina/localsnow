<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { bookings, school, instructorCount } = $derived(data);

	function formatDate(dateString: string | Date) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getStatusBadgeClass(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'viewed':
				return 'bg-blue-100 text-blue-800';
			case 'accepted':
				return 'bg-green-100 text-green-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800';
			case 'completed':
				return 'bg-purple-100 text-purple-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">School Bookings</h1>
			<p class="text-muted-foreground mt-1">
				All booking requests for {school.name} instructors
			</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-sm font-medium text-muted-foreground">
					Total Bookings
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{bookings.length}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-sm font-medium text-muted-foreground">
					Active Instructors
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{instructorCount}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-sm font-medium text-muted-foreground">
					Pending Requests
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{bookings.filter(b => b.booking.status === 'pending').length}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Bookings Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>All Bookings</Card.Title>
			<Card.Description>View and manage booking requests for your school</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if bookings.length === 0}
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
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-medium">No bookings yet</h3>
					<p class="text-muted-foreground mt-2">
						Booking requests for your instructors will appear here
					</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Client</Table.Head>
							<Table.Head>Instructor</Table.Head>
							<Table.Head>Date</Table.Head>
							<Table.Head>Students</Table.Head>
							<Table.Head>Hours</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Price</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each bookings as { booking, instructor }}
							<Table.Row>
								<Table.Cell>
									<div>
										<p class="font-medium">{booking.clientName}</p>
										<p class="text-sm text-muted-foreground">{booking.clientEmail}</p>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="font-medium">
										{instructor.name} {instructor.lastName}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="text-sm">
										{formatDate(booking.startDate)}
										{#if booking.endDate}
											- {formatDate(booking.endDate)}
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>{booking.numberOfStudents}</Table.Cell>
								<Table.Cell>{booking.hoursPerDay}h/day</Table.Cell>
								<Table.Cell>
									<Badge class="{getStatusBadgeClass(booking.status)} capitalize">
										{booking.status}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									{#if booking.estimatedPrice}
										<div class="font-medium">
											{booking.currency === 'EUR' ? '€' : '$'}{(
												booking.estimatedPrice / 100
											).toFixed(2)}
										</div>
									{:else}
										<span class="text-muted-foreground text-sm">-</span>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
