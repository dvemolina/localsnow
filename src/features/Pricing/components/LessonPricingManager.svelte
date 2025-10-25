<script lang="ts">
	import * as Card from '$src/lib/components/ui/card';
	import { Button } from '$src/lib/components/ui/button';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as Tabs from '$src/lib/components/ui/tabs';
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Input } from '$src/lib/components/ui/input';
	import { Label } from '$src/lib/components/ui/label';
	import * as Select from '$src/lib/components/ui/select';
	import { Separator } from '$src/lib/components/ui/separator';
	import { Switch } from '$src/lib/components/ui/switch';
	import { Plus, Pencil, Trash2, DollarSign, Tag, Percent } from '@lucide/svelte';

	let {
		lesson,
		conditionalRules = [],
		promos = []
	}: {
		lesson: any;
		conditionalRules: any[];
		promos: any[];
	} = $props();

	let isConditionalDialogOpen = $state(false);
	let isPromoDialogOpen = $state(false);
	let selectedRule = $state<any>(null);
	let selectedPromo = $state<any>(null);

	let conditionalForm = $state({
		conditionType: 'students',
		minValue: '',
		maxValue: '',
		adjustmentType: 'percentage',
		adjustmentValue: '',
		priority: '0',
		isActive: true
	});

	let promoForm = $state({
		code: '',
		discountType: 'percentage',
		discountValue: '',
		startDate: '',
		endDate: '',
		maxUses: '',
		minPurchaseAmount: '',
		isActive: true
	});

	function resetConditionalForm() {
		conditionalForm = {
			conditionType: 'students',
			minValue: '',
			maxValue: '',
			adjustmentType: 'percentage',
			adjustmentValue: '',
			priority: '0',
			isActive: true
		};
	}

	function resetPromoForm() {
		promoForm = {
			code: '',
			discountType: 'percentage',
			discountValue: '',
			startDate: '',
			endDate: '',
			maxUses: '',
			minPurchaseAmount: '',
			isActive: true
		};
	}

	function handleCreateConditional() {
		resetConditionalForm();
		selectedRule = null;
		isConditionalDialogOpen = true;
	}

	function handleEditConditional(rule: any) {
		selectedRule = rule;
		conditionalForm = {
			conditionType: rule.conditionType,
			minValue: rule.minValue?.toString() || '',
			maxValue: rule.maxValue?.toString() || '',
			adjustmentType: rule.adjustmentType,
			adjustmentValue: rule.adjustmentValue,
			priority: rule.priority.toString(),
			isActive: rule.isActive
		};
		isConditionalDialogOpen = true;
	}

	function handleCreatePromo() {
		resetPromoForm();
		selectedPromo = null;
		isPromoDialogOpen = true;
	}

	function handleEditPromo(promo: any) {
		selectedPromo = promo;
		promoForm = {
			code: promo.code || '',
			discountType: promo.discountType,
			discountValue: promo.discountValue,
			startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
			endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
			maxUses: promo.maxUses?.toString() || '',
			minPurchaseAmount: promo.minPurchaseAmount || '',
			isActive: promo.isActive
		};
		isPromoDialogOpen = true;
	}

	function getAdjustmentLabel(type: string, value: string): string {
		const val = parseFloat(value);
		switch (type) {
			case 'percentage':
				return `${val > 0 ? '+' : ''}${val}%`;
			case 'fixed_amount':
				return `${val > 0 ? '+' : ''}${val}€`;
			case 'multiplier':
				return `×${val}`;
			default:
				return value;
		}
	}

	function getConditionDescription(rule: any): string {
		const min = rule.minValue;
		const max = rule.maxValue;
		const type = rule.conditionType;

		if (min && max) {
			return `${min}-${max} ${type === 'students' ? 'students' : 'hours'}`;
		} else if (min) {
			return `${min}+ ${type === 'students' ? 'students' : 'hours'}`;
		} else if (max) {
			return `Up to ${max} ${type === 'students' ? 'students' : 'hours'}`;
		}
		return 'Any';
	}

	function isPromoActive(promo: any): boolean {
		if (!promo.isActive) return false;
		const now = new Date();
		if (promo.startDate && new Date(promo.startDate) > now) return false;
		if (promo.endDate && new Date(promo.endDate) < now) return false;
		if (promo.maxUses && promo.currentUses >= promo.maxUses) return false;
		return true;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<DollarSign class="h-5 w-5" />
			Pricing Rules for {lesson.title}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<Tabs.Root value="conditional">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="conditional">
					<Percent class="mr-2 h-4 w-4" />
					Conditional Pricing
				</Tabs.Trigger>
				<Tabs.Trigger value="promotional">
					<Tag class="mr-2 h-4 w-4" />
					Promotions
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Conditional Pricing Tab -->
			<Tabs.Content value="conditional" class="space-y-4 mt-4">
				<div class="flex justify-between items-center">
					<p class="text-sm text-muted-foreground">Group discounts, duration discounts</p>
					<Button size="sm" onclick={handleCreateConditional}>
						<Plus class="mr-2 h-4 w-4" />
						Add Rule
					</Button>
				</div>

				<div class="space-y-2">
					{#each conditionalRules as rule (rule.id)}
						<div class="rounded-lg border p-3">
							<div class="flex items-start justify-between">
								<div class="flex-1 space-y-1">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium">{getConditionDescription(rule)}</span>
										<Badge variant={rule.isActive ? 'default' : 'secondary'} class="text-xs">
											{rule.isActive ? 'Active' : 'Inactive'}
										</Badge>
									</div>
									<p class="text-sm text-muted-foreground">
										{getAdjustmentLabel(rule.adjustmentType, rule.adjustmentValue)} adjustment
									</p>
								</div>
								<div class="flex gap-1">
									<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => handleEditConditional(rule)}>
										<Pencil class="h-3 w-3" />
									</Button>
									<form method="POST" action="?/deleteConditional">
										<input type="hidden" name="ruleId" value={rule.id} />
										<Button type="submit" variant="ghost" size="icon" class="h-8 w-8">
											<Trash2 class="h-3 w-3" />
										</Button>
									</form>
								</div>
							</div>
						</div>
					{/each}

					{#if conditionalRules.length === 0}
						<div class="text-center py-8 text-sm text-muted-foreground">
							No conditional pricing rules. Add one to offer group or duration discounts.
						</div>
					{/if}
				</div>
			</Tabs.Content>

			<!-- Promotional Pricing Tab -->
			<Tabs.Content value="promotional" class="space-y-4 mt-4">
				<div class="flex justify-between items-center">
					<p class="text-sm text-muted-foreground">Promo codes, seasonal discounts</p>
					<Button size="sm" onclick={handleCreatePromo}>
						<Plus class="mr-2 h-4 w-4" />
						Add Promotion
					</Button>
				</div>

				<div class="space-y-2">
					{#each promos as promo (promo.id)}
						{@const active = isPromoActive(promo)}
						<div class="rounded-lg border p-3">
							<div class="flex items-start justify-between">
								<div class="flex-1 space-y-1">
									<div class="flex items-center gap-2">
										{#if promo.code}
											<span class="text-sm font-mono font-bold">{promo.code}</span>
										{:else}
											<span class="text-sm font-medium">Automatic Discount</span>
										{/if}
										<Badge variant={active ? 'default' : 'secondary'} class="text-xs">
											{active ? 'Active' : 'Inactive'}
										</Badge>
									</div>
									<p class="text-sm text-muted-foreground">
										-{getAdjustmentLabel(promo.discountType, promo.discountValue)} off
										{#if promo.maxUses}
											· {promo.currentUses}/{promo.maxUses} uses
										{/if}
									</p>
								</div>
								<div class="flex gap-1">
									<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => handleEditPromo(promo)}>
										<Pencil class="h-3 w-3" />
									</Button>
									<form method="POST" action="?/deletePromo">
										<input type="hidden" name="promoId" value={promo.id} />
										<Button type="submit" variant="ghost" size="icon" class="h-8 w-8">
											<Trash2 class="h-3 w-3" />
										</Button>
									</form>
								</div>
							</div>
						</div>
					{/each}

					{#if promos.length === 0}
						<div class="text-center py-8 text-sm text-muted-foreground">
							No promotions yet. Create promo codes or automatic discounts.
						</div>
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Card.Content>
</Card.Root>

<!-- Conditional Pricing Dialog -->
<Dialog.Root bind:open={isConditionalDialogOpen}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{selectedRule ? 'Edit' : 'Create'} Pricing Rule</Dialog.Title>
		</Dialog.Header>

		<form method="POST" action={selectedRule ? '?/updateConditional' : '?/createConditional'} class="space-y-4">
			{#if selectedRule}
				<input type="hidden" name="ruleId" value={selectedRule.id} />
			{/if}
			<input type="hidden" name="lessonId" value={lesson.id} />

			<div class="space-y-2">
				<Label>Condition Type</Label>
				<Select.Root name="conditionType" value={conditionalForm.conditionType}>
					<Select.Trigger>
						<Select.Value />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="students">Number of Students</Select.Item>
						<Select.Item value="duration">Duration (hours)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Min (optional)</Label>
					<Input name="minValue" type="number" placeholder="e.g., 2" bind:value={conditionalForm.minValue} />
				</div>
				<div class="space-y-2">
					<Label>Max (optional)</Label>
					<Input name="maxValue" type="number" placeholder="e.g., 10" bind:value={conditionalForm.maxValue} />
				</div>
			</div>

			<Separator />

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Adjustment Type</Label>
					<Select.Root name="adjustmentType" value={conditionalForm.adjustmentType}>
						<Select.Trigger>
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="percentage">Percentage</Select.Item>
							<Select.Item value="fixed_amount">Fixed Amount (€)</Select.Item>
							<Select.Item value="multiplier">Multiplier</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label>Value</Label>
					<Input 
						name="adjustmentValue" 
						type="number" 
						step="0.01"
						placeholder="-10"
						bind:value={conditionalForm.adjustmentValue}
						required 
					/>
				</div>
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<Switch name="isActive" bind:checked={conditionalForm.isActive} />
					<Label>Active</Label>
				</div>
				<input type="hidden" name="priority" value={conditionalForm.priority} />
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => isConditionalDialogOpen = false}>Cancel</Button>
				<Button type="submit">{selectedRule ? 'Update' : 'Create'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Promotional Pricing Dialog -->
<Dialog.Root bind:open={isPromoDialogOpen}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{selectedPromo ? 'Edit' : 'Create'} Promotion</Dialog.Title>
		</Dialog.Header>

		<form method="POST" action={selectedPromo ? '?/updatePromo' : '?/createPromo'} class="space-y-4">
			{#if selectedPromo}
				<input type="hidden" name="promoId" value={selectedPromo.id} />
			{/if}
			<input type="hidden" name="lessonId" value={lesson.id} />

			<div class="space-y-2">
				<Label>Promo Code (optional)</Label>
				<Input 
					name="code" 
					placeholder="WINTER2025"
					class="font-mono uppercase"
					bind:value={promoForm.code}
				/>
				<p class="text-xs text-muted-foreground">Leave empty for automatic discount</p>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Discount Type</Label>
					<Select.Root name="discountType" value={promoForm.discountType}>
						<Select.Trigger>
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="percentage">Percentage</Select.Item>
							<Select.Item value="fixed_amount">Fixed Amount (€)</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label>Value</Label>
					<Input 
						name="discountValue" 
						type="number" 
						step="0.01"
						placeholder="20"
						bind:value={promoForm.discountValue}
						required 
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Start Date</Label>
					<Input name="startDate" type="date" bind:value={promoForm.startDate} />
				</div>
				<div class="space-y-2">
					<Label>End Date</Label>
					<Input name="endDate" type="date" bind:value={promoForm.endDate} />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Max Uses</Label>
					<Input name="maxUses" type="number" placeholder="Unlimited" bind:value={promoForm.maxUses} />
				</div>
				<div class="space-y-2">
					<Label>Min Purchase (€)</Label>
					<Input 
						name="minPurchaseAmount" 
						type="number" 
						step="0.01"
						placeholder="No min"
						bind:value={promoForm.minPurchaseAmount}
					/>
				</div>
			</div>

			<div class="flex items-center space-x-2">
				<Switch name="isActive" bind:checked={promoForm.isActive} />
				<Label>Active</Label>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => isPromoDialogOpen = false}>Cancel</Button>
				<Button type="submit">{selectedPromo ? 'Update' : 'Create'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>