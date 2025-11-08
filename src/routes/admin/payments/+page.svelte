<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';

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

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Payment Overview</h1>
		<p class="text-muted-foreground">Monitor platform revenue and transactions</p>
	</div>

	<!-- Revenue Summary -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle>Total Revenue</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.deposits.count + data.stats.leads.count} transactions
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Client Deposits</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalDepositRevenue.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.deposits.count} deposits
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Lead Payments</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">€{totalLeadRevenue.toFixed(2)}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.leads.count} instructor payments
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Recent Deposits -->
	<Card>
		<CardHeader>
			<CardTitle>Recent Client Deposits</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Client</Table.Head>
						<Table.Head>Amount</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Stripe ID</Table.Head>
						<Table.Head>Date</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.deposits.slice(0, 20) as deposit}
						<Table.Row>
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
			<CardTitle>Recent Lead Payments (Instructor)</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Instructor</Table.Head>
						<Table.Head>Client</Table.Head>
						<Table.Head>Amount</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Date</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.leadPayments.slice(0, 20) as payment}
						<Table.Row>
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
