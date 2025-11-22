<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { userLoginSchema, type UserLoginSchema } from '../lib/validations/userSchemas';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { route } from '$lib/i18n/routeHelpers';

	let { data }: { data: { form: SuperValidated<Infer<UserLoginSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(userLoginSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="email" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.form_label_email()}</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{m.form_label_password()}</Form.Label>
				<Input {...props} bind:value={$formData.password} type="password" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<div class="mt-6 flex w-full flex-row items-center justify-start gap-2">
		<Form.Button>{m.common_submit()}</Form.Button>
		<a href={route('/signup')} class="text-sm {buttonVariants({ variant: 'outline-solid' })}">
			{m.login_no_account()}</a
		>
	</div>
</form>
