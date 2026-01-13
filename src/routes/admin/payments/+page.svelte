<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	const totalDepositRevenue = Number(data.stats.deposits.total || 0);
	const totalLeadRevenue = Number(data.stats.leads.total || 0);
	const totalRevenue = totalDepositRevenue + totalLeadRevenue;

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<div class="mb-8">
		<h1 class="title2 mb-2">{$t('payments_admin_payment_overview')}</h1>
		<p class="text-muted-foreground">{$t('payments_admin_payment_overview_desc')}</p>
	</div>

	<!-- Revenue Summary -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle>{$t('payments_admin_total_revenue')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.deposits.count + data.stats.leads.count} {$t('payments_admin_transactions')}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{$t('payments_admin_client_deposits')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalDepositRevenue.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.deposits.count} {$t('payments_admin_deposits')}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{$t('payments_admin_lead_payments')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalLeadRevenue.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.leads.count} {$t('payments_admin_instructor_payments')}
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Recent Deposits -->
	<Card>
		<CardHeader>
			<CardTitle>{$t('payments_admin_recent_client_deposits')}</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_client')}</Table.Head>
						<Table.Head>{$t('payments_table_amount')}</Table.Head>
						<Table.Head>{$t('table_status')}</Table.Head>
						<Table.Head>{$t('payments_admin_stripe_id')}</Table.Head>
						<Table.Head>{$t('table_date')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.deposits.slice(0, 20) as deposit}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								#{deposit.id}
							</Table.Cell>
							<Table.Cell>
								{deposit.bookingRequest.clientName}
								<br />
								<span class="text-xs text-muted-foreground">
									{deposit.bookingRequest.clientEmail}
								</span>
							</Table.Cell>
							<Table.Cell class="font-medium">€{deposit.amount}</Table.Cell>
							<Table.Cell>
								<Badge
									class={deposit.status === 'refunded'
										? 'bg-green-100 text-green-800'
										: deposit.status === 'held'
											? 'bg-blue-100 text-blue-800'
											: 'bg-gray-100 text-gray-800'}
								>
									{deposit.status}
								</Badge>
							</Table.Cell>
							<Table.Cell class="font-mono text-xs">
								{deposit.stripePaymentIntentId?.slice(0, 20)}...
							</Table.Cell>
							<Table.Cell>{formatDate(deposit.createdAt)}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<!-- Recent Lead Payments -->
	<Card>
		<CardHeader>
			<CardTitle>{$t('payments_admin_recent_lead_payments')}</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('table_id')}</Table.Head>
						<Table.Head>{$t('table_instructor')}</Table.Head>
						<Table.Head>{$t('table_client')}</Table.Head>
						<Table.Head>{$t('payments_table_amount')}</Table.Head>
						<Table.Head>{$t('table_status')}</Table.Head>
						<Table.Head>{$t('table_date')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.leadPayments.slice(0, 20) as payment}
						<Table.Row>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								#{payment.id}
							</Table.Cell>
							<Table.Cell>
								{payment.instructor.name} {payment.instructor.lastName}
							</Table.Cell>
							<Table.Cell>
								{payment.bookingRequest.clientName}
							</Table.Cell>
							<Table.Cell class="font-medium">€{payment.amount}</Table.Cell>
							<Table.Cell>
								<Badge
									class={payment.status === 'paid'
										? 'bg-green-100 text-green-800'
										: 'bg-yellow-100 text-yellow-800'}
								>
									{payment.status}
								</Badge>
							</Table.Cell>
							<Table.Cell>{formatDate(payment.createdAt)}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
