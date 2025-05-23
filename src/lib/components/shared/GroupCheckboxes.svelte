<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import * as Form from '$lib/components/ui/form';

	let props = $props();

	let form = props.form;
	let name = props.name;
	let options = props.options;
	let legend = props.legend;

  //In Superforms, the store is exposed as form.form, hence the need of the previous props syntax instead let {} = $props()
	const formStore = form.form; //the reactive store for form values

	function toggleItem(id: string) {
		const fieldData = ($formStore[name] as string[]) ?? [];

		if (fieldData.includes(id)) {
			$formStore[name] = fieldData.filter((i) => i !== id);
		} else {
			$formStore[name] = [...fieldData, id];
		}
	}
</script>

<Form.Fieldset {form} {name} class="space-y-0">
	<div class="mb-4">
		<Form.Legend class="text-base capitalize">{legend}</Form.Legend>
		<Form.Description>Select one or more options.</Form.Description>
	</div>

	<div class="space-y-2">
		{#each options as option (option.id)}
			{@const checked = $formStore[name]?.includes(option.id)}
			<div class="flex items-start space-x-3">
				<Form.Control>
					{#snippet children({ props })}
						<Checkbox
							{...props}
							{checked}
							value={option.id}
							onCheckedChange={() => toggleItem(option.id)}
						/>
						<Label class="font-normal">{option.label}</Label>
					{/snippet}
				</Form.Control>
			</div>
		{/each}
		<Form.FieldErrors />
	</div>
</Form.Fieldset>
