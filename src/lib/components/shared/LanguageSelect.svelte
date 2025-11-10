<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;

	// Common languages spoken in ski resorts
	const languages = [
		{ label: 'English', value: 'English' },
		{ label: 'French', value: 'French' },
		{ label: 'German', value: 'German' },
		{ label: 'Italian', value: 'Italian' },
		{ label: 'Spanish', value: 'Spanish' },
		{ label: 'Portuguese', value: 'Portuguese' },
		{ label: 'Dutch', value: 'Dutch' },
		{ label: 'Russian', value: 'Russian' },
		{ label: 'Polish', value: 'Polish' },
		{ label: 'Czech', value: 'Czech' },
		{ label: 'Swedish', value: 'Swedish' },
		{ label: 'Norwegian', value: 'Norwegian' },
		{ label: 'Danish', value: 'Danish' },
		{ label: 'Finnish', value: 'Finnish' },
		{ label: 'Japanese', value: 'Japanese' },
		{ label: 'Chinese', value: 'Chinese' },
		{ label: 'Korean', value: 'Korean' },
		{ label: 'Arabic', value: 'Arabic' }
	];

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name} class="h-full w-full">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label class="text-foreground">Filter by Language</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger class="h-full w-full" {...props}>
					{#if $formStore[name]}
						{languages.find((l) => l.value === $formStore[name])?.label}
					{:else}
						Select a language
					{/if}
				</Select.Trigger>
				<Select.Content class="text-foreground w-full max-h-[300px]">
					{#each languages as { label, value }}
						<Select.Item class="text-foreground w-full" {value} {label}>{label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
</Form.Field>
