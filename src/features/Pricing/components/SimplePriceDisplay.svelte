<script lang="ts">
	import { Badge } from '$src/lib/components/ui/badge';

	let {
		price,
		currency,
		showFrom = true,
		variant = 'default'
	}: {
		price: number;
		currency: string;
		showFrom?: boolean;
		variant?: 'default' | 'compact' | 'card';
	} = $props();
</script>

{#if variant === 'compact'}
	<div class="flex items-baseline gap-1">
		{#if showFrom}<span class="text-xs text-muted-foreground">from</span>{/if}
		<span class="text-lg font-bold">{price}</span>
		<span class="text-xs text-muted-foreground">{currency}/hr</span>
	</div>
{:else if variant === 'card'}
	<div class="flex w-full items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
		<div class="flex flex-col">
			<span class="text-xs text-muted-foreground">{showFrom ? 'From' : 'Price'}</span>
			<div class="flex items-baseline gap-1">
				<span class="text-lg font-bold">{price}</span>
				<span class="text-xs text-muted-foreground">{currency}/hr</span>
			</div>
		</div>
		<Badge variant="secondary" class="text-xs">Base rate</Badge>
	</div>
{:else}
	<div class="flex items-baseline gap-2">
		{#if showFrom}<span class="text-sm text-muted-foreground">from</span>{/if}
		<span class="text-2xl font-bold text-primary">{price}</span>
		<span class="text-sm text-muted-foreground">{currency}/hour</span>
	</div>
{/if}