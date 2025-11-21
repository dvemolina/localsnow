<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';

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
				← {m.admin_back_to_resorts()}
			</Button>
		</div>
		<h1 class="title2 mb-2">{m.admin_create_resort()}</h1>
		<p class="text-muted-foreground">{m.admin_create_resort_desc()}</p>
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
				<CardTitle>{m.admin_resort_details()}</CardTitle>
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
						<Label for="name">{m.label_resort_name()} *</Label>
						<Input id="name" name="name" required placeholder="Val d'Isère" />
					</div>

					<!-- Slug -->
					<div class="space-y-2">
						<Label for="slug">{m.label_slug()} *</Label>
						<Input
							id="slug"
							name="slug"
							required
							placeholder="val-disere"
							pattern="[a-z0-9-]+"
						/>
						<p class="text-xs text-muted-foreground">
							{m.label_slug_hint()}
						</p>
					</div>

					<!-- Label -->
					<div class="space-y-2">
						<Label for="label">{m.label_display_label()}</Label>
						<Input id="label" name="label" placeholder="Val d'Isère - Tignes" />
					</div>

					<!-- Country -->
					<div class="space-y-2">
						<Label for="countryId">{m.label_country()} *</Label>
						<input type="hidden" name="countryId" value={selectedCountryId} />
						<Select.Root
							selected={selectedCountryId ? {
								value: selectedCountryId,
								label: data.countries.find((c) => c.id.toString() === selectedCountryId)?.country || ''
							} : undefined}
							onSelectedChange={(v) => handleCountryChange(v?.value)}
						>
							<Select.Trigger>
								<Select.Value placeholder={m.admin_select_country()} />
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
						<Label for="regionId">{m.label_region()}</Label>
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
								<Select.Value placeholder={m.admin_select_region()} />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">
									{m.admin_no_region()}
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
						<Label for="minElevation">{m.label_min_elevation()}</Label>
						<Input
							id="minElevation"
							name="minElevation"
							type="number"
							placeholder="1850"
						/>
					</div>

					<!-- Max Elevation -->
					<div class="space-y-2">
						<Label for="maxElevation">{m.label_max_elevation()}</Label>
						<Input
							id="maxElevation"
							name="maxElevation"
							type="number"
							placeholder="3456"
						/>
					</div>

					<!-- Latitude -->
					<div class="space-y-2">
						<Label for="lat">{m.label_latitude()}</Label>
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
						<Label for="lon">{m.label_longitude()}</Label>
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
						<Label for="website">{m.label_website()}</Label>
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
							{m.button_creating()}
						{:else}
							{m.button_create()}
						{/if}
					</Button>
					<Button href="/admin/resorts" variant="outline" type="button">
						{m.button_cancel()}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>
</div>
