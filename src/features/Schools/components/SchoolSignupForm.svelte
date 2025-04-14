<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';
	import { schoolSignupSchema, type SchoolSignupSchema } from '../lib/validations/schoolSchemas';
	import { Textarea } from '$src/lib/components/ui/textarea';

	let { data }: { data: { form: SuperValidated<Infer<SchoolSignupSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(schoolSignupSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="name" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>School Name</Form.Label>
				<Input {...props} bind:value={$formData.name} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<div class="flex w-full flex-col gap-2 sm:flex-row">
		<Form.Field {form} name="phone" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Contact Phone</Form.Label>
					<Input {...props} value={$formData.phone} />
				{/snippet}
			</Form.Control>
			<Form.Description class="text-xs">E.g: (+44)6870979153.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Contact Email</Form.Label>
					<Input {...props} bind:value={$formData.email} type="email" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Field {form} name="bio" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>School Biography</Form.Label>
				<Textarea name="bio" bind:value={$formData.bio} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<!-- <Form.Field {form} name="acceptedTerms" class="mt-6 w-full">
		<Form.Control>
			{#snippet children({ props })}
				<div class="items-top flex space-x-2">
					<Checkbox {...props} bind:checked={$formData.acceptedTerms} required={true} />
					<div class="grid gap-1.5 leading-none">
						<Label
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Accept terms and conditions
						</Label>
						<p class="text-sm text-muted-foreground">
							You agree to our <a href="/terms-conditions">Terms of Service</a> and
							<a href="/privay-policy">Privacy Policy</a>.
						</p>
					</div>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field> -->

	<div class="mt-6 flex w-full flex-row items-center justify-center gap-2">
		<a href="/dashboard" class="text-sm {buttonVariants({ variant: 'outline' })}">Go back</a>
		<Form.Button>Submit</Form.Button>
	</div>
</form>
