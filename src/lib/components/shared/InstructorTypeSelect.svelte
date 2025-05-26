<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;
	const sports = [
		{ label: 'School', value: 'instructor-school' },
		{ label: 'Independent', value: 'instructor-independent' },
	];

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field class="w-full" {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Instructor Type</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger {...props}>
					{$formStore[name] ? $formStore[name] : 'Select your type'}
				</Select.Trigger>
				<Select.Content>
					{#each sports as { label, value }}
						<Select.Item {value} {label} />
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
</Form.Field>
