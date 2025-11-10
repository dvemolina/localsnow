<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;
	let isFilter: boolean = props.isFilter ?? false; // If true, shows "All Types" option

	const instructorTypes = isFilter
		? [
			{ label: 'All Types', value: '' },
			{ label: 'Independent', value: 'instructor-independent' },
			{ label: 'School Instructor', value: 'instructor-school' }
		]
		: [
			{ label: 'School', value: 'instructor-school' },
			{ label: 'Independent', value: 'instructor-independent' }
		];

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field class="w-full" {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Instructor Type</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger {...props}>
					{#if $formStore[name] !== undefined && $formStore[name] !== null}
						{instructorTypes.find((s) => s.value === $formStore[name])?.label}
					{:else}
						{isFilter ? 'All Types' : 'Select your type'}
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each instructorTypes as { label, value }}
							<Select.Item {value} {label}>{label}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
</Form.Field>
