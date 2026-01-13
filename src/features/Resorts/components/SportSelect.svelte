<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';
	import { t } from '$lib/i18n/i18n';
	let props = $props();

	let form = props.form;
	let name = props.name;

	// Use $derived for reactive translations
	const sports = $derived([
		{ label: $t('sports_ski'), value: 'ski' },
		{ label: $t('sports_snowboard'), value: 'snowboard' },
		{ label: $t('sports_telemark'), value: 'telemark' }
	]);
	let isHero: boolean = props.isHero ?? false;

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name} class="h-ful w-full">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label class="text-foreground">{$t('filter_choose_sport')}</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger class="h-full w-full {isHero ? 'py-[23px]' : ''}" {...props}>
					{#if $formStore[name]}
						{sports.find((s) => s.value === $formStore[name])?.label}
					{:else}
						{$t('filter_select_sport')}
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
