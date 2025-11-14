<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data, form } = $props();
	const { resort } = data;

	let uploading = $state(false);
	let previewUrl = $state<string | null>(resort.image || null);
	let fileInput: HTMLInputElement;
	let selectedFile: File | null = null;

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
				← Back to Resorts
			</Button>
		</div>
		<h1 class="title2 mb-2">Edit Resort: {resort.name}</h1>
		<p class="text-muted-foreground">Manage resort images and details</p>
	</div>

	<!-- Resort Details Card -->
	<Card>
		<CardHeader>
			<CardTitle>Resort Information</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<p class="text-sm font-medium">ID</p>
					<p class="text-muted-foreground">#{resort.id}</p>
				</div>
				<div>
					<p class="text-sm font-medium">Slug</p>
					<p class="text-muted-foreground">{resort.slug}</p>
				</div>
				<div>
					<p class="text-sm font-medium">Country</p>
					<Badge variant="outline">{resort.country.country}</Badge>
				</div>
				<div>
					<p class="text-sm font-medium">Region</p>
					<p class="text-muted-foreground">
						{resort.region?.region || '-'}
					</p>
				</div>
				{#if resort.minElevation && resort.maxElevation}
					<div class="col-span-2">
						<p class="text-sm font-medium">Elevation</p>
						<p class="text-muted-foreground">
							{resort.minElevation}m - {resort.maxElevation}m
						</p>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Image Upload Card -->
	<Card>
		<CardHeader>
			<CardTitle>Resort Image</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Current/Preview Image -->
			<div>
				<p class="mb-3 text-sm font-medium">Current Image</p>
				{#if previewUrl}
					<div class="relative overflow-hidden rounded-lg border border-border">
						<img
							src={previewUrl}
							alt={resort.name}
							class="h-64 w-full object-cover"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
						<div class="absolute bottom-4 left-4 text-white">
							<p class="font-semibold">{resort.name}</p>
							<p class="text-sm text-white/80">Preview</p>
						</div>
					</div>
				{:else}
					<div class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
						<p class="text-muted-foreground">No image uploaded yet</p>
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
							// Clear file input after successful upload
							if (fileInput) fileInput.value = '';
							selectedFile = null;
						}
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="image" class="mb-2 block text-sm font-medium">
						Upload New Image
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
						Recommended: 1200x800px or larger. Max 10MB. JPG, PNG, or WebP.
					</p>
				</div>

				{#if form?.error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{form.error}
					</div>
				{/if}

				{#if form?.success}
					<div class="rounded-md bg-green-100 p-3 text-sm text-green-800">
						Image uploaded successfully!
					</div>
				{/if}

				<div class="flex gap-2">
					<Button type="submit" disabled={uploading || !selectedFile}>
						{#if uploading}
							Uploading...
						{:else}
							Upload Image
						{/if}
					</Button>
					{#if selectedFile}
						<Button type="button" variant="outline" onclick={clearSelection}>
							Cancel
						</Button>
					{/if}
				</div>
			</form>

			<!-- Info Box -->
			<div class="rounded-md border border-blue-200 bg-blue-50 p-4">
				<p class="text-sm font-medium text-blue-900">Image Guidelines</p>
				<ul class="mt-2 space-y-1 text-sm text-blue-800">
					<li>• High-quality landscape images work best</li>
					<li>• Image will be automatically optimized to 1200x800px WebP format</li>
					<li>• Choose images that showcase the resort's unique features</li>
					<li>• Ensure the image has good contrast for readable text overlay</li>
				</ul>
			</div>
		</CardContent>
	</Card>
</div>
