<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Plus, Pencil, Trash2, Users, Clock, Tag } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let {
		lesson,
		groupTiers = [],
		durationPackages = [],
		promoCodes = []
	}: {
		lesson: any;
		groupTiers?: any[];
		durationPackages?: any[];
		promoCodes?: any[];
	} = $props();

	// Dialog states
	let isGroupTierDialogOpen = $state(false);
	let isDurationDialogOpen = $state(false);
	let isPromoDialogOpen = $state(false);

	// Selected items for editing
	let selectedTier = $state<any>(null);
	let selectedPackage = $state<any>(null);
	let selectedPromo = $state<any>(null);

	// Forms
	let groupTierForm = $state({
		minStudents: '',
		maxStudents: '',
		pricePerHour: ''
	});

	let durationForm = $state({
		name: '',
		hours: '',
		price: '',
		minStudents: '1',
		maxStudents: '6',
		description: ''
	});

	let promoForm = $state({
		code: '',
		discountPercent: '',
		validUntil: '',
		maxUses: ''
	});

	function resetGroupTierForm() {
		groupTierForm = { minStudents: '', maxStudents: '', pricePerHour: '' };
	}

	function resetDurationForm() {
		durationForm = { name: '', hours: '', price: '', minStudents: '1', maxStudents: '6', description: '' };
	}

	function resetPromoForm() {
		promoForm = { code: '', discountPercent: '', validUntil: '', maxUses: '' };
	}

	function handleCreateGroupTier() {
		resetGroupTierForm();
		selectedTier = null;
		isGroupTierDialogOpen = true;
	}

	function handleEditGroupTier(tier: any) {
		selectedTier = tier;
		groupTierForm = {
			minStudents: tier.minStudents.toString(),
			maxStudents: tier.maxStudents.toString(),
			pricePerHour: tier.pricePerHour.toString()
		};
		isGroupTierDialogOpen = true;
	}

	function handleCreateDuration() {
		resetDurationForm();
		selectedPackage = null;
		isDurationDialogOpen = true;
	}

	function handleEditDuration(pkg: any) {
		selectedPackage = pkg;
		durationForm = {
			name: pkg.name,
			hours: pkg.hours.toString(),
			price: pkg.price.toString(),
			minStudents: pkg.minStudents?.toString() || '1',
			maxStudents: pkg.maxStudents?.toString() || '6',
			description: pkg.description || ''
		};
		isDurationDialogOpen = true;
	}

	function handleCreatePromo() {
		resetPromoForm();
		selectedPromo = null;
		isPromoDialogOpen = true;
	}

	function handleEditPromo(promo: any) {
		selectedPromo = promo;
		promoForm = {
			code: promo.code,
			discountPercent: promo.discountPercent.toString(),
			validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().slice(0, 10) : '',
			maxUses: promo.maxUses?.toString() || ''
		};
		isPromoDialogOpen = true;
	}
</script>

<div class="space-y-6">

	<!-- Group Pricing Tiers -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						<Users class="h-5 w-5" />
						Group Pricing
					</Card.Title>
					<Card.Description>Discounts for larger groups (optional)</Card.Description>
				</div>
				<Button size="sm" onclick={handleCreateGroupTier}>
					<Plus class="mr-2 h-4 w-4" />
					Add Tier
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if groupTiers.length > 0}
				<div class="space-y-2">
					{#each groupTiers as tier}
						<div class="flex items-center justify-between rounded-lg border p-3">
							<div class="flex flex-col sm:flex-row items-center gap-4">
								<div class="flex items-center gap-2 text-sm">
									<Users class="h-4 w-4 text-muted-foreground" />
									<span class="font-medium">{tier.minStudents}-{tier.maxStudents} students</span>
								</div>
								<div class="flex items-baseline gap-1">
									<span class="text-lg font-bold">{tier.pricePerHour}</span>
									<span class="text-sm text-muted-foreground">{lesson.currency}/hr</span>
								</div>
								{#if lesson.basePrice && tier.pricePerHour < lesson.basePrice}
									<Badge variant="outline" class="text-xs bg-green-50 text-green-700 border-green-200">
										Save {Math.round(((lesson.basePrice - tier.pricePerHour) / lesson.basePrice) * 100)}%
									</Badge>
								{/if}
							</div>
							<div class="flex gap-1">
								<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => handleEditGroupTier(tier)}>
									<Pencil class="h-3 w-3" />
								</Button>
								<form method="POST" action="?/deleteGroupTier" use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											toast.success('Group tier deleted');
										} else {
											toast.error('Failed to delete');
										}
									};
								}}>
									<input type="hidden" name="tierId" value={tier.id} />
									<Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive">
										<Trash2 class="h-3 w-3" />
									</Button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center py-4 text-sm text-muted-foreground">
					No group pricing set. Add tiers to offer discounts for larger groups.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Duration Packages -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						<Clock class="h-5 w-5" />
						Duration Packages
					</Card.Title>
					<Card.Description>Half-day/full-day rates (optional)</Card.Description>
				</div>
				<Button size="sm" onclick={handleCreateDuration}>
					<Plus class="mr-2 h-4 w-4" />
					Add Package
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if durationPackages.length > 0}
				<div class="space-y-2">
					{#each durationPackages as pkg}
						<div class="flex items-center justify-between rounded-lg border p-3">
							<div>
								<div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
									<span class="font-medium">{pkg.name}</span>
									<Badge variant="outline" class="text-xs">{pkg.hours}h</Badge>
									{#if pkg.minStudents || pkg.maxStudents}
										<Badge variant="secondary" class="text-xs">
											{pkg.minStudents || 1}-{pkg.maxStudents || 6} students
										</Badge>
									{/if}
								</div>
								<div class="flex items-baseline gap-1">
									<span class="text-lg font-bold">{pkg.price}</span>
									<span class="text-sm text-muted-foreground">{lesson.currency}</span>
								</div>
								{#if pkg.description}
									<p class="text-xs text-muted-foreground mt-1">{pkg.description}</p>
								{/if}
								{#if lesson.basePrice}
									<p class="text-xs text-green-600 mt-1">
										Save {Math.round(((lesson.basePrice * Number(pkg.hours) - pkg.price) / (lesson.basePrice * Number(pkg.hours))) * 100)}% vs hourly rate
									</p>
								{/if}
							</div>
							<div class="flex gap-1">
								<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => handleEditDuration(pkg)}>
									<Pencil class="h-3 w-3" />
								</Button>
								<form method="POST" action="?/deleteDurationPackage" use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											toast.success('Package deleted');
										} else {
											toast.error('Failed to delete');
										}
									};
								}}>
									<input type="hidden" name="packageId" value={pkg.id} />
									<Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive">
										<Trash2 class="h-3 w-3" />
									</Button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center py-4 text-sm text-muted-foreground">
					No packages set. Add half-day or full-day packages if you offer them.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Promo Codes -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						<Tag class="h-5 w-5" />
						Promo Codes
					</Card.Title>
					<Card.Description>Discount codes for special offers (optional)</Card.Description>
				</div>
				<Button size="sm" onclick={handleCreatePromo}>
					<Plus class="mr-2 h-4 w-4" />
					Add Code
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if promoCodes.length > 0}
				<div class="space-y-2">
					{#each promoCodes as promo}
						<div class="flex items-center justify-between rounded-lg border p-3">
							<div>
								<div class="flex items-center gap-2 mb-1">
									<span class="font-mono font-bold text-sm">{promo.code}</span>
									<Badge variant="secondary" class="text-xs">{promo.discountPercent}% off</Badge>
								</div>
								<div class="flex items-center gap-3 text-xs text-muted-foreground">
									{#if promo.validUntil}
										<span>Valid until {new Date(promo.validUntil).toLocaleDateString()}</span>
									{/if}
									{#if promo.maxUses}
										<span>Max {promo.maxUses} uses ({promo.currentUses || 0} used)</span>
									{:else}
										<span>Unlimited uses ({promo.currentUses || 0} used)</span>
									{/if}
								</div>
							</div>
							<div class="flex gap-1">
								<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => handleEditPromo(promo)}>
									<Pencil class="h-3 w-3" />
								</Button>
								<form method="POST" action="?/deletePromoCode" use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											toast.success('Promo code deleted');
										} else {
											toast.error('Failed to delete');
										}
									};
								}}>
									<input type="hidden" name="promoId" value={promo.id} />
									<Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive">
										<Trash2 class="h-3 w-3" />
									</Button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center py-4 text-sm text-muted-foreground">
					No promo codes. Add codes to offer special discounts.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Group Tier Dialog -->
<Dialog.Root bind:open={isGroupTierDialogOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>{selectedTier ? 'Edit' : 'Add'} Group Pricing Tier</Dialog.Title>
			<Dialog.Description>
				Set a discounted hourly rate for groups of a specific size
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action={selectedTier ? '?/updateGroupTier' : '?/createGroupTier'} class="space-y-4" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(selectedTier ? 'Tier updated' : 'Tier created');
					isGroupTierDialogOpen = false;
					resetGroupTierForm();
					selectedTier = null;
				} else {
					toast.error('Operation failed');
				}
			};
		}}>
			{#if selectedTier}
				<input type="hidden" name="tierId" value={selectedTier.id} />
			{/if}
			<input type="hidden" name="lessonId" value={lesson.id} />

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Min Students</Label>
					<Input name="minStudents" type="number" min="1" bind:value={groupTierForm.minStudents} required />
				</div>
				<div class="space-y-2">
					<Label>Max Students</Label>
					<Input name="maxStudents" type="number" min="1" bind:value={groupTierForm.maxStudents} required />
				</div>
			</div>

			<div class="space-y-2">
				<Label>Price per Hour ({lesson.currency})</Label>
				<Input name="pricePerHour" type="number" min="0" bind:value={groupTierForm.pricePerHour} required />
				<p class="text-xs text-muted-foreground">
					Lower than base price ({lesson.basePrice}{lesson.currency}/hr) to offer a discount
				</p>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => {
					isGroupTierDialogOpen = false;
					resetGroupTierForm();
					selectedTier = null;
				}}>Cancel</Button>
				<Button type="submit">{selectedTier ? 'Update' : 'Create'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Duration Package Dialog -->
<Dialog.Root bind:open={isDurationDialogOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>{selectedPackage ? 'Edit' : 'Add'} Duration Package</Dialog.Title>
			<Dialog.Description>
				Set a fixed price for a specific duration and group size range
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action={selectedPackage ? '?/updateDurationPackage' : '?/createDurationPackage'} class="space-y-4" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(selectedPackage ? 'Package updated' : 'Package created');
					isDurationDialogOpen = false;
					resetDurationForm();
					selectedPackage = null;
				} else {
					toast.error('Operation failed');
				}
			};
		}}>
			{#if selectedPackage}
				<input type="hidden" name="packageId" value={selectedPackage.id} />
			{/if}
			<input type="hidden" name="lessonId" value={lesson.id} />

			<div class="space-y-2">
				<Label>Package Name</Label>
				<Input name="name" placeholder="e.g., Half Day, Full Day" bind:value={durationForm.name} required />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Hours</Label>
					<Input name="hours" type="number" min="1" step="0.5" bind:value={durationForm.hours} required />
				</div>
				<div class="space-y-2">
					<Label>Price ({lesson.currency})</Label>
					<Input name="price" type="number" min="0" bind:value={durationForm.price} required />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Min Students</Label>
					<Input name="minStudents" type="number" min="1" bind:value={durationForm.minStudents} required />
				</div>
				<div class="space-y-2">
					<Label>Max Students</Label>
					<Input name="maxStudents" type="number" min="1" bind:value={durationForm.maxStudents} required />
				</div>
			</div>

			<div class="space-y-2">
				<Label>Description (optional)</Label>
				<Input name="description" placeholder="e.g., 4 hours on the slopes" bind:value={durationForm.description} />
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => {
					isDurationDialogOpen = false;
					resetDurationForm();
					selectedPackage = null;
				}}>Cancel</Button>
				<Button type="submit">{selectedPackage ? 'Update' : 'Create'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Promo Code Dialog -->
<Dialog.Root bind:open={isPromoDialogOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>{selectedPromo ? 'Edit' : 'Add'} Promo Code</Dialog.Title>
			<Dialog.Description>
				Create a discount code for your clients
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action={selectedPromo ? '?/updatePromoCode' : '?/createPromoCode'} class="space-y-4" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success(selectedPromo ? 'Promo code updated' : 'Promo code created');
					isPromoDialogOpen = false;
					resetPromoForm();
					selectedPromo = null;
				} else {
					toast.error('Operation failed');
				}
			};
		}}>
			{#if selectedPromo}
				<input type="hidden" name="promoId" value={selectedPromo.id} />
			{/if}
			<input type="hidden" name="lessonId" value={lesson.id} />

			<div class="space-y-2">
				<Label>Promo Code</Label>
				<Input 
					name="code" 
					placeholder="WINTER2025" 
					class="font-mono uppercase"
					bind:value={promoForm.code}
					disabled={!!selectedPromo}
					required 
				/>
			</div>

			<div class="space-y-2">
				<Label>Discount Percentage</Label>
				<Input name="discountPercent" type="number" min="1" max="100" bind:value={promoForm.discountPercent} required />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Valid Until (optional)</Label>
					<Input name="validUntil" type="date" bind:value={promoForm.validUntil} />
				</div>
				<div class="space-y-2">
					<Label>Max Uses (optional)</Label>
					<Input name="maxUses" type="number" min="1" bind:value={promoForm.maxUses} />
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => {
					isPromoDialogOpen = false;
					resetPromoForm();
					selectedPromo = null;
				}}>Cancel</Button>
				<Button type="submit">{selectedPromo ? 'Update' : 'Create'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>