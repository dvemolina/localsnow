<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import { t } from '$lib/i18n/i18n';
	import { invalidateAll } from '$app/navigation';

	let { recentLeads, instructorId } = $props<{
		recentLeads: any[] | null;
		instructorId: number;
	}>();

	let updatingLeadId = $state<number | null>(null);

	async function updateLeadStatus(leadId: number, newStatus: string) {
		updatingLeadId = leadId;

		try {
			const response = await fetch(`/api/leads/${leadId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (!response.ok) {
				throw new Error('Failed to update lead status');
			}

			toast.success($t('success_lead_status_updated') || 'Lead status updated successfully');

			// Refresh data
			await invalidateAll();
		} catch (error) {
			console.error('Error updating lead status:', error);
			toast.error($t('error_update_lead_status') || 'Failed to update lead status');
		} finally {
			updatingLeadId = null;
		}
	}

	function formatDate(date: Date | string | null): string {
		if (!date) return 'N/A';
		const d = new Date(date);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getStatusColor(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
		switch (status) {
			case 'new':
				return 'default';
			case 'contacted':
				return 'secondary';
			case 'converted':
				return 'outline';
			case 'spam':
				return 'destructive';
			default:
				return 'secondary';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'new':
				return $t('status_new') || 'New';
			case 'contacted':
				return $t('status_contacted') || 'Contacted';
			case 'converted':
				return $t('status_converted') || 'Converted';
			case 'spam':
				return $t('status_spam') || 'Spam';
			default:
				return status;
		}
	}
</script>

<Card.Root class="col-span-full">
	<Card.Header>
		<Card.Title>{$t('dashboard_recent_inquiries') || 'Recent Inquiries'}</Card.Title>
		<Card.Description>
			{$t('dashboard_recent_inquiries_description') || 'Contact requests from potential clients'}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if recentLeads && recentLeads.length > 0}
			<div class="space-y-4">
				{#each recentLeads as lead}
					<div class="rounded-lg border border-border bg-card p-4">
						<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
							<!-- Lead Info -->
							<div class="flex-1 space-y-2">
								<div class="flex items-center gap-2">
									<h4 class="font-semibold">
										{lead.clientName || $t('label_anonymous') || 'Anonymous'}
									</h4>
									<Badge variant={getStatusColor(lead.status)}>
										{getStatusLabel(lead.status)}
									</Badge>
								</div>

								<div class="space-y-1 text-sm text-muted-foreground">
									<div class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="size-4"
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
										<a href={`mailto:${lead.clientEmail}`} class="hover:underline">
											{lead.clientEmail}
										</a>
									</div>

									{#if lead.clientPhone}
										<div class="flex items-center gap-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="size-4"
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

									<div class="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="size-4"
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
										<span>{formatDate(lead.createdAt)}</span>
									</div>
								</div>

								<p class="mt-2 text-sm">
									{lead.message}
								</p>
							</div>

							<!-- Status Actions -->
							<div class="flex flex-col gap-2">
								<Select.Root
									onSelectedChange={async (selected) => {
										if (selected?.value && selected.value !== lead.status) {
											await updateLeadStatus(lead.id, selected.value);
										}
									}}
								>
									<Select.Trigger class="w-[150px]" disabled={updatingLeadId === lead.id}>
										<Select.Value placeholder={getStatusLabel(lead.status)} />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="new">{$t('status_new') || 'New'}</Select.Item>
										<Select.Item value="contacted">{$t('status_contacted') || 'Contacted'}</Select.Item>
										<Select.Item value="converted">{$t('status_converted') || 'Converted'}</Select.Item>
										<Select.Item value="spam">{$t('status_spam') || 'Spam'}</Select.Item>
									</Select.Content>
								</Select.Root>

								{#if updatingLeadId === lead.id}
									<div class="flex items-center justify-center">
										<svg
											class="size-4 animate-spin text-muted-foreground"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- View All Button -->
			{#if recentLeads.length >= 10}
				<div class="mt-4 text-center">
					<Button href="/dashboard/leads" variant="outline" size="sm">
						{$t('button_view_all_leads') || 'View All Inquiries'}
					</Button>
				</div>
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center py-8 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mb-4 size-12 text-muted-foreground"
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
				<h3 class="mb-2 font-semibold">
					{$t('dashboard_no_inquiries') || 'No inquiries yet'}
				</h3>
				<p class="text-sm text-muted-foreground">
					{$t('dashboard_no_inquiries_description') ||
						'When clients contact you through your profile, they will appear here'}
				</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
