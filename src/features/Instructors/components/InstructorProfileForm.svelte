<script lang="ts">
	import SuperDebug, {
		type SuperValidated,
		type Infer,
		superForm,
		fileProxy
	} from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { Button } from '$src/lib/components/ui/button';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import * as Accordion from '$src/lib/components/ui/accordion';
	import { instructorProfileSchema, type InstructorProfileSchema } from '../lib/instructorSchemas';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import LanguageCheckboxes from '$src/lib/components/shared/LanguageCheckboxes.svelte';
	import { onDestroy, onMount } from 'svelte';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import { toast } from 'svelte-sonner';
	import { useIntlayer } from 'svelte-intlayer';

	const toast = useIntlayer('toast');
	const instructor = useIntlayer('instructor');
	const formContent = useIntlayer('form');
	const button = useIntlayer('button');

	let {
		instructorForm,
		currentProfileImageUrl
	}: {
		instructorForm: SuperValidated<Infer<InstructorProfileSchema>>;
		currentProfileImageUrl?: string | null;
	} = $props();

	const form = superForm(instructorForm, {
		validators: zodClient(instructorProfileSchema),
		dataType: 'json',
		onUpdate({ form }) {
			if (form.valid) {
				toast.success($toast.instructor_profile_updated.value);
			}
		},
		onError({ result }) {
			toast.error($toast.instructor_profile_error.value);
		}
	});

	const { form: formData, enhance, delayed } = form;

	// File Proxies
	const profileImageProxy = fileProxy(form, 'profileImage');
	const qualificationProxy = fileProxy(form, 'qualification');

	// File Preview Logic
	let profilePreviewUrl: string | null = $state(null);
	let qualificationPreviewUrl: string | null = $state(null);

	// Computed value for displaying image (preview or existing)
	const displayImageUrl = $derived(profilePreviewUrl || currentProfileImageUrl || '/local-snow-head.png');

	onDestroy(() => {
		if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
		if (qualificationPreviewUrl) URL.revokeObjectURL(qualificationPreviewUrl);
	});

	function handleProfileImagePreview(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
			profilePreviewUrl = URL.createObjectURL(file);
		} else {
			if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
			profilePreviewUrl = null;
		}
	}

	function handleQualificationPreview(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			if (qualificationPreviewUrl) URL.revokeObjectURL(qualificationPreviewUrl);
			qualificationPreviewUrl = URL.createObjectURL(file);
		} else {
			if (qualificationPreviewUrl) URL.revokeObjectURL(qualificationPreviewUrl);
			qualificationPreviewUrl = null;
		}
	}
</script>

<form
	method="POST"
	action="?/instructorProfile"
	use:enhance
	enctype="multipart/form-data"
	class="space-y-6"
>
	<!-- Organized Sections using Accordion -->
	<Accordion.Root type="multiple" value={['basic', 'location', 'credentials']}>
		<!-- Basic Information -->
		<Accordion.Item value="basic">
			<Accordion.Trigger class="text-base font-semibold">
				{$instructor.form_basic_info.value}
			</Accordion.Trigger>
			<Accordion.Content class="space-y-4 pt-4">
				<!-- Profile Image -->
				<Form.Field {form} name="profileImage" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{$instructor.form_profile_image.value}</Form.Label>
							<Form.Description class="text-xs">
								{$instructor.form_profile_image_desc.value}
							</Form.Description>

							<!-- Current/Preview Image Display -->
							<div class="mb-3 flex items-center gap-3">
								<div class="size-24 overflow-hidden rounded-full border-2 border-border">
									<img
										src={displayImageUrl}
										alt="Profile"
										class="h-full w-full object-cover object-center"
									/>
								</div>
								<div class="flex flex-col gap-1">
									<p class="text-sm font-medium">
										{profilePreviewUrl ? $instructor.form_new_image.value : currentProfileImageUrl ? $instructor.form_current_image.value : $instructor.form_default_image.value}
									</p>
									<p class="text-xs text-muted-foreground">
										{$instructor.form_upload_to_replace.value}
									</p>
								</div>
							</div>

							<Input
								{...props}
								bind:files={$profileImageProxy}
								onchange={handleProfileImagePreview}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								disabled={$delayed}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Biography -->
				<Form.Field {form} name="bio" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{$instructors.form_label_bio.value}</Form.Label>
							<Form.Description class="text-xs">
								{$instructor.form_bio_desc.value}
							</Form.Description>
							<Textarea
								bind:value={$formData.bio}
								disabled={$delayed}
								placeholder={$instructor.form_bio_placeholder.value}
								rows={4}
								maxlength={500}
							/>
							{#if $formData.bio}
								<p class="text-xs text-muted-foreground text-right">
									{$formData.bio.length}/500 {$formContent.characters.value}
								</p>
							{/if}
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</Accordion.Content>
		</Accordion.Item>

		<!-- Location & Teaching Details -->
		<Accordion.Item value="location">
			<Accordion.Trigger class="text-base font-semibold">
				{$instructor.form_location_details.value}
			</Accordion.Trigger>
			<Accordion.Content class="space-y-4 pt-4">
				<!-- Resort -->
				<SearchResort {form} name="resort" label={$instructor.form_primary_resort.value} />

				<!-- Sports -->
				<SportsCheckboxes {form} name="sports" />

				<!-- Languages -->
				<LanguageCheckboxes {form} name="spokenLanguages" />
			</Accordion.Content>
		</Accordion.Item>

		<!-- Credentials & Verification -->
		<Accordion.Item value="credentials">
			<Accordion.Trigger class="text-base font-semibold">
				{$instructor.form_credentials.value}
			</Accordion.Trigger>
			<Accordion.Content class="space-y-4 pt-4">
				<!-- Qualification Upload -->
				<Form.Field {form} name="qualification" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{$instructor.form_qualification.value}</Form.Label>
							<Form.Description class="text-xs">
								{$instructor.form_qualification_desc.value}
							</Form.Description>
							<Input
								{...props}
								bind:files={$qualificationProxy}
								onchange={handleQualificationPreview}
								type="file"
								accept="application/pdf"
								disabled={$delayed}
							/>
							{#if qualificationPreviewUrl}
								<div class="mt-2 flex items-center gap-2 rounded-md border border-border p-2">
									<svg class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
									</svg>
									<span class="text-sm">{$instructor.form_new_pdf.value}</span>
								</div>
							{/if}
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Professional Contact Information -->
				<div class="flex w-full flex-col gap-4 sm:flex-row">
					<CountryCodeSelect {form} name="professionalCountryCode" />
					<Form.Field {form} name="professionalPhone" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{$instructors.form_label_professional_phone.value} <span class="text-red-500">*</span></Form.Label>
								<Input
									{...props}
									bind:value={$formData.professionalPhone}
									type="tel"
									disabled={$delayed}
									placeholder="123 456 7890"
								/>
								<Form.Description class="text-xs">
									{$instructor.form_phone_desc.value}
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
					{$button.saving.value}
				</span>
			{:else}
				{$button.save_instructor_profile.value}
			{/if}
		</Button>
	</div>
</form>