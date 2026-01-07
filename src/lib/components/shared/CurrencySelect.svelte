<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Form from '$lib/components/ui/form';
	import { useIntlayer } from 'svelte-intlayer';

	const formContent = useIntlayer('form');

	let props = $props();

	let form = props.form;
	let name = props.name;
	const currencies = [
		{ label: 'Euro', value: 'EUR' }, // Alps (Austria, France, Italy, Germany, Andorra, Slovenia, Spain)
		{ label: 'Swiss Franc', value: 'CHF' }, // Switzerland
		{ label: 'Norwegian Krone', value: 'NOK' }, // Norway
		{ label: 'Swedish Krona', value: 'SEK' }, // Sweden
		{ label: 'Czech Koruna', value: 'CZK' }, // Czech Republic
		{ label: 'Polish Zloty', value: 'PLN' }, // Poland
		{ label: 'Bulgarian Lev', value: 'BGN' }, // Bulgaria
		{ label: 'Japanese Yen', value: 'JPY' }, // Japan
		{ label: 'South Korean Won', value: 'KRW' }, // South Korea
		{ label: 'Chinese Yuan', value: 'CNY' }, // China (e.g. Yabuli)
		{ label: 'Canadian Dollar', value: 'CAD' }, // Canada (Whistler, Banff)
		{ label: 'United States Dollar', value: 'USD' }, // USA (Colorado, Utah, California)
		{ label: 'New Zealand Dollar', value: 'NZD' }, // New Zealand (Queenstown, Wanaka)
		{ label: 'Australian Dollar', value: 'AUD' }, // Australia (Perisher, Thredbo)
		{ label: 'Chilean Peso', value: 'CLP' }, // Chile (Portillo, Valle Nevado)
		{ label: 'Argentine Peso', value: 'ARS' } // Argentina (Bariloche, Las Leñas)
	];

	const formStore = form.form; //the reactive store for form values
</script>

<Form.Field {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>{$formContent.label_currency.value}</Form.Label>
			<Select.Root type="single" bind:value={$formStore[name]} name={props.name}>
				<Select.Trigger {...props}>
					{$formStore[name] ? $formStore[name] : $formContent.placeholder_select_currency.value}
				</Select.Trigger>
				<Select.Content>
					{#each currencies as { label, value }}
						<Select.Item {value} {label} />
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
</Form.Field>
