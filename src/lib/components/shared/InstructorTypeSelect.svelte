<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as m from '$lib/paraglide/messages';

	let props = $props();

	let form = props.form;
	let name = props.name;
	let isFilter: boolean = props.isFilter ?? false; // If true, shows "All Types" option

	const instructorTypes = $derived(isFilter
		? [
			{ label: m.instructor_type_all(), value: '' },
			{ label: m.instructor_type_independent(), value: 'instructor-independent' },
			{ label: m.instructor_type_school_instructor(), value: 'instructor-school' }
		]
		: [
			{ label: m.instructor_type_school(), value: 'instructor-school' },
			{ label: m.instructor_type_independent(), value: 'instructor-independent' }
		]);

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field class="w-full" {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>{m.form_label_instructor_type()}</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger {...props}>
					{#if $formStore[name] !== undefined && $formStore[name] !== null}
						{instructorTypes.find((s) => s.value === $formStore[name])?.label}
					{:else}
						{isFilter ? m.instructor_type_all() : m.form_placeholder_select_instructor_type()}
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
