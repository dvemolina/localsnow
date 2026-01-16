<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	let {
		currentStatus = $bindable(),
		statuses,
		onStatusChange,
		disabled = false,
		isUpdating = false
	}: {
		currentStatus: string;
		statuses: Array<{ value: string; label: string }> | (() => Array<{ value: string; label: string }>);
		onStatusChange: (newStatus: string) => Promise<void>;
		disabled?: boolean;
		isUpdating?: boolean;
	} = $props();

	let selectedValue = $state(currentStatus);
	let normalizedStatuses = $state<Array<{ value: string; label: string }>>([]);

	// Update selectedValue when currentStatus prop changes
	$effect(() => {
		selectedValue = currentStatus;
	});

	$effect(() => {
		let value: unknown = statuses;
		// Unwrap getter-style props until we reach a concrete value.
		while (typeof value === 'function') {
			value = (value as () => unknown)();
		}
		normalizedStatuses = Array.isArray(value) ? value : [];
	});

	async function handleChange(value: string | undefined) {
		if (value && value !== currentStatus) {
			selectedValue = value;
			await onStatusChange(value);
		}
	}
</script>

<Select.Root type="single" bind:value={selectedValue} onValueChange={handleChange}>
	<Select.Trigger class="w-[150px]" disabled={disabled || isUpdating}>
		{#if selectedValue}
			{normalizedStatuses.find((s) => s.value === selectedValue)?.label || selectedValue}
		{:else}
			Select status
		{/if}
	</Select.Trigger>
	<Select.Content>
		{#each normalizedStatuses as status}
			<Select.Item value={status.value}>{status.label}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
