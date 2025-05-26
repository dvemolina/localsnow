<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;
	const sports = [
		{ label: 'Ski', value: 'ski' },
		{ label: 'Snowboard', value: 'snowboard' },
		{ label: 'Telemark', value: 'telemark' }
	];
	let isHero: boolean = props.isHero ?? false;

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Sport</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger {...props}>
					{$formStore[name] ? $formStore[name] : 'Select a sport'}
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
