<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { t } from '$lib/i18n/i18n';

	let { leadStats } = $props<{
		leadStats: {
			total: number;
			thisMonth: number;
			new: number;
			contacted: number;
			converted: number;
		} | null;
	}>();
</script>

<Card.Root>
	<Card.Header class="pb-2">
		<Card.Title class="text-sm font-medium text-muted-foreground">
			{$t('dashboard_contact_inquiries') || 'Contact Inquiries'}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if leadStats}
			<div class="space-y-3">
				<div>
					<div class="text-2xl font-bold">{leadStats.total}</div>
					<p class="text-xs text-muted-foreground">
						{$t('dashboard_total_leads') || 'Total inquiries'}
					</p>
				</div>

				<div class="flex flex-wrap gap-2">
					<Badge variant="default" class="bg-green-600">
						{leadStats.new} {$t('status_new') || 'New'}
					</Badge>
					<Badge variant="secondary">
						{leadStats.contacted} {$t('status_contacted') || 'Contacted'}
					</Badge>
					<Badge variant="outline">
						{leadStats.converted} {$t('status_converted') || 'Converted'}
					</Badge>
				</div>

				{#if leadStats.thisMonth > 0}
					<p class="text-xs text-muted-foreground">
						{leadStats.thisMonth} {leadStats.thisMonth === 1
							? $t('dashboard_inquiry_this_month') || 'inquiry this month'
							: $t('dashboard_inquiries_this_month') || 'inquiries this month'}
					</p>
				{/if}
			</div>
		{:else}
			<div class="text-2xl font-bold">0</div>
			<p class="text-xs text-muted-foreground">
				{$t('dashboard_no_inquiries_yet') || 'No inquiries yet'}
			</p>
		{/if}
	</Card.Content>
</Card.Root>
