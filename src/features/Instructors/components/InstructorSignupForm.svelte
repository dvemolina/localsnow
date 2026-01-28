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
	import { onDestroy, onMount } from 'svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import InstructorTypeSelect from '$src/lib/components/shared/InstructorTypeSelect.svelte';
	import { route } from '$lib/i18n/routeHelpers';
	import { t } from '$lib/i18n/i18n';
	import ResortRequestModal from '$src/features/Resorts/components/ResortRequestModal.svelte';
	import { Button } from '$src/lib/components/ui/button';
	import { InfoCircled } from 'svelte-radix';
	import type { ResortRequest } from '$lib/server/db/schema';

	let { data }: {
		data: {
			form: SuperValidated<Infer<InstructorSignupSchema>>;
			pendingResortRequests?: ResortRequest[];
		}
	} = $props();

	const form = superForm(data.form, {
		validators: zodClient(instructorSignupSchema)
	});

	const { form: formData, enhance } = form;

	// Resort request state
	let showResortModal = $state(false);
	let resortRequestSubmitted = $state(false);
	let countries = $state([]);
	let regions = $state([]);

	// Load countries and regions for resort request modal
	onMount(async () => {
		const [countriesRes, regionsRes] = await Promise.all([
			fetch('/api/countries'),
			fetch('/api/regions')
		]);

		if (countriesRes.ok) countries = await countriesRes.json();
		if (regionsRes.ok) regions = await regionsRes.json();
	});

	function handleResortRequestSuccess() {
		resortRequestSubmitted = true;
		$formData.resort = 0; // Allow form submission with 0 resort
	}

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
	{#if resortRequestSubmitted || (data.pendingResortRequests && data.pendingResortRequests.some(r => r.status === 'pending'))}
		<div class="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
			<InfoCircled class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
			<div class="flex-1">
				<h3 class="font-semibold text-blue-900 dark:text-blue-100">{$t('resort_request_pending_title')}</h3>
				<p class="mt-1 text-sm text-blue-800 dark:text-blue-200">
					{$t('resort_request_pending_description')}
				</p>
			</div>
		</div>
	{/if}

	<div class="flex flex-col gap-2">
		<SearchResort {form} name="resort" />
		<p class="text-sm text-muted-foreground">
			{$t('resort_request_cant_find_text')}
			<Button variant="link" class="h-auto p-0 text-sm" onclick={() => (showResortModal = true)}>
				{$t('resort_request_add_button')}
			</Button>
			{#if resortRequestSubmitted}
				<span class="text-green-600">✓ {$t('resort_request_submitted')}</span>
			{/if}
		</p>
	</div>

	<InstructorTypeSelect {form} name="instructorType" />
	
	<Form.Field {form} name="profileImage" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$t('form_label_profile_image')}</Form.Label>
				<Form.Description class="text-xs"
					>{$t('form_description_profile_image')}</Form.Description
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
				<Form.Label>{$t('form_label_qualification')}</Form.Label>
				<Form.Description class="text-xs"
					>{$t('form_description_qualification')}</Form.Description
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
					<Form.Label>{$t('form_label_contact_phone')}</Form.Label>
					<Form.Description class="text-xs">
						{$t('form_description_contact_phone')}
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
				<Form.Label>{$t('form_label_biography')}</Form.Label>
				<Form.Description class="text-xs"
					>{$t('form_description_biography')}</Form.Description
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
					<Form.Label>{$t('form_label_base_price')}</Form.Label>
					<Input {...props} bind:value={$formData.basePrice} type="number" min="0" />
					<Form.Description class="text-xs"
						>{$t('form_description_base_price')}</Form.Description
					>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<CurrencySelect {form} name="currency" />
	</div>

	<div class="mt-6 flex w-full flex-row items-center justify-center gap-2">
		<a href={route('/dashboard')} class="text-sm {buttonVariants({ variant: 'outline' })}">{$t('button_go_back')}</a>
		<Form.Button type="submit">{$t('common_submit')}</Form.Button>
	</div>
</form>

<ResortRequestModal
	bind:open={showResortModal}
	{countries}
	{regions}
	onSuccess={handleResortRequestSuccess}
/>
