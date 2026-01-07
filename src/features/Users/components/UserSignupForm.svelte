<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { userSignupSchema, type UserSignupSchema } from '../lib/validations/userSchemas';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';
	import { useIntlayer } from 'svelte-intlayer';
	import { route } from '$lib/i18n/routeHelpers';

	const formContent = useIntlayer('form');
	const common = useIntlayer('common');
	const login = useIntlayer('login');

	let { data }: { data: { form: SuperValidated<Infer<UserSignupSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(userSignupSchema)
	});

	const { form: formData, enhance } = form;
</script>



<form method="POST" use:enhance>
	<div class="flex flex-col sm:flex-row gap-2 w-full">
		<Form.Field {form} name="name" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$formContent.label_name.value}</Form.Label>
					<Input {...props} bind:value={$formData.name} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="lastName" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$formContent.label_last_name.value}</Form.Label>
					<Input {...props} bind:value={$formData.lastName} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<div class="flex flex-col sm:flex-row gap-2 w-full">
		<Form.Field {form} name="phone" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
				<Form.Label>{$formContent.label_phone_optional.value}</Form.Label>
				<Input {...props} value={$formData.phone} />
				{/snippet}
			</Form.Control>
			<Form.Description class="text-xs"
			>E.g: (+44)6870979153.</Form.Description
			>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$formContent.label_email.value}</Form.Label>
					<Input {...props} bind:value={$formData.email} type="email" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Field {form} name="password" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$formContent.label_password.value}</Form.Label>
				<Input {...props} bind:value={$formData.password} type="password" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="acceptedTerms" class="w-full mt-6">
		<Form.Control>
			{#snippet children({ props })}
				<div class="items-top flex space-x-2">
					<Checkbox {...props} bind:checked={$formData.acceptedTerms} required={true}/>
					<div class="grid gap-1.5 leading-none">
					  <Label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					  >
						Accept terms and conditions
					  </Label>
					  <p class="text-muted-foreground text-sm">
						You agree to our <a href="/terms-conditions">Terms of Service</a> and <a href="/privay-policy">Privacy Policy</a>.
					  </p>
					</div>
				  </div>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	
    <div class="flex flex-row gap-2 items-center justify-center w-full mt-6">
        <Form.Button>{$common.submit.value}</Form.Button>
        <a href={route('/login')} class="text-sm {buttonVariants({ variant: "outline-solid" })}">{$login.already_have_account.value}</a>
    </div>
</form>
