<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { useIntlayer } from 'svelte-intlayer';
	import { enhance } from '$app/forms';

	const admin = useIntlayer('admin');
	const label = useIntlayer('label');
	const button = useIntlayer('button');

	let { data, form } = $props();

	let submitting = $state(false);
	let selectedCountryId = $state<string>('');
	let selectedRegionId = $state<string>('');

	// Filter regions based on selected country
	const filteredRegions = $derived(
		selectedCountryId
			? data.regions.filter((r) => r.countryId === parseInt(selectedCountryId))
			: []
	);

	function handleCountryChange(value: string | undefined) {
		selectedCountryId = value || '';
		selectedRegionId = ''; // Reset region when country changes
	}
</script>

<div class="container mx-auto max-w-4xl space-y-6">
	<div class="mb-8">
		<div class="mb-4">
			<Button href="/admin/resorts" variant="outline" size="sm">
				← {$admin.back_to_resorts.value}
			</Button>
		</div>
		<h1 class="title2 mb-2">{$admin.create_resort.value}</h1>
		<p class="text-muted-foreground">{$create.admin_create_resort_desc.value}</p>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
	>
		<Card>
			<CardHeader>
				<CardTitle>{$admin.resort_details.value}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				{#if form?.error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{form.error}
					</div>
				{/if}

				<div class="grid gap-6 md:grid-cols-2">
					<!-- Name -->
					<div class="space-y-2">
						<Label for="name">{$label.resort_name.value} *</Label>
						<Input id="name" name="name" required placeholder="Val d'Isère" />
					</div>

					<!-- Slug -->
					<div class="space-y-2">
						<Label for="slug">{$label.slug.value} *</Label>
						<Input
							id="slug"
							name="slug"
							required
							placeholder="val-disere"
							pattern="[a-z0-9-]+"
						/>
						<p class="text-xs text-muted-foreground">
							{$label.slug_hint.value}
						</p>
					</div>

					<!-- Label -->
					<div class="space-y-2">
						<Label for="label">{$label.display_label.value}</Label>
						<Input id="label" name="label" placeholder="Val d'Isère - Tignes" />
					</div>

					<!-- Country -->
					<div class="space-y-2">
						<Label for="countryId">{$label.country.value} *</Label>
						<input type="hidden" name="countryId" value={selectedCountryId} />
						<Select.Root
							selected={selectedCountryId ? {
								value: selectedCountryId,
								label: data.countries.find((c) => c.id.toString() === selectedCountryId)?.country || ''
							} : undefined}
							onSelectedChange={(v) => handleCountryChange(v?.value)}
						>
							<Select.Trigger>
								<Select.Value placeholder={$create.admin_select_country.value} />
							</Select.Trigger>
							<Select.Content>
								{#each data.countries as country}
									<Select.Item value={country.id.toString()}>
										{country.country}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Region -->
					<div class="space-y-2">
						<Label for="regionId">{$label.region.value}</Label>
						<input type="hidden" name="regionId" value={selectedRegionId} />
						<Select.Root
							selected={selectedRegionId ? {
								value: selectedRegionId,
								label: filteredRegions.find((r) => r.id.toString() === selectedRegionId)?.region || ''
							} : undefined}
							onSelectedChange={(v) => (selectedRegionId = v?.value || '')}
							disabled={!selectedCountryId}
						>
							<Select.Trigger>
								<Select.Value placeholder={$create.admin_select_region.value} />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">
									{$admin.no_region.value}
								</Select.Item>
								{#each filteredRegions as region}
									<Select.Item value={region.id.toString()}>
										{region.region}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Min Elevation -->
					<div class="space-y-2">
						<Label for="minElevation">{$label.min_elevation.value}</Label>
						<Input
							id="minElevation"
							name="minElevation"
							type="number"
							placeholder="1850"
						/>
					</div>

					<!-- Max Elevation -->
					<div class="space-y-2">
						<Label for="maxElevation">{$label.max_elevation.value}</Label>
						<Input
							id="maxElevation"
							name="maxElevation"
							type="number"
							placeholder="3456"
						/>
					</div>

					<!-- Latitude -->
					<div class="space-y-2">
						<Label for="lat">{$label.latitude.value}</Label>
						<Input
							id="lat"
							name="lat"
							type="text"
							placeholder="45.450000"
							pattern="-?[0-9]+\.?[0-9]*"
						/>
					</div>

					<!-- Longitude -->
					<div class="space-y-2">
						<Label for="lon">{$label.longitude.value}</Label>
						<Input
							id="lon"
							name="lon"
							type="text"
							placeholder="6.980000"
							pattern="-?[0-9]+\.?[0-9]*"
						/>
					</div>

					<!-- Website -->
					<div class="col-span-2 space-y-2">
						<Label for="website">{$label.website.value}</Label>
						<Input
							id="website"
							name="website"
							type="url"
							placeholder="https://www.valdisere.com"
						/>
					</div>
				</div>

				<div class="flex gap-2 pt-4">
					<Button type="submit" disabled={submitting}>
						{#if submitting}
							{$button.creating.value}
						{:else}
							{$button.create.value}
						{/if}
					</Button>
					<Button href="/admin/resorts" variant="outline" type="button">
						{$button.cancel.value}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>
</div>
