<script lang="ts">
	import SuperDebug, { type SuperValidated, type Infer, superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';
	import { schoolSignupSchema, type SchoolSignupSchema } from '../lib/validations/schoolSchemas';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import { onDestroy } from 'svelte';

	let { data }: { data: { form: SuperValidated<Infer<SchoolSignupSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(schoolSignupSchema)
	});

	const { form: formData, enhance } = form;

	//Logo Preview Logic
	//Creation of File Proxies with SuperForms
	const logoProxy = fileProxy(form, 'logo');

	let logoPreviewUrl: string | null = $state(null);

	onDestroy(() => {
		// This will automatically clean up blob URLs to avoid memory leaks
		if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
	});

	function handleLogoPreview(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			// Clean up old preview URL
			if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
			logoPreviewUrl = URL.createObjectURL(file);
		} else {
			if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
			logoPreviewUrl = null;
		}
	}
</script>

<form method="POST" use:enhance enctype="multipart/form-data" onsubmit={() => console.log('Submitting')}>
	<SearchResort {form} name="resort"/>
	<Form.Field {form} name="name" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>School Name</Form.Label>
				<Input {...props} bind:value={$formData.name} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="logo" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>School Logo Image</Form.Label>
				<Form.Description class="text-xs"
					>This image will appear in your School Card for clients to see.</Form.Description
				>
				<!-- File input -->
				<Input
					{...props}
					bind:files={$logoProxy}
					onchange={handleLogoPreview}
					type="file"
					accept="image"
				/>
				<!-- Image preview -->
				{#if logoPreviewUrl}
					<div
						class="mt-2 flex size-12 items-center justify-center overflow-hidden rounded-full border border-gray-300"
					>
						<img
							src={logoPreviewUrl}
							alt="Preview"
							class="h-full w-full object-cover object-top"
						/>
					</div>
				{/if}
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="schoolEmail" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>School Contact Email</Form.Label>
				<Form.Description class="text-xs">School Contact details for the Clients</Form.Description>
				<Input {...props} bind:value={$formData.schoolEmail} type="email" />
			{/snippet}
		</Form.Control>
		
		<Form.FieldErrors />
	</Form.Field>

	<div class="flex w-full flex-col gap-2 sm:flex-row">
		<CountryCodeSelect {form} name="countryCode" />
		<Form.Field {form} name="schoolPhone" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>School Contact Phone</Form.Label>
					<Input {...props} bind:value={$formData.schoolPhone} type="tel" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Field {form} name="bio" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>School Biography</Form.Label>
				<Form.Description class="text-xs">Short description of what sets you apart, services or packages you offer, your values/style and types of professionals you have.</Form.Description>
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
		<Form.Button type="submit">Submit</Form.Button>
	</div>
</form>

<SuperDebug data={$formData}/>
