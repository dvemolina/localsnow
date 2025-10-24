<!-- src/features/Users/components/UserProfileForm.svelte -->
<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { userProfileSchema, type UserProfileSchema } from '../lib/validations/userSchemas';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { Button } from '$src/lib/components/ui/button';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import { toast } from 'svelte-sonner';

	let { userForm }: { userForm: SuperValidated<Infer<UserProfileSchema>> } = $props();

	const form = superForm(userForm, {
		validators: zodClient(userProfileSchema),
		dataType: 'json',
		onUpdate({ form }) {
			if (form.valid) {
				toast.success('Profile updated successfully!');
			}
		},
		onError({ result }) {
			toast.error('Failed to update profile. Please try again.');
		}
	});

	const { form: formData, enhance, delayed } = form;
</script>

<form method="POST" action="?/userProfile" use:enhance class="space-y-6">
	<!-- Name Fields -->
	<div class="grid gap-4 sm:grid-cols-2">
		<Form.Field {form} name="name" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>First Name <span class="text-red-500">*</span></Form.Label>
					<Input 
						{...props} 
						bind:value={$formData.name} 
						disabled={$delayed}
						placeholder="John"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="lastName" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Last Name <span class="text-red-500">*</span></Form.Label>
					<Input 
						{...props} 
						bind:value={$formData.lastName} 
						disabled={$delayed}
						placeholder="Doe"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- Email Field -->
	<Form.Field {form} name="email" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email Address <span class="text-red-500">*</span></Form.Label>
				<Input 
					{...props} 
					bind:value={$formData.email} 
					type="email" 
					disabled={$delayed}
					placeholder="john.doe@example.com"
				/>
				<Form.Description class="text-xs">
					This email will be used for account notifications
				</Form.Description>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Phone Field with Country Code -->
	<div class="flex w-full flex-col gap-4 sm:flex-row">
		<CountryCodeSelect {form} name="countryCode" />
		<Form.Field {form} name="phone" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Phone Number</Form.Label>
					<Input 
						{...props} 
						bind:value={$formData.phone} 
						type="tel" 
						disabled={$delayed}
						placeholder="123 456 7890"
					/>
					<Form.Description class="text-xs">
						Your personal contact number
					</Form.Description>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- Submit Button -->
	<div class="flex items-center justify-end gap-3 pt-4">
		<Button type="submit" disabled={$delayed}>
			{#if $delayed}
				<span class="flex items-center gap-2">
					<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Saving...
				</span>
			{:else}
				Save Changes
			{/if}
		</Button>
	</div>
</form>