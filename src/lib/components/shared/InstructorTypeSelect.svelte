<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';
	import { useIntlayer } from 'svelte-intlayer';

	const instructor = useIntlayer('instructor');
	const form = useIntlayer('form');

	let props = $props();

	let form = props.form;
	let name = props.name;
	let isFilter: boolean = props.isFilter ?? false; // If true, shows "All Types" option

	const instructorTypes = $derived(isFilter
		? [
			{ label: $instructor.type_all.value, value: '' },
			{ label: $instructor.type_independent.value, value: 'instructor-independent' },
			{ label: $instructor.type_school_instructor.value, value: 'instructor-school' }
		]
		: [
			{ label: $instructor.type_school.value, value: 'instructor-school' },
			{ label: $instructor.type_independent.value, value: 'instructor-independent' }
		]);

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field class="w-full" {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>{$form.label_instructor_type.value}</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger {...props}>
					{#if $formStore[name] !== undefined && $formStore[name] !== null}
						{instructorTypes.find((s) => s.value === $formStore[name])?.label}
					{:else}
						{isFilter ? $instructor.type_all.value : $form.placeholder_select_instructor_type.value}
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
