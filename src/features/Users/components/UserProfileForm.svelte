<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { userProfileSchema, type UserProfileSchema } from '../lib/validations/userSchemas';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';

	let { data }: { data: { form: SuperValidated<Infer<UserProfileSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(userProfileSchema)
	});

	const { form: formData, enhance } = form;
</script>



<form method="POST" use:enhance>
	<div class="flex flex-col sm:flex-row gap-2 w-full">
		<Form.Field {form} name="name" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Name</Form.Label>
					<Input {...props} bind:value={$formData.name} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="lastName" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Last Name</Form.Label>
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
				<Form.Label>Phone (optional)</Form.Label>
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
					<Form.Label>Email</Form.Label>
					<Input {...props} bind:value={$formData.email} type="email" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	
    <div class="flex flex-row gap-2 items-center justify-center w-full mt-6">
        <Form.Button>Submit</Form.Button>
    </div>
</form>
