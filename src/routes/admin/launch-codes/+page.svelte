<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { t } from '$lib/i18n/i18n';
	import { enhance } from '$app/forms';
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
			return { variant: 'destructive' as const, text: $my_bookings.status_expired.value };
		}
		if (!code.isActive) {
			return { variant: 'secondary' as const, text: $launch_codes.status_inactive.value };
		}
		if (code.maxUses && code.totalUsage >= code.maxUses) {
			return { variant: 'secondary' as const, text: $launch_codes.status_max_uses_reached.value };
		}
		return { variant: 'default' as const, text: $t('status_active') };
	}
</script>

<div class="container mx-auto max-w-7xl space-y-6">
	<!-- Page Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="title2 mb-2">{$launch_codes.admin_launch_codes_title.value}</h1>
			<p class="text-muted-foreground">{$launch_codes.admin_launch_codes_desc.value}</p>
		</div>
		<Button href="/admin/launch-codes/create" class="bg-primary text-white">
			{$t('admin_create_launch_code')}
		</Button>
	</div>

	<!-- Launch Codes Table -->
	<Card>
		<CardHeader>
			<CardTitle>{$launch_codes.admin_all_launch_codes.value} ({data.codes.length})</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.codes.length === 0}
				<p class="text-center text-muted-foreground py-8">
					{$launch_codes.admin_no_launch_codes.value}
				</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{$launch_codes.table_code.value}</Table.Head>
							<Table.Head>{$launch_codes.table_description.value}</Table.Head>
							<Table.Head>{$launch_codes.table_valid_until.value}</Table.Head>
							<Table.Head>{$launch_codes.table_usage.value}</Table.Head>
							<Table.Head>{$t('table_status')}</Table.Head>
							<Table.Head>{$t('table_actions')}</Table.Head>
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
										{code.description || $launch_codes.admin_no_description.value}
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
											{$launch_codes.admin_total_uses.value}
										</div>
										<div class="text-xs text-muted-foreground">
											{code.bookingUsage} {$launch_codes.admin_bookings_lowercase.value} •
											{code.leadUsage} {$launch_codes.admin_leads_lowercase.value}
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
											{$t('button_edit')}
										</Button>

										<form method="POST" action="?/toggle" use:enhance>
											<input type="hidden" name="id" value={code.id} />
											<Button
												type="submit"
												variant="outline"
												size="sm"
											>
												{code.isActive ? $launch_codes.button_deactivate.value : $launch_codes.button_activate.value}
											</Button>
										</form>

										<form
											method="POST"
											action="?/delete"
											use:enhance={() => {
												return ({ update }) => {
													if (confirm($launch_codes.admin_confirm_delete_code.value)) {
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
												{$t('button_delete')}
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
				<CardTitle class="text-sm font-medium">{$launch_codes.admin_total_codes.value}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.codes.length}</div>
				<p class="text-xs text-muted-foreground">
					{data.codes.filter(c => c.isActive).length} {$t('status_active').toLowerCase()}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium">{$launch_codes.admin_total_code_uses.value}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{data.codes.reduce((sum, code) => sum + code.totalUsage, 0)}
				</div>
				<p class="text-xs text-muted-foreground">
					{$launch_codes.admin_across_all_codes.value}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-medium">{$launch_codes.admin_expired_codes.value}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{data.codes.filter(c => isExpired(c.validUntil)).length}
				</div>
				<p class="text-xs text-muted-foreground">
					{$launch_codes.admin_need_renewal.value}
				</p>
			</CardContent>
		</Card>
	</div>
</div>
