<script lang="ts">
	import * as Form from '$src/lib/components/ui/form';
	import { Button } from '$src/lib/components/ui/button';
	import { Input } from '$src/lib/components/ui/input';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import * as Select from '$src/lib/components/ui/select';
	import { t } from '$lib/i18n/i18n';
	import type { Country, Region } from '$lib/server/db/schema';

	let {
		form,
		countries,
		regions,
		onCancel,
		isSubmitting = false
	}: {
		form: any;
		countries: Country[];
		regions: Region[];
		onCancel?: () => void;
		isSubmitting?: boolean;
	} = $props();

	const { form: formData } = form;

	// Filter regions by selected country
	const filteredRegions = $derived(
		$formData.countryId
			? regions.filter((r) => r.countryId === $formData.countryId)
			: []
	);

	// Get selected country for display
	const selectedCountry = $derived(
		$formData.countryId ? countries.find((c) => c.id === $formData.countryId) : undefined
	);

	// Get selected region for display
	const selectedRegion = $derived(
		$formData.regionId ? filteredRegions.find((r) => r.id === $formData.regionId) : undefined
	);
</script>

<div class="space-y-4">
	<!-- Resort Name -->
	<Form.Field {form} name="resortName">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$t('resort_request_form_name_label')}</Form.Label>
				<Input
					{...props}
					type="text"
					placeholder={$t('resort_request_form_name_placeholder')}
					bind:value={$formData.resortName}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Country -->
	<Form.Field {form} name="countryId">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$t('resort_request_form_country_label')}</Form.Label>
				<Select.Root
					selected={selectedCountry
						? { value: selectedCountry.id, label: selectedCountry.country }
						: undefined}
					onSelectedChange={(s) => {
						if (s) {
							$formData.countryId = s.value;
							// Reset region when country changes
							$formData.regionId = null;
						}
					}}
				>
					<Select.Trigger {...props} class="w-full">
						<Select.Value placeholder={$t('resort_request_form_country_placeholder')} />
					</Select.Trigger>
					<Select.Content>
						{#each countries as country}
							<Select.Item value={country.id} label={country.country}>
								{country.country}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<input type="hidden" name="countryId" bind:value={$formData.countryId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Region (Optional) -->
	{#if filteredRegions.length > 0}
		<Form.Field {form} name="regionId">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('resort_request_form_region_label')}</Form.Label>
					<Select.Root
						selected={selectedRegion
							? { value: selectedRegion.id, label: selectedRegion.region }
							: undefined}
						onSelectedChange={(s) => {
							$formData.regionId = s ? s.value : null;
						}}
					>
						<Select.Trigger {...props} class="w-full">
							<Select.Value placeholder={$t('resort_request_form_region_placeholder')} />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value={null} label={$t('resort_request_form_region_none')}>
								{$t('resort_request_form_region_none')}
							</Select.Item>
							{#each filteredRegions as region}
								<Select.Item value={region.id} label={region.region}>
									{region.region}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="regionId" bind:value={$formData.regionId} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
			<Form.Description>{$t('resort_request_form_region_help')}</Form.Description>
		</Form.Field>
	{/if}

	<!-- Website (Optional) -->
	<Form.Field {form} name="website">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$t('resort_request_form_website_label')}</Form.Label>
				<Input
					{...props}
					type="url"
					placeholder={$t('resort_request_form_website_placeholder')}
					bind:value={$formData.website}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
		<Form.Description>{$t('resort_request_form_website_help')}</Form.Description>
	</Form.Field>

	<!-- Additional Info (Optional) -->
	<Form.Field {form} name="additionalInfo">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$t('resort_request_form_additional_info_label')}</Form.Label>
				<Textarea
					{...props}
					placeholder={$t('resort_request_form_additional_info_placeholder')}
					bind:value={$formData.additionalInfo}
					rows={3}
					class="resize-none"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
		<Form.Description>{$t('resort_request_form_additional_info_help')}</Form.Description>
	</Form.Field>

	<!-- Actions -->
	<div class="flex gap-3 pt-4">
		<Button type="submit" disabled={isSubmitting} class="flex-1">
			{#if isSubmitting}
				{$t('resort_request_form_submitting')}
			{:else}
				{$t('resort_request_form_submit')}
			{/if}
		</Button>
		{#if onCancel}
			<Button type="button" variant="outline" onclick={onCancel} disabled={isSubmitting}>
				{$t('common_cancel')}
			</Button>
		{/if}
	</div>
</div>
