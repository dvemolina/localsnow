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
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import { instructorProfileSchema, type InstructorProfileSchema } from '../lib/instructorSchemas';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import { onDestroy } from 'svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import InstructorTypeSelect from '$src/lib/components/shared/InstructorTypeSelect.svelte';

    let { instructorForm }: { instructorForm: SuperValidated<Infer<InstructorProfileSchema>> } = $props();

	const form = superForm(instructorForm, {
		validators: zodClient(instructorProfileSchema)
	});

	const {  form: formData, enhance } = form;

	//Creation of File Proxies with SuperForms
	const profileImageProxy = fileProxy(form, 'profileImage');
	const qualificationProxy = fileProxy(form, 'qualification');

	//File Preview Logic
	let profilePreviewUrl: string | null = $state(null);
	let qualificationPreviewUrl: string | null = $state(null);

	onDestroy(() => {
		// This will automatically clean up blob URLs to avoid memory leaks
		if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
	});

	function handleProfileImagePreview(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			// Clean up old preview URL
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
			// Clean up old preview URL
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
	use:enhance
	enctype="multipart/form-data"
	class="flex flex-col gap-4"
	onsubmit={() => console.log('Submitting')}
>
	<SearchResort {form} name="resort" />
	<InstructorTypeSelect {form} name="instructorType" />
	<Form.Field {form} name="profileImage" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Profesional Profile Image</Form.Label>
				<Form.Description class="text-xs"
					>This image will appear in your Instructor Card for clients to see.</Form.Description
				>
				<!-- File input -->
				<Input
					{...props}
					bind:files={$profileImageProxy}
					onchange={handleProfileImagePreview}
					type="file"
					accept="image"
				/>
				<!-- Image preview -->
				{#if profilePreviewUrl}
					<div
						class="mt-2 flex size-12 items-center justify-center overflow-hidden rounded-full border border-gray-300"
					>
						<img
							src={profilePreviewUrl}
							alt="Preview"
							class="h-full w-full object-cover object-top"
						/>
					</div>
				{/if}
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="qualification" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Qualification File</Form.Label>
				<Form.Description class="text-xs"
					>The qualification has to be in pdf format.</Form.Description
				>
				<Input
					{...props}
					bind:files={$qualificationProxy}
					onchange={handleQualificationPreview}
					type="file"
					accept="application/pdf"
				/>
				<!-- Qualification  preview -->
				{#if qualificationPreviewUrl}
					<div
						class="mt-2 flex size-12 items-center justify-center overflow-hidden rounded border border-gray-300"
					>
						<img src={qualificationPreviewUrl} alt="PDF" class="max-h-full max-w-full" />
					</div>
				{/if}
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<div class="flex w-full flex-col gap-2 sm:flex-row">
		<CountryCodeSelect {form} name="countryCode" />
		<Form.Field {form} name="phone" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Client Contact Phone</Form.Label>
					<Input {...props} bind:value={$formData.phone} type="tel" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Field {form} name="bio" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Biography</Form.Label>
				<Form.Description class="text-xs"
					>Short description of yourself and what you offer</Form.Description
				>
				<Textarea name="bio" bind:value={$formData.bio} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<SportsCheckboxes {form} name="sports" />

	<div class="mt-6 flex w-full flex-row items-center justify-center gap-2">
		<a href="/dashboard" class="text-sm {buttonVariants({ variant: 'outline' })}">Go back</a>
		<Form.Button type="submit">Submit</Form.Button>
	</div>
</form>

<SuperDebug data={$formData} />