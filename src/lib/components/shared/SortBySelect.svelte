<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;

	const sortOptions = [
		{ label: 'Best Match', value: '' },
		{ label: 'Price: Low to High', value: 'price_asc' },
		{ label: 'Price: High to Low', value: 'price_desc' },
		{ label: 'Name: A-Z', value: 'name_asc' },
		{ label: 'Name: Z-A', value: 'name_desc' }
	];

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name} class="h-full w-full">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label class="text-foreground">Sort By</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger class="h-full w-full" {...props}>
					{#if $formStore[name]}
						{sortOptions.find((s) => s.value === $formStore[name])?.label}
					{:else}
						Best Match
					{/if}
				</Select.Trigger>
				<Select.Content class="text-foreground w-full">
					{#each sortOptions as { label, value }}
						<Select.Item class="text-foreground w-full" {value} {label}>{label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
</Form.Field>
