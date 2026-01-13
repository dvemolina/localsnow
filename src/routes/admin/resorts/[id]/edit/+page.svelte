<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { t } from '$lib/i18n/i18n';
	import { enhance } from '$app/forms';
	import { Textarea } from '$src/lib/components/ui/textarea/index.js';
	let { data, form } = $props();
	const { resort } = data;

	let submitting = $state(false);
	let uploading = $state(false);
	let deleting = $state(false);
	let showDeleteDialog = $state(false);
	let previewUrl = $state<string | null>(resort.image || null);
	let fileInput: HTMLInputElement;
	let selectedFile: File | null = $state(null);

	let selectedCountryId = $state<string>(resort.countryId.toString());
	let selectedRegionId = $state<string>(resort.regionId?.toString() || '');

	// Filter regions based on selected country
	const filteredRegions = $derived(
		selectedCountryId
			? data.regions.filter((r) => r.countryId === parseInt(selectedCountryId))
			: []
	);

	function handleCountryChange(value: string ) {
		selectedCountryId = value || '';
		selectedRegionId = ''; // Reset region when country changes
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			selectedFile = file;
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function clearSelection() {
		selectedFile = null;
		previewUrl = resort.image || null;
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<div class="container mx-auto max-w-4xl space-y-6">
	<!-- Header -->
	<div class="mb-8">
		<div class="mb-4">
			<Button href="/admin/resorts" variant="outline" size="sm">
				← {$t('admin_back_to_resorts')}
			</Button>
		</div>
		<h1 class="title2 mb-2">{$t('edit_admin_edit_resort')}: {resort.name}</h1>
		<p class="text-muted-foreground">{$t('edit_admin_edit_resort_desc')}</p>
	</div>

	<!-- Resort Details Form -->
	<form
		method="POST"
		action="?/updateDetails"
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
				<CardTitle>{$t('admin_resort_details')}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				{#if form?.error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{form.error}
					</div>
				{/if}

				{#if form?.success && form?.message}
					<div class="rounded-md bg-green-100 p-3 text-sm text-green-800">
						{form.message}
					</div>
				{/if}

				<div class="grid gap-6 md:grid-cols-2">
					<!-- ID -->
					<div class="space-y-2">
						<Label>{$t('label_id')}</Label>
						<p class="text-muted-foreground">#{resort.id}</p>
					</div>

					<!-- UUID -->
					<div class="space-y-2">
						<Label>{$t('edit_label_uuid')}</Label>
						<p class="font-mono text-sm text-muted-foreground">{resort.uuid}</p>
					</div>

					<!-- Name -->
					<div class="space-y-2">
						<Label for="name">{$t('label_resort_name')} *</Label>
						<Input id="name" name="name" required value={resort.name} />
					</div>

					<!-- Slug -->
					<div class="space-y-2">
						<Label for="slug">{$t('label_slug')} *</Label>
						<Input
							id="slug"
							name="slug"
							required
							value={resort.slug}
							pattern="[a-z0-9-]+"
						/>
					</div>

					<!-- Label -->
					<div class="space-y-2">
						<Label for="label">{$t('label_display_label')}</Label>
						<Input id="label" name="label" value={resort.label || ''} />
					</div>

					<!-- Country -->
					<div class="space-y-2">
						<Label for="countryId">{$t('label_country')} *</Label>
						<input type="hidden" name="countryId" value={selectedCountryId} />
						<Select.Root
							type="single"
							value={selectedCountryId}
							onValueChange={handleCountryChange}
						>
							<Select.Trigger>
								{selectedCountryId
								? data.countries.find((c) => c.id.toString() === selectedCountryId)?.country
								: $t('admin_filter_country')}
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
						<Label for="regionId">{$t('label_region')}</Label>
						<input type="hidden" name="regionId" value={selectedRegionId} />
						<Select.Root
							type="single"
							value={selectedRegionId}
							onValueChange={(v) => (selectedRegionId = v || '')}
						>
							<Select.Trigger>
								{selectedRegionId
								? data.regions.find((r) => r.id.toString() === selectedRegionId)?.region
								: $t('admin_filter_region')}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">
									{$t('admin_no_region')}
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
						<Label for="minElevation">{$t('label_min_elevation')}</Label>
						<Input
							id="minElevation"
							name="minElevation"
							type="number"
							value={resort.minElevation || ''}
						/>
					</div>

					<!-- Max Elevation -->
					<div class="space-y-2">
						<Label for="maxElevation">{$t('label_max_elevation')}</Label>
						<Input
							id="maxElevation"
							name="maxElevation"
							type="number"
							value={resort.maxElevation || ''}
						/>
					</div>

					<!-- Latitude -->
					<div class="space-y-2">
						<Label for="lat">{$t('label_latitude')}</Label>
						<Input id="lat" name="lat" type="text" value={resort.lat || ''} />
					</div>

					<!-- Longitude -->
					<div class="space-y-2">
						<Label for="lon">{$t('label_longitude')}</Label>
						<Input id="lon" name="lon" type="text" value={resort.lon || ''} />
					</div>

					<!-- Website -->
					<div class="col-span-2 space-y-2">
						<Label for="website">{$t('label_website')}</Label>
						<Input id="website" name="website" type="url" value={resort.website || ''} />
					</div>

					<!-- Description -->
					 <div class="col-span-2 space-y-2">
						<Label for="description">Description</Label>
						<Textarea
							name="description"
							id="description"
							value={resort.description || ''}
							rows={6}
						/>
					</div>
				</div>

				<div class="flex gap-2 pt-4">
					<Button type="submit" disabled={submitting}>
						{#if submitting}
							{$t('button_updating')}
						{:else}
							{$t('button_update')}
						{/if}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>

	<!-- Image Upload Card -->
	<Card>
		<CardHeader>
			<CardTitle>{$t('edit_admin_resort_image')}</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Current/Preview Image -->
			<div>
				<p class="mb-3 text-sm font-medium">{$t('edit_admin_current_image')}</p>
				{#if previewUrl}
					<div class="relative overflow-hidden rounded-lg border border-border">
						<img src={previewUrl} alt={resort.name} class="h-64 w-full object-cover" />
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
						<div class="absolute bottom-4 left-4 text-white">
							<p class="font-semibold">{resort.name}</p>
							<p class="text-sm text-white/80">{$t('edit_admin_preview')}</p>
						</div>
					</div>
				{:else}
					<div
						class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted"
					>
						<p class="text-muted-foreground">{$t('admin_no_image')}</p>
					</div>
				{/if}
			</div>

			<!-- Upload Form -->
			<form
				method="POST"
				action="?/uploadImage"
				enctype="multipart/form-data"
				use:enhance={() => {
					uploading = true;
					return async ({ update, result }) => {
						uploading = false;
						await update();
						if (result.type === 'success') {
							if (fileInput) fileInput.value = '';
							selectedFile = null;
						}
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="image" class="mb-2 block text-sm font-medium">
						{$t('edit_admin_upload_new_image')}
					</label>
					<Input
						id="image"
						name="image"
						type="file"
						accept="image/*"
						bind:this={fileInput}
						onchange={handleFileSelect}
						disabled={uploading}
						class="cursor-pointer"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						{$t('edit_admin_image_guidelines')}
					</p>
				</div>

				<div class="flex gap-2">
					<Button type="submit" disabled={uploading || !selectedFile}>
						{#if uploading}
							{$t('button_uploading')}
						{:else}
							{$t('button_upload_image')}
						{/if}
					</Button>
					{#if selectedFile}
						<Button type="button" variant="outline" onclick={clearSelection}>
							{$t('button_cancel')}
						</Button>
					{/if}
				</div>
			</form>
		</CardContent>
	</Card>

	<!-- Danger Zone -->
	<Card class="border-destructive">
		<CardHeader>
			<CardTitle class="text-destructive">{$t('admin_danger_zone')}</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-muted-foreground">
				{$t('edit_admin_delete_resort_warning')}
			</p>
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>
				{$t('button_delete_resort')}
			</Button>
		</CardContent>
	</Card>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('edit_admin_confirm_delete_resort')}</AlertDialog.Title>
			<AlertDialog.Description>
				{$t('resorts_admin_delete_resort_confirmation')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{$t('button_cancel')}</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					deleting = true;
					return async ({ update }) => {
						deleting = false;
						await update();
					};
				}}
			>
				<AlertDialog.Action asChild let:builder>
					<Button
						{...builder}
						type="submit"
						variant="destructive"
						disabled={deleting}
					>
						{#if deleting}
							{$t('button_deleting')}
						{:else}
							{$t('button_delete')}
						{/if}
					</Button>
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
