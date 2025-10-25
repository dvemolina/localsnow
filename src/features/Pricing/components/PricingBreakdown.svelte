<script lang="ts">
	import * as Card from '$src/lib/components/ui/card';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Separator } from '$src/lib/components/ui/separator';

	let {
		breakdown,
		showDetails = true
	}: {
		breakdown: {
			basePrice: number;
			currency: string;
			conditionalAdjustments: Array<{
				type: string;
				description: string;
				amount: number;
			}>;
			promotionalDiscount: {
				code?: string;
				description: string;
				amount: number;
			} | null;
			subtotal: number;
			finalPrice: number;
			pricePerStudent?: number;
		};
		showDetails?: boolean;
	} = $props();

	const hasAdjustments = breakdown.conditionalAdjustments.length > 0 || breakdown.promotionalDiscount !== null;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center justify-between">
			<span>Pricing</span>
			{#if breakdown.pricePerStudent}
				<Badge variant="secondary">{breakdown.pricePerStudent}{breakdown.currency} per person</Badge>
			{/if}
		</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		<!-- Final Price Display -->
		<div class="flex items-baseline justify-between">
			<span class="text-lg font-medium">Total Price</span>
			<div class="flex items-baseline gap-1">
				<span class="text-3xl font-bold text-primary">{breakdown.finalPrice}</span>
				<span class="text-lg text-muted-foreground">{breakdown.currency}</span>
			</div>
		</div>

		{#if showDetails && hasAdjustments}
			<Separator />

			<!-- Pricing Breakdown -->
			<div class="space-y-3 text-sm">
				<div class="flex justify-between text-muted-foreground">
					<span>Base price</span>
					<span>{breakdown.basePrice}{breakdown.currency}</span>
				</div>

				{#each breakdown.conditionalAdjustments as adjustment}
					<div class="flex justify-between {adjustment.amount < 0 ? 'text-green-600' : 'text-muted-foreground'}">
						<span class="text-xs">{adjustment.description}</span>
						<span>{adjustment.amount > 0 ? '+' : ''}{adjustment.amount}{breakdown.currency}</span>
					</div>
				{/each}

				{#if breakdown.subtotal !== breakdown.basePrice}
					<div class="flex justify-between font-medium">
						<span>Subtotal</span>
						<span>{breakdown.subtotal}{breakdown.currency}</span>
					</div>
				{/if}

				{#if breakdown.promotionalDiscount}
					<div class="flex justify-between text-green-600">
						<span class="text-xs">{breakdown.promotionalDiscount.description}</span>
						<span>{breakdown.promotionalDiscount.amount}{breakdown.currency}</span>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Info note -->
		<div class="rounded-md bg-muted p-3 text-xs text-muted-foreground">
			<p>💡 This is an estimated price. Final pricing will be confirmed when you book.</p>
		</div>
	</Card.Content>
</Card.Root>