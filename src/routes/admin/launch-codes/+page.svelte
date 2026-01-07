<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { useIntlayer } from 'svelte-intlayer';
	import { enhance } from '$app/forms';

	const status = useIntlayer('status');
	const admin = useIntlayer('admin');
	const table = useIntlayer('table');
	const button = useIntlayer('button');

	let { data } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function isExpired(date: Date | string) {
		return new Date(date) < new Date();
	}

	function getStatusBadge(code: any) {
		if (isExpired(code.validUntil)) {
			return { variant: 'destructive' as const, text: m["dashboard.my-bookings.status_expired"]() };
		}
		if (!code.isActive) {
			return { variant: 'secondary' as const, text: m["admin.launch-codes.status_inactive"]() };
		}
		if (code.maxUses && code.totalUsage >= code.maxUses) {
			return { variant: 'secondary' as const, text: m["admin.launch-codes.status_max_uses_reached"]() };
		}
		return { variant: 'default' as const, text: $status.active.value };
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<!-- Page Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="title2 mb-2">{m["admin.launch-codes.admin_launch_codes_title"]()}</h1>
			<p class="text-muted-foreground">{m["admin.launch-codes.admin_launch_codes_desc"]()}</p>
		</div>
		<Button href="/admin/launch-codes/create" class="bg-primary text-white">
			{$admin.create_launch_code.value}
		</Button>
	</div>

	<!-- Launch Codes Table -->
	<Card>
		<CardHeader>
			<CardTitle>{m["admin.launch-codes.admin_all_launch_codes"]()} ({data.codes.length})</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.codes.length === 0}
				<p class="text-center text-muted-foreground py-8">
					{m["admin.launch-codes.admin_no_launch_codes"]()}
				</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{m["admin.launch-codes.table_code"]()}</Table.Head>
							<Table.Head>{m["admin.launch-codes.table_description"]()}</Table.Head>
							<Table.Head>{m["admin.launch-codes.table_valid_until"]()}</Table.Head>
							<Table.Head>{m["admin.launch-codes.table_usage"]()}</Table.Head>
							<Table.Head>{$table.status.value}</Table.Head>
							<Table.Head>{$table.actions.value}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.codes as code}
							<Table.Row>
								<Table.Cell class="font-mono font-semibold">
									{code.code}
								</Table.Cell>
								<Table.Cell>
									<div class="max-w-md">
										{code.description || m["admin.launch-codes.admin_no_description"]()}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class:text-red-600={isExpired(code.validUntil)}>
										{formatDate(code.validUntil)}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="space-y-1">
										<div class="text-sm">
											<span class="font-semibold">{code.totalUsage}</span>
											{#if code.maxUses}
												/ {code.maxUses}
											{:else}
												/ ∞
											{/if}
											{m["admin.launch-codes.admin_total_uses"]()}
										</div>
										<div class="text-xs text-muted-foreground">
											{code.bookingUsage} {m["admin.launch-codes.admin_bookings_lowercase"]()} •
											{code.leadUsage} {m["admin.launch-codes.admin_leads_lowercase"]()}
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									{@const status = getStatusBadge(code)}
									<Badge variant={status.variant}>
										{status.text}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<Button
											href="/admin/launch-codes/{code.id}/edit"
											variant="outline"
											size="sm"
										>
											{$button.edit.value}
										</Button>

										<form method="POST" action="?/toggle" use:enhance>
											<input type="hidden" name="id" value={code.id} />
											<Button
												type="submit"
												variant="outline"
												size="sm"
											>
												{code.isActive ? m["admin.launch-codes.button_deactivate"]() : m["admin.launch-codes.button_activate"]()}
											</Button>
										</form>

										<form
											method="POST"
											action="?/delete"
											use:enhance={() => {
												return ({ update }) => {
													if (confirm(m["admin.launch-codes.admin_confirm_delete_code"]())) {
														update();
													}
												};
											}}
										>
											<input type="hidden" name="id" value={code.id} />
											<Button
												type="submit"
												variant="destructive"
												size="sm"
											>
												{$button.delete.value}
											</Button>
										</form>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</CardContent>
	</Card>

	<!-- Usage Statistics -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium">{m["admin.launch-codes.admin_total_codes"]()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.codes.length}</div>
				<p class="text-xs text-muted-foreground">
					{data.codes.filter(c => c.isActive).length} {$status.active.value.toLowerCase()}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium">{m["admin.launch-codes.admin_total_code_uses"]()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{data.codes.reduce((sum, code) => sum + code.totalUsage, 0)}
				</div>
				<p class="text-xs text-muted-foreground">
					{m["admin.launch-codes.admin_across_all_codes"]()}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium">{m["admin.launch-codes.admin_expired_codes"]()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{data.codes.filter(c => isExpired(c.validUntil)).length}
				</div>
				<p class="text-xs text-muted-foreground">
					{m["admin.launch-codes.admin_need_renewal"]()}
				</p>
			</CardContent>
		</Card>
	</div>
</div>
