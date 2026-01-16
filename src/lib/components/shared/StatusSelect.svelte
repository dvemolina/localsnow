<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { t } from '$lib/i18n/i18n';

	let {
		currentStatus = $bindable(),
		statuses,
		onStatusChange,
		disabled = false,
		isUpdating = false
	}: {
		currentStatus: string;
		statuses: Array<{ value: string; label: string }>;
		onStatusChange: (newStatus: string) => Promise<void>;
		disabled?: boolean;
		isUpdating?: boolean;
	} = $props();

	let selectedValue = $state(currentStatus);

	// Update selectedValue when currentStatus prop changes
	$effect(() => {
		selectedValue = currentStatus;
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
			{statuses.find((s) => s.value === selectedValue)?.label || selectedValue}
		{:else}
			Select status
		{/if}
	</Select.Trigger>
	<Select.Content>
		{#each statuses as status}
			<Select.Item value={status.value}>{status.label}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
