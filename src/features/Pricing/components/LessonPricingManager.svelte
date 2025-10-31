<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';
	import { Plus, Pencil, Trash2, Percent, Euro, Calendar } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { DurationPackage, GroupPricingTier, PromoCode } from '$src/features/Lessons/lib/lessonSchema';

	let {
		lessonId,
		baseHourlyRate = 0,
		durationPackages = [],
		groupPricingTiers = [],
		promoCodes = []
	}: {
		lessonId: number;
		baseHourlyRate: number;
		durationPackages?: DurationPackage[];
		groupPricingTiers?: GroupPricingTier[];
		promoCodes?: PromoCode[];
	} = $props();

	// Dialog states
	let isPackageDialogOpen = $state(false);
	let isTierDialogOpen = $state(false);
	let isPromoDialogOpen = $state(false);

	// Edit states
	let editingPackage = $state<DurationPackage | null>(null);
	let editingTier = $state<GroupPricingTier | null>(null);
	let editingPromo = $state<PromoCode | null>(null);

	// Form data
	let packageForm = $state({
		name: '',
		hours: '',
		minStudents: '',
		maxStudents: '',
		price: '',
		isActive: true
	});

	let tierForm = $state({
		name: '',
		minStudents: '',
		maxStudents: '',
		discountType: 'percentage',
		discountValue: '',
		priority: '0',
		isActive: true
	});

	let promoForm = $state({
		code: '',
		name: '',
		discountType: 'percentage',
		discountValue: '',
		validFrom: '',
		validUntil: '',
		maxUses: '',
		maxDiscountAmount: '',
		isActive: true
	});

	// Duration package functions
	function openPackageDialog(pkg: DurationPackage | null = null) {
		editingPackage = pkg;
		if (pkg) {
			packageForm = {
				name: pkg.name,
				hours: pkg.hours.toString(),
				minStudents: pkg.minStudents.toString(),
				maxStudents: pkg.maxStudents.toString(),
				price: pkg.price.toString(),
				isActive: pkg.isActive
			};
		} else {
			packageForm = {
				name: '',
				hours: '',
				minStudents: '1',
				maxStudents: '8',
				price: '',
				isActive: true
			};
		}
		isPackageDialogOpen = true;
	}

	function openTierDialog(tier: GroupPricingTier | null = null) {
		editingTier = tier;
		if (tier) {
			tierForm = {
				name: tier.name,
				minStudents: tier.minStudents.toString(),
				maxStudents: tier.maxStudents.toString(),
				discountType: tier.discountType,
				discountValue: tier.discountValue.toString(),
				priority: tier.priority.toString(),
				isActive: tier.isActive
			};
		} else {
			tierForm = {
				name: '',
				minStudents: '',
				maxStudents: '',
				discountType: 'percentage',
				discountValue: '',
				priority: '0',
				isActive: true
			};
		}
		isTierDialogOpen = true;
	}

	function openPromoDialog(promo: PromoCode | null = null) {
		editingPromo = promo;
		if (promo) {
			promoForm = {
				code: promo.code,
				name: promo.name || '',
				discountType: promo.discountType,
				discountValue: promo.discountValue.toString(),
				validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().slice(0, 16) : '',
				validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().slice(0, 16) : '',
				maxUses: promo.maxUses?.toString() || '',
				maxDiscountAmount: promo.maxDiscountAmount?.toString() || '',
				isActive: promo.isActive
			};
		} else {
			promoForm = {
				code: '',
				name: '',
				discountType: 'percentage',
				discountValue: '',
				validFrom: '',
				validUntil: '',
				maxUses: '',
				maxDiscountAmount: '',
				isActive: true
			};
		}
		isPromoDialogOpen = true;
	}

	function formatDiscountLabel(type: string, value: number): string {
		if (type === 'percentage') return `${value}%`;
		if (type === 'fixed_amount') return `${value}€`;
		if (type === 'price_override') return `${value}€`;
		return `${value}`;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Pricing Management</Card.Title>
		<Card.Description>
			Configure duration packages, group discounts, and promotional codes
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Tabs.Root value="packages">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="packages">Duration Packages</Tabs.Trigger>
				<Tabs.Trigger value="tiers">Group Pricing</Tabs.Trigger>
				<Tabs.Trigger value="promos">Promo Codes</Tabs.Trigger>
			</Tabs.List>

			<!-- Duration Packages Tab -->
			<Tabs.Content value="packages" class="space-y-4">
				<div class="flex justify-between items-center">
					<p class="text-sm text-muted-foreground">
						Create packages for specific durations (e.g., "Half Day - 3hrs")
					</p>
					<Button size="sm" onclick={() => openPackageDialog()}>
						<Plus class="h-4 w-4 mr-2" />
						Add Package
					</Button>
				</div>

				<div class="space-y-2">
					{#if durationPackages.length === 0}
						<div class="text-center py-8 text-muted-foreground">
							No duration packages yet. Create one to offer special rates for common durations.
						</div>
					{:else}
						{#each durationPackages as pkg (pkg.id)}
							<Card.Root>
								<Card.Content class="p-4">
									<div class="flex justify-between items-start">
										<div class="space-y-1">
											<div class="flex items-center gap-2">
												<h4 class="font-medium">{pkg.name}</h4>
												{#if !pkg.isActive}
													<Badge variant="secondary">Inactive</Badge>
												{/if}
											</div>
											<div class="text-sm text-muted-foreground space-y-1">
												<p>{pkg.hours} hours - {pkg.price}€</p>
												<p>Students: {pkg.minStudents}-{pkg.maxStudents}</p>
												<p class="text-xs text-green-600">
													Save {((baseHourlyRate * pkg.hours * pkg.minStudents - pkg.price) / (baseHourlyRate * pkg.hours * pkg.minStudents) * 100).toFixed(0)}% vs hourly rate
												</p>
											</div>
										</div>
										<div class="flex gap-2">
											<Button size="sm" variant="outline" onclick={() => openPackageDialog(pkg)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<form method="POST" action="?/deleteDurationPackage" use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success') {
														toast.success('Package deleted');
														isPackageDialogOpen = false;
													} else if (result.type === 'failure') {
														toast.error(result.data?.message || 'Failed to delete package');
													}
												};
											}}>
												<input type="hidden" name="packageId" value={pkg.id} />
												<Button size="sm" variant="destructive" type="submit">
													<Trash2 class="h-4 w-4" />
												</Button>
											</form>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					{/if}
				</div>
			</Tabs.Content>

			<!-- Group Pricing Tiers Tab -->
			<Tabs.Content value="tiers" class="space-y-4">
				<div class="flex justify-between items-center">
					<p class="text-sm text-muted-foreground">
						Offer discounts based on group size
					</p>
					<Button size="sm" onclick={() => openTierDialog()}>
						<Plus class="h-4 w-4 mr-2" />
						Add Tier
					</Button>
				</div>

				<div class="space-y-2">
					{#if groupPricingTiers.length === 0}
						<div class="text-center py-8 text-muted-foreground">
							No group pricing tiers yet. Create one to offer discounts for larger groups.
						</div>
					{:else}
						{#each groupPricingTiers as tier (tier.id)}
							<Card.Root>
								<Card.Content class="p-4">
									<div class="flex justify-between items-start">
										<div class="space-y-1">
											<div class="flex items-center gap-2">
												<h4 class="font-medium">{tier.name}</h4>
												{#if !tier.isActive}
													<Badge variant="secondary">Inactive</Badge>
												{/if}
												<Badge variant="outline">Priority: {tier.priority}</Badge>
											</div>
											<div class="text-sm text-muted-foreground">
												<p>{tier.minStudents}-{tier.maxStudents} students</p>
												<p>Discount: {formatDiscountLabel(tier.discountType, tier.discountValue)}</p>
											</div>
										</div>
										<div class="flex gap-2">
											<Button size="sm" variant="outline" onclick={() => openTierDialog(tier)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<form method="POST" action="?/deleteGroupTier" use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success') {
														toast.success('Tier deleted');
													} else if (result.type === 'failure') {
														toast.error(result.data?.message || 'Failed to delete tier');
													}
												};
											}}>
												<input type="hidden" name="tierId" value={tier.id} />
												<Button size="sm" variant="destructive" type="submit">
													<Trash2 class="h-4 w-4" />
												</Button>
											</form>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					{/if}
				</div>
			</Tabs.Content>

			<!-- Promo Codes Tab -->
			<Tabs.Content value="promos" class="space-y-4">
				<div class="flex justify-between items-center">
					<p class="text-sm text-muted-foreground">
						Create promotional discount codes
					</p>
					<Button size="sm" onclick={() => openPromoDialog()}>
						<Plus class="h-4 w-4 mr-2" />
						Add Promo Code
					</Button>
				</div>

				<div class="space-y-2">
					{#if promoCodes.length === 0}
						<div class="text-center py-8 text-muted-foreground">
							No promo codes yet. Create one to offer special discounts to your clients.
						</div>
					{:else}
						{#each promoCodes as promo (promo.id)}
							<Card.Root>
								<Card.Content class="p-4">
									<div class="flex justify-between items-start">
										<div class="space-y-1">
											<div class="flex items-center gap-2">
												<h4 class="font-mono font-medium">{promo.code}</h4>
												{#if !promo.isActive}
													<Badge variant="secondary">Inactive</Badge>
												{:else}
													<Badge variant="default">Active</Badge>
												{/if}
											</div>
											{#if promo.name}
												<p class="text-sm">{promo.name}</p>
											{/if}
											<div class="text-sm text-muted-foreground space-y-1">
												<p>Discount: {formatDiscountLabel(promo.discountType, promo.discountValue)}</p>
												{#if promo.validFrom || promo.validUntil}
													<p class="flex items-center gap-1">
														<Calendar class="h-3 w-3" />
														{#if promo.validFrom}
															From {new Date(promo.validFrom).toLocaleDateString()}
														{/if}
														{#if promo.validUntil}
															to {new Date(promo.validUntil).toLocaleDateString()}
														{/if}
													</p>
												{/if}
												{#if promo.maxUses}
													<p>Uses: {promo.currentUses}/{promo.maxUses}</p>
												{:else}
													<p>Uses: {promo.currentUses} (unlimited)</p>
												{/if}
											</div>
										</div>
										<div class="flex gap-2">
											<Button size="sm" variant="outline" onclick={() => openPromoDialog(promo)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<form method="POST" action="?/deletePromoCode" use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success') {
														toast.success('Promo code deleted');
													} else if (result.type === 'failure') {
														toast.error(result.data?.message || 'Failed to delete promo code');
													}
												};
											}}>
												<input type="hidden" name="promoId" value={promo.id} />
												<Button size="sm" variant="destructive" type="submit">
													<Trash2 class="h-4 w-4" />
												</Button>
											</form>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Card.Content>
</Card.Root>

<!-- Duration Package Dialog -->
<Dialog.Root bind:open={isPackageDialogOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				{editingPackage ? 'Edit' : 'Create'} Duration Package
			</Dialog.Title>
			<Dialog.Description>
				Set a fixed price for a specific duration and group size range
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action={editingPackage ? '?/updateDurationPackage' : '?/createDurationPackage'} use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(editingPackage ? 'Package updated' : 'Package created');
					isPackageDialogOpen = false;
					editingPackage = null;
				} else if (result.type === 'failure') {
					toast.error(result.data?.message || 'Operation failed');
				}
			};
		}}>
			<div class="space-y-4 py-4">
				<input type="hidden" name="lessonId" value={lessonId} />
				{#if editingPackage}
					<input type="hidden" name="packageId" value={editingPackage.id} />
				{/if}

				<div class="space-y-2">
					<Label for="package-name">Package Name</Label>
					<Input
						id="package-name"
						name="name"
						bind:value={packageForm.name}
						placeholder="e.g., Half Day"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="package-hours">Hours</Label>
						<Input
							id="package-hours"
							name="hours"
							type="number"
							step="0.5"
							min="0.5"
							bind:value={packageForm.hours}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="package-price">Price (€)</Label>
						<Input
							id="package-price"
							name="price"
							type="number"
							step="0.01"
							min="0"
							bind:value={packageForm.price}
							required
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="package-min">Min Students</Label>
						<Input
							id="package-min"
							name="minStudents"
							type="number"
							min="1"
							bind:value={packageForm.minStudents}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="package-max">Max Students</Label>
						<Input
							id="package-max"
							name="maxStudents"
							type="number"
							min="1"
							bind:value={packageForm.maxStudents}
							required
						/>
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<Switch
						id="package-active"
						name="isActive"
						bind:checked={packageForm.isActive}
					/>
					<Label for="package-active">Active</Label>
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (isPackageDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">
					{editingPackage ? 'Update' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Group Tier Dialog -->
<Dialog.Root bind:open={isTierDialogOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				{editingTier ? 'Edit' : 'Create'} Group Pricing Tier
			</Dialog.Title>
			<Dialog.Description>
				Offer discounts for groups of specific sizes
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action={editingTier ? '?/updateGroupTier' : '?/createGroupTier'} use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(editingTier ? 'Tier updated' : 'Tier created');
					isTierDialogOpen = false;
					editingTier = null;
				} else if (result.type === 'failure') {
					toast.error(result.data?.message || 'Operation failed');
				}
			};
		}}>
			<div class="space-y-4 py-4">
				<input type="hidden" name="lessonId" value={lessonId} />
				{#if editingTier}
					<input type="hidden" name="tierId" value={editingTier.id} />
				{/if}

				<div class="space-y-2">
					<Label for="tier-name">Tier Name</Label>
					<Input
						id="tier-name"
						name="name"
						bind:value={tierForm.name}
						placeholder="e.g., Small Group"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="tier-min">Min Students</Label>
						<Input
							id="tier-min"
							name="minStudents"
							type="number"
							min="1"
							bind:value={tierForm.minStudents}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="tier-max">Max Students</Label>
						<Input
							id="tier-max"
							name="maxStudents"
							type="number"
							min="1"
							bind:value={tierForm.maxStudents}
							required
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="tier-discount-type">Discount Type</Label>
					<Select.Root
						selected={{ value: tierForm.discountType, label: tierForm.discountType === 'percentage' ? 'Percentage' : tierForm.discountType === 'fixed_amount' ? 'Fixed Amount' : 'Price Override' }}
						onSelectedChange={(v) => {
							if (v) tierForm.discountType = v.value;
						}}
					>
						<Select.Trigger id="tier-discount-type">
							<Select.Value placeholder="Select type" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="percentage">Percentage</Select.Item>
							<Select.Item value="fixed_amount">Fixed Amount</Select.Item>
							<Select.Item value="price_override">Price Override</Select.Item>
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="discountType" value={tierForm.discountType} />
				</div>

				<div class="space-y-2">
					<Label for="tier-value">
						{tierForm.discountType === 'percentage' ? 'Discount %' : 'Amount (€)'}
					</Label>
					<Input
						id="tier-value"
						name="discountValue"
						type="number"
						step="0.01"
						min="0"
						bind:value={tierForm.discountValue}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="tier-priority">Priority</Label>
					<Input
						id="tier-priority"
						name="priority"
						type="number"
						bind:value={tierForm.priority}
						required
					/>
					<p class="text-xs text-muted-foreground">Higher priority applies first if ranges overlap</p>
				</div>

				<div class="flex items-center space-x-2">
					<Switch
						id="tier-active"
						name="isActive"
						bind:checked={tierForm.isActive}
					/>
					<Label for="tier-active">Active</Label>
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (isTierDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">
					{editingTier ? 'Update' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Promo Code Dialog -->
<Dialog.Root bind:open={isPromoDialogOpen}>
	<Dialog.Content class="max-w-md max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>
				{editingPromo ? 'Edit' : 'Create'} Promo Code
			</Dialog.Title>
			<Dialog.Description>
				Create a promotional discount code for your clients
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action={editingPromo ? '?/updatePromoCode' : '?/createPromoCode'} use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(editingPromo ? 'Promo code updated' : 'Promo code created');
					isPromoDialogOpen = false;
					editingPromo = null;
				} else if (result.type === 'failure') {
					toast.error(result.data?.message || 'Operation failed');
				}
			};
		}}>
			<div class="space-y-4 py-4">
				<input type="hidden" name="lessonId" value={lessonId} />
				{#if editingPromo}
					<input type="hidden" name="promoId" value={editingPromo.id} />
				{/if}

				<div class="space-y-2">
					<Label for="promo-code">Code</Label>
					<Input
						id="promo-code"
						name="code"
						bind:value={promoForm.code}
						placeholder="e.g., WINTER2024"
						class="font-mono uppercase"
						required
						disabled={!!editingPromo}
					/>
				</div>

				<div class="space-y-2">
					<Label for="promo-name">Name (Optional)</Label>
					<Input
						id="promo-name"
						name="name"
						bind:value={promoForm.name}
						placeholder="e.g., Winter Special"
					/>
				</div>

				<div class="space-y-2">
					<Label for="promo-discount-type">Discount Type</Label>
					<Select.Root
						selected={{ value: promoForm.discountType, label: promoForm.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount' }}
						onSelectedChange={(v) => {
							if (v) promoForm.discountType = v.value;
						}}
					>
						<Select.Trigger id="promo-discount-type">
							<Select.Value placeholder="Select type" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="percentage">Percentage</Select.Item>
							<Select.Item value="fixed_amount">Fixed Amount</Select.Item>
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="discountType" value={promoForm.discountType} />
				</div>

				<div class="space-y-2">
					<Label for="promo-value">
						{promoForm.discountType === 'percentage' ? 'Discount %' : 'Discount Amount (€)'}
					</Label>
					<Input
						id="promo-value"
						name="discountValue"
						type="number"
						step="0.01"
						min="0"
						bind:value={promoForm.discountValue}
						required
					/>
				</div>

				{#if promoForm.discountType === 'percentage'}
					<div class="space-y-2">
						<Label for="promo-max">Max Discount Amount (€) - Optional</Label>
						<Input
							id="promo-max"
							name="maxDiscountAmount"
							type="number"
							step="0.01"
							min="0"
							bind:value={promoForm.maxDiscountAmount}
							placeholder="No limit"
						/>
					</div>
				{/if}

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="promo-from">Valid From (Optional)</Label>
						<Input
							id="promo-from"
							name="validFrom"
							type="datetime-local"
							bind:value={promoForm.validFrom}
						/>
					</div>

					<div class="space-y-2">
						<Label for="promo-until">Valid Until (Optional)</Label>
						<Input
							id="promo-until"
							name="validUntil"
							type="datetime-local"
							bind:value={promoForm.validUntil}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="promo-uses">Max Uses (Optional)</Label>
					<Input
						id="promo-uses"
						name="maxUses"
						type="number"
						min="1"
						bind:value={promoForm.maxUses}
						placeholder="Unlimited"
					/>
				</div>

				<div class="flex items-center space-x-2">
					<Switch
						id="promo-active"
						name="isActive"
						bind:checked={promoForm.isActive}
					/>
					<Label for="promo-active">Active</Label>
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (isPromoDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">
					{editingPromo ? 'Update' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>