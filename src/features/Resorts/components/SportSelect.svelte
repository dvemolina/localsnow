<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;
	let useIds: boolean = props.useIds ?? false; // Use sport IDs (numbers) instead of slugs (strings)

	const sports = useIds
		? [
				{ label: 'Ski', value: 1 },
				{ label: 'Snowboard', value: 2 },
				{ label: 'Telemark', value: 3 }
			]
		: [
				{ label: 'Ski', value: 'ski' },
				{ label: 'Snowboard', value: 'snowboard' },
				{ label: 'Telemark', value: 'telemark' }
			];
	let isHero: boolean = props.isHero ?? false;

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name} class="h-ful w-full">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label class="text-foreground">Choose Sport</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger class="h-full w-full {isHero ? 'py-[23px]' : ''}" {...props}>
					{#if $formStore[name]}
						{sports.find((s) => s.value === $formStore[name])?.label}
					{:else}
						Select a sport
					{/if}
				</Select.Trigger>
				<Select.Content class="text-foreground w-full">
					{#each sports as { label, value }}
						<Select.Item class="text-foreground w-full" {value} {label}>{label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
</Form.Field>
