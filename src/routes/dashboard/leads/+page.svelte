<script lang="ts">
	import RequestDetailDialog from '$src/features/Requests/components/RequestDetailDialog.svelte';
	import AddManualBookingDialog from '$src/features/Bookings/components/AddManualBookingDialog.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { goto } from '$app/navigation';
	import { isMobile } from '$src/lib/hooks/is-mobile.svelte.js';
	import { t } from '$src/lib/i18n/i18n.js';
	import { formatDate } from '$src/lib/utils/generics';
	let { data } = $props();

	let selectedLead = $state<any>(null);
	let dialogOpen = $state(false);
	let addBookingDialogOpen = $state(false);
	let leadToConvert = $state<any>(null);

	const handleViewDetails = (lead: any) => {
		selectedLead = lead;
		dialogOpen = true;
	};

	const handleConvertToBooking = () => {
		if (selectedLead) {
			leadToConvert = {
				clientName: selectedLead.clientName,
				clientEmail: selectedLead.clientEmail,
				clientPhone: selectedLead.clientPhone,
				numberOfStudents: selectedLead.numberOfStudents,
				preferredDates: selectedLead.preferredDates,
				skillLevel: selectedLead.skillLevel,
				message: selectedLead.message
			};
			addBookingDialogOpen = true;
		}
	};

	const changeFilter = (status: string) => {
		const url = new URL(window.location.href);
		if (status === 'all') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', status);
		}
		goto(url.pathname + url.search);
	};

	const statusConfig = $derived({
		new: {
			label: $t('status_new') || 'New',
			color: 'bg-blue-100 text-blue-800 border-blue-200'
		},
		contacted: {
			label: $t('status_contacted') || 'Contacted',
			color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
		},
		converted: {
			label: $t('status_converted') || 'Converted',
			color: 'bg-green-100 text-green-800 border-green-200'
		},
		spam: {
			label: $t('status_spam') || 'Spam',
			color: 'bg-red-100 text-red-800 border-red-200'
		}
	});

	// Create unique keys for each lead to avoid duplicate key errors
	const leadsWithUniqueKeys = $derived(
		data.leads.map((lead: any, index: number) => ({
			...lead,
			uniqueKey: `${lead.id}-${index}`
		}))
	);
</script>

<div class="container mx-auto max-w-7xl">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">{$t('leads_page_title') || 'Contact Inquiries'}</h1>
		<p class="text-muted-foreground">
			{$t('leads_page_subtitle') || 'Manage contact requests from potential clients'}
		</p>
	</div>

	<!-- Stats Overview -->
	<div class="grid gap-4 md:grid-cols-4 mb-6">
		<Card.Root>
			<Card.Content class="p-6">
				<div class="text-2xl font-bold">{data.stats.total}</div>
				<p class="text-xs text-muted-foreground">{$t('stats_total_inquiries') || 'Total Inquiries'}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-6">
				<div class="text-2xl font-bold text-blue-600">{data.stats.new}</div>
				<p class="text-xs text-muted-foreground">{$t('stats_new') || 'New'}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-6">
				<div class="text-2xl font-bold text-yellow-600">{data.stats.contacted}</div>
				<p class="text-xs text-muted-foreground">{$t('stats_contacted') || 'Contacted'}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="p-6">
				<div class="text-2xl font-bold text-green-600">{data.stats.converted}</div>
				<p class="text-xs text-muted-foreground">{$t('stats_converted') || 'Converted'}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Filter Tabs -->
	<Tabs.Root value={data.currentFilter} class="mb-6" orientation={isMobile ? 'vertical' : 'horizontal'}>
		<Tabs.List class="grid w-full h-full grid-cols-2 md:grid-cols-5">
			<Tabs.Trigger value="all" onclick={() => changeFilter('all')}>
				{$t('filter_all') || 'All'}
				{#if data.stats.total > 0}
					<Badge variant="secondary" class="ml-2">{data.stats.total}</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="new" onclick={() => changeFilter('new')}>
				{$t('status_new') || 'New'}
				{#if data.stats.new > 0}
					<Badge variant="secondary" class="ml-2 bg-blue-100 text-blue-800">
						{data.stats.new}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="contacted" onclick={() => changeFilter('contacted')}>
				{$t('status_contacted') || 'Contacted'}
				{#if data.stats.contacted > 0}
					<Badge variant="secondary" class="ml-2 bg-yellow-100 text-yellow-800">
						{data.stats.contacted}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="converted" onclick={() => changeFilter('converted')}>
				{$t('status_converted') || 'Converted'}
				{#if data.stats.converted > 0}
					<Badge variant="secondary" class="ml-2 bg-green-100 text-green-800">
						{data.stats.converted}
					</Badge>
				{/if}
			</Tabs.Trigger>
			<Tabs.Trigger value="spam" onclick={() => changeFilter('spam')}>
				{$t('status_spam') || 'Spam'}
				{#if data.stats.spam > 0}
					<Badge variant="secondary" class="ml-2">{data.stats.spam}</Badge>
				{/if}
			</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<!-- Leads List -->
	{#if leadsWithUniqueKeys.length === 0}
		<div class="rounded-lg border-2 border-dashed border-border p-12 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
				<svg
					class="h-8 w-8 text-muted-foreground"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<h3 class="mb-2 font-semibold text-lg">
				{$t('leads_empty_state_title') || 'No inquiries found'}
			</h3>
			<p class="text-muted-foreground">
				{#if data.currentFilter === 'all'}
					{$t('leads_empty_state_all') || 'When clients contact you through your profile, they will appear here'}
				{:else}
					{$t('leads_empty_state_filtered') || `No ${data.currentFilter} inquiries`}
				{/if}
			</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each leadsWithUniqueKeys as lead (lead.uniqueKey)}
				{@const statusInfo = statusConfig[lead.status as keyof typeof statusConfig]}
				<Card.Root class="hover:shadow-md transition-shadow">
					<Card.Content class="p-6">
						<div class="space-y-4">
							<!-- Header -->
							<div class="flex items-start justify-between">
								<div class="space-y-1 flex-1">
									<div class="flex items-center gap-2">
										<h3 class="font-semibold text-lg">
											{lead.clientName || ($t('label_anonymous') || 'Anonymous')}
										</h3>
										<Badge class="{statusInfo.color} border">
											{statusInfo.label}
										</Badge>
									</div>
									<p class="text-sm text-muted-foreground">
										{formatDate(new Date(lead.createdAt))}
									</p>
								</div>
							</div>

							<!-- Contact Info -->
							<div class="space-y-2 text-sm">
								<div class="flex items-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="size-4 text-muted-foreground"
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
									<a href={`mailto:${lead.clientEmail}`} class="hover:underline truncate">
										{lead.clientEmail}
									</a>
								</div>
								{#if lead.clientPhone}
									<div class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="size-4 text-muted-foreground"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
											/>
										</svg>
										<a href={`tel:${lead.clientPhone}`} class="hover:underline">
											{lead.clientPhone}
										</a>
									</div>
								{/if}
							</div>

							<!-- Message Preview -->
							{#if lead.message}
								<p class="text-sm line-clamp-2 text-muted-foreground">
									{lead.message}
								</p>
							{/if}

							<!-- Lesson Details -->
							{#if lead.preferredDates || lead.numberOfStudents || lead.skillLevel}
								<div class="rounded-md bg-muted/50 p-3 space-y-1 text-xs">
									{#if lead.preferredDates}
										<div class="flex items-center gap-2">
											<span class="font-medium">{$t('label_preferred_dates') || 'Dates'}:</span>
											<span>{lead.preferredDates}</span>
										</div>
									{/if}
									{#if lead.numberOfStudents}
										<div class="flex items-center gap-2">
											<span class="font-medium">{$t('label_number_of_students') || 'Students'}:</span>
											<span>{lead.numberOfStudents}</span>
										</div>
									{/if}
									{#if lead.skillLevel}
										<div class="flex items-center gap-2">
											<span class="font-medium">{$t('label_skill_level') || 'Level'}:</span>
											<span class="capitalize">{lead.skillLevel}</span>
										</div>
									{/if}
								</div>
							{/if}

							<!-- Actions -->
							<div class="flex flex-col gap-2 pt-2">
								<Button
									onclick={() => handleViewDetails(lead)}
									class="w-full"
									variant="outline"
								>
									{$t('button_view_details') || 'View Details'}
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	<!-- Info Box -->
	{#if leadsWithUniqueKeys.length > 0 && data.stats.new > 0}
		<div class="mt-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
			<div class="flex gap-3">
				<svg
					class="h-5 w-5 flex-shrink-0 text-blue-600"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
				<div class="text-sm text-blue-800">
					<p class="font-medium">💡 {$t('leads_tip_title') || 'Tip'}</p>
					<p class="mt-1">
						{$t('leads_tip_message') || 'Respond to new inquiries quickly to increase your chances of converting them into bookings!'}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Detail Dialog -->
{#if selectedLead}
	<RequestDetailDialog
		request={selectedLead}
		type="lead"
		bind:open={dialogOpen}
		instructorLessons={data.instructorLessons}
		onConvertToBooking={handleConvertToBooking}
	/>
{/if}

<!-- Add Booking from Lead Dialog -->
<AddManualBookingDialog
	bind:open={addBookingDialogOpen}
	instructorLessons={data.instructorLessons}
	prefillData={leadToConvert}
/>
