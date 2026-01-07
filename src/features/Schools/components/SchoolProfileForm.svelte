<script lang="ts">
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { Button } from '$src/lib/components/ui/button';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import * as Accordion from '$src/lib/components/ui/accordion';
	import { schoolProfileSchema, type SchoolProfileSchema } from '../lib/validations/schoolSchemas';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import { onDestroy } from 'svelte';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import { toast } from 'svelte-sonner';
	import { useIntlayer } from 'svelte-intlayer';

	let {
		schoolForm,
		currentLogoUrl
	}: {
		schoolForm: SuperValidated<Infer<SchoolProfileSchema>>;
		currentLogoUrl?: string | null;
	} = $props();

	const form = superForm(schoolForm, {
		validators: zodClient(schoolProfileSchema),
		dataType: 'json',
		onUpdate({ form }) {
			if (form.valid) {
				toast.success('School profile updated successfully');
			}
		},
		onError({ result }) {
			toast.error('Error updating school profile');
		}
	});

	const { form: formData, enhance, delayed } = form;

	// File Proxy
	const logoProxy = fileProxy(form, 'logo');

	// File Preview Logic
	let logoPreviewUrl: string | null = $state(null);

	// Computed value for displaying logo (preview or existing)
	const displayLogoUrl = $derived(logoPreviewUrl || currentLogoUrl || '/local-snow-head.png');

	onDestroy(() => {
		if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
	});

	function handleLogoPreview(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
			logoPreviewUrl = URL.createObjectURL(file);
		} else {
			if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
			logoPreviewUrl = null;
		}
	}
</script>

<form
	method="POST"
	action="?/schoolProfile"
	use:enhance
	enctype="multipart/form-data"
	class="space-y-6"
>
	<!-- Organized Sections using Accordion -->
	<Accordion.Root type="multiple" value={['basic', 'contact']}>
		<!-- Basic Information -->
		<Accordion.Item value="basic">
			<Accordion.Trigger class="text-base font-semibold">
				Basic Information
			</Accordion.Trigger>
			<Accordion.Content class="space-y-4 pt-4">
				<!-- School Logo -->
				<Form.Field {form} name="logo" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>School Logo</Form.Label>
							<Form.Description class="text-xs">
								Upload your school's logo. Recommended: Square image, at least 200x200px
							</Form.Description>

							<!-- Current/Preview Logo Display -->
							<div class="mb-3 flex items-center gap-3">
								<div class="size-24 overflow-hidden rounded-full border-2 border-border">
									<img
										src={displayLogoUrl}
										alt="School Logo"
										class="h-full w-full object-cover object-center"
									/>
								</div>
								<div class="flex flex-col gap-1">
									<p class="text-sm font-medium">
										{logoPreviewUrl ? 'New logo' : currentLogoUrl ? 'Current logo' : 'Default logo'}
									</p>
									<p class="text-xs text-muted-foreground">
										Upload to replace
									</p>
								</div>
							</div>

							<Input
								{...props}
								bind:files={$logoProxy}
								onchange={handleLogoPreview}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								disabled={$delayed}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- School Name -->
				<Form.Field {form} name="name" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>School Name <span class="text-red-500">*</span></Form.Label>
							<Input
								{...props}
								bind:value={$formData.name}
								disabled={$delayed}
								placeholder="Enter school name"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Biography -->
				<Form.Field {form} name="bio" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>About Your School</Form.Label>
							<Form.Description class="text-xs">
								Describe your school, facilities, teaching philosophy, and what makes you unique
							</Form.Description>
							<Textarea
								bind:value={$formData.bio}
								disabled={$delayed}
								placeholder="Tell potential students about your school..."
								rows={4}
								maxlength={1000}
							/>
							{#if $formData.bio}
								<p class="text-xs text-muted-foreground text-right">
									{$formData.bio.length}/1000 characters
								</p>
							{/if}
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Resort -->
				<SearchResort {form} name="resort" label="Primary Resort Location" />
			</Accordion.Content>
		</Accordion.Item>

		<!-- Contact Information -->
		<Accordion.Item value="contact">
			<Accordion.Trigger class="text-base font-semibold">
				Contact Information
			</Accordion.Trigger>
			<Accordion.Content class="space-y-4 pt-4">
				<!-- School Email -->
				<Form.Field {form} name="schoolEmail" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>School Email <span class="text-red-500">*</span></Form.Label>
							<Form.Description class="text-xs">
								Primary email for student inquiries and bookings
							</Form.Description>
							<Input
								{...props}
								bind:value={$formData.schoolEmail}
								type="email"
								disabled={$delayed}
								placeholder="contact@yourschool.com"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- School Phone -->
				<div class="flex w-full flex-col gap-4 sm:flex-row">
					<CountryCodeSelect {form} name="countryCode" />
					<Form.Field {form} name="schoolPhone" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>School Phone <span class="text-red-500">*</span></Form.Label>
								<Input
									{...props}
									bind:value={$formData.schoolPhone}
									type="tel"
									disabled={$delayed}
									placeholder="123 456 7890"
								/>
								<Form.Description class="text-xs">
									Main contact number for the school
								</Form.Description>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>

	<!-- Submit Button -->
	<div class="flex items-center justify-end gap-3 border-t pt-6">
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
				Save School Profile
			{/if}
		</Button>
	</div>
</form>
