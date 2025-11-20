<script lang="ts">
	import SuperDebug, {
		type SuperValidated,
		type Infer,
		superForm,
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { lessonSchema, type LessonSchema } from '../lib/lessonSchema';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';


    let { lessonForm }: { lessonForm: SuperValidated<Infer<LessonSchema>> } = $props();

	const form = superForm(lessonForm, {
		validators: zodClient(lessonSchema)
	});

	const {  form: formData, enhance } = form;
	
</script>

<form
	method="POST"
	use:enhance
	enctype="multipart/form-data"
	class="flex flex-col gap-4"
	onsubmit={() => console.log('Submitting')}
>

	<SportsCheckboxes {form} name="sports" />
	<div class="flex w-full flex-col gap-2 sm:flex-row">
		<Form.Field {form} name="basePrice" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{m.form_label_base_price()}</Form.Label>

					<Input {...props} bind:value={$formData.basePrice} type="number" min="0" />
					<Form.Description class="text-xs"
						>{m.form_description_base_price()}</Form.Description
					>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<CurrencySelect {form} name="currency" />
	</div>


	<div class="mt-6 flex w-full flex-row items-center justify-center gap-2">
		<a href={localizeHref('/dashboard')} class="text-sm {buttonVariants({ variant: 'outline' })}">{m.button_go_back()}</a>
		<Form.Button type="submit">{m.common_submit()}</Form.Button>
	</div>
</form>

<SuperDebug data={$formData} />