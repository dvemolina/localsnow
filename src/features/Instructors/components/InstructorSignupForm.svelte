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
	import { instructorSignupSchema, type InstructorSignupSchema } from '../lib/instructorSchemas';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import LanguageCheckboxes from '$src/lib/components/shared/LanguageCheckboxes.svelte';
	import { onDestroy } from 'svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import InstructorTypeSelect from '$src/lib/components/shared/InstructorTypeSelect.svelte';
	import { route } from '$lib/i18n/routeHelpers';
	import { useIntlayer } from 'svelte-intlayer';

	const formContent = useIntlayer('form');
	const button = useIntlayer('button');
	const common = useIntlayer('common');

	let { data }: { data: { form: SuperValidated<Infer<InstructorSignupSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(instructorSignupSchema)
	});

	const { form: formData, enhance } = form;

	//Creation of File Proxies with SuperForms
	const profileImageProxy = fileProxy(form, 'profileImage');
	const qualificationProxy = fileProxy(form, 'qualification');

	//File Preview Logic
	let profilePreviewUrl: string | null = $state(null);
	let qualificationPreviewUrl: string | null = $state(null);

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
				<Form.Label>{$formContent.label_profile_image.value}</Form.Label>
				<Form.Description class="text-xs"
					>{$formContent.description_profile_image.value}</Form.Description
				>
				<Input
					{...props}
					bind:files={$profileImageProxy}
					onchange={handleProfileImagePreview}
					type="file"
					accept="image"
				/>
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
				<Form.Label>{$formContent.label_qualification.value}</Form.Label>
				<Form.Description class="text-xs"
					>{$formContent.description_qualification.value}</Form.Description
				>
				<Input
					{...props}
					bind:files={$qualificationProxy}
					onchange={handleQualificationPreview}
					type="file"
					accept="application/pdf"
				/>
				{#if qualificationPreviewUrl}
					<div
						class="mt-2 flex size-12 items-center justify-center overflow-hidden rounded border border-gray-300"
					>
						<svg class="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
							<path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
						</svg>
					</div>
				{/if}
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<div class="flex w-full flex-col gap-2 sm:flex-row">
		<CountryCodeSelect {form} name="professionalCountryCode" />
		<Form.Field {form} name="professionalPhone" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$formContent.label_contact_phone.value}</Form.Label>
					<Form.Description class="text-xs">
						{$formContent.description_contact_phone.value}
					</Form.Description>
					<Input {...props} bind:value={$formData.professionalPhone} type="tel" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Field {form} name="bio" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$formContent.label_biography.value}</Form.Label>
				<Form.Description class="text-xs"
					>{$formContent.description_biography.value}</Form.Description
				>
				<Textarea name="bio" bind:value={$formData.bio} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<SportsCheckboxes {form} name="sports" />

	<LanguageCheckboxes {form} name="spokenLanguages" />

	<div class="flex w-full flex-col gap-2 sm:flex-row">
		<Form.Field {form} name="basePrice" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$formContent.label_base_price.value}</Form.Label>
					<Input {...props} bind:value={$formData.basePrice} type="number" min="0" />
					<Form.Description class="text-xs"
						>{$formContent.description_base_price.value}</Form.Description
					>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<CurrencySelect {form} name="currency" />
	</div>

	<div class="mt-6 flex w-full flex-row items-center justify-center gap-2">
		<a href={route('/dashboard')} class="text-sm {buttonVariants({ variant: 'outline' })}">{$button.go_back.value}</a>
		<Form.Button type="submit">{$common.submit.value}</Form.Button>
	</div>
</form>

<SuperDebug data={$formData} />