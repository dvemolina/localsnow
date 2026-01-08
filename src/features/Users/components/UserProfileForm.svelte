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
	import { t } from '$lib/i18n/i18n';
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
					<Form.Label>{$t('form_label_first_name')} <span class="text-red-500">*</span></Form.Label>
					<Input
						{...props}
						bind:value={$formData.name}
						disabled={$delayed}
						placeholder={$t('form_placeholder_first_name')}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="lastName" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('form_label_last_name')} <span class="text-red-500">*</span></Form.Label>
					<Input
						{...props}
						bind:value={$formData.lastName}
						disabled={$delayed}
						placeholder={$t('form_placeholder_last_name')}
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
				<Form.Label>{$t('form_label_email_address')} <span class="text-red-500">*</span></Form.Label>
				<Input
					{...props}
					bind:value={$formData.email}
					type="email"
					disabled={$delayed}
					placeholder={$t('form_placeholder_email')}
				/>
				<Form.Description class="text-xs">
					{$t('form_help_email')}
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
					<Form.Label>{$t('form_label_phone_number')}</Form.Label>
					<Input
						{...props}
						bind:value={$formData.phone}
						type="tel"
						disabled={$delayed}
						placeholder={$t('form_placeholder_phone')}
					/>
					<Form.Description class="text-xs">
						{$t('form_help_phone')}
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
					{$t('button_saving')}
				</span>
			{:else}
				{$edit.button_save_changes.value}
			{/if}
		</Button>
	</div>
</form>
