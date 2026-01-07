<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';
	import { useIntlayer } from 'svelte-intlayer';

	const sports = useIntlayer('sports');
	const filter = useIntlayer('filter');

	let props = $props();

	let form = props.form;
	let name = props.name;

	// Use $derived for reactive translations
	const sports = $derived([
		{ label: $sports.ski.value, value: 'ski' },
		{ label: $sports.snowboard.value, value: 'snowboard' },
		{ label: $sports.telemark.value, value: 'telemark' }
	]);
	let isHero: boolean = props.isHero ?? false;

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name} class="h-ful w-full">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label class="text-foreground">{$filter.choose_sport.value}</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger class="h-full w-full {isHero ? 'py-[23px]' : ''}" {...props}>
					{#if $formStore[name]}
						{sports.find((s) => s.value === $formStore[name])?.label}
					{:else}
						{$filter.select_sport.value}
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
