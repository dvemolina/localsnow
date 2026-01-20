<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { resorts, user } = $derived(data);

	let searchTerm = $state('');
	let selectedResortId = $state<number | null>(null);
	let searchResults = $state<any[]>([]);
	let isSearching = $state(false);
	let showCreateDialog = $state(false);
	let showClaimDialog = $state(false);
	let selectedSchool = $state<any>(null);

	// Create school form
	let createForm = $state({
		name: '',
		resortId: null as number | null,
		countryCode: '',
		bio: '',
		schoolEmail: '',
		schoolPhone: ''
	});

	// Claim school form
	let claimMessage = $state('');
	let isSubmitting = $state(false);

	async function handleSearch() {
		if (!searchTerm || searchTerm.trim().length < 2) {
			toast.error('Please enter at least 2 characters');
			return;
		}

		isSearching = true;
		try {
			const params = new URLSearchParams({ q: searchTerm });
			if (selectedResortId) {
				params.append('resortId', selectedResortId.toString());
			}

			const response = await fetch(`/api/schools/search?${params}`);
			const result = await response.json();

			if (result.success) {
				searchResults = result.schools;
				if (result.schools.length === 0) {
					toast.info('No schools found. You can create a listing!');
				}
			} else {
				toast.error(result.error || 'Failed to search schools');
			}
		} catch (error) {
			console.error('Search error:', error);
			toast.error('Failed to search schools');
		} finally {
			isSearching = false;
		}
	}

	async function handleCreateSchool() {
		if (!createForm.name || !createForm.resortId || !createForm.countryCode) {
			toast.error('Please fill in all required fields');
			return;
		}

		isSubmitting = true;
		try {
			const response = await fetch('/api/schools/create-listing', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(createForm)
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success('School listing created successfully!');
				showCreateDialog = false;
				// Reset form
				createForm = {
					name: '',
					resortId: null,
					countryCode: '',
					bio: '',
					schoolEmail: '',
					schoolPhone: ''
				};
				// Refresh search
				await handleSearch();
			} else if (response.status === 409) {
				toast.error(result.error || 'School already exists');
				if (result.existingSchool) {
					// Show the existing school
					searchResults = [result.existingSchool];
				}
			} else {
				toast.error(result.error || 'Failed to create school listing');
			}
		} catch (error) {
			console.error('Create error:', error);
			toast.error('Failed to create school listing');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleClaimSchool() {
		if (!selectedSchool) return;

		isSubmitting = true;
		try {
			const response = await fetch('/api/schools/claim', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					schoolId: selectedSchool.id,
					message: claimMessage
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success('Claim submitted successfully!');
				showClaimDialog = false;
				claimMessage = '';
				selectedSchool = null;
			} else {
				toast.error(result.error || 'Failed to submit claim');
			}
		} catch (error) {
			console.error('Claim error:', error);
			toast.error('Failed to submit claim');
		} finally {
			isSubmitting = false;
		}
	}

	function openCreateDialog() {
		createForm.name = searchTerm;
		createForm.resortId = selectedResortId;
		showCreateDialog = true;
	}

	function openClaimDialog(school: any) {
		selectedSchool = school;
		showClaimDialog = true;
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold">Find or List a School</h1>
		<p class="text-muted-foreground mt-1">
			Search for your school, or create a listing if it doesn't exist
		</p>
	</div>

	<!-- Search Form -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Search for Schools</Card.Title>
			<Card.Description>
				Find schools by name or location. Can't find yours? Create a listing!
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 md:grid-cols-3">
				<div class="md:col-span-2">
					<Label for="search">School Name or Location</Label>
					<Input
						id="search"
						bind:value={searchTerm}
						placeholder="e.g., Swiss Snow School, Verbier"
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					/>
				</div>
				<div>
					<Label for="resort">Filter by Resort (Optional)</Label>
					<Select.Root
						onSelectedChange={(v) => (selectedResortId = v?.value || null)}
					>
						<Select.Trigger>
							<Select.Value placeholder="All resorts" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value={null}>All resorts</Select.Item>
							{#each resorts as resort}
								<Select.Item value={resort.id}>{resort.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="flex gap-2 mt-4">
				<Button onclick={handleSearch} disabled={isSearching}>
					{isSearching ? 'Searching...' : 'Search'}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Search Results -->
	{#if searchResults.length > 0}
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Search Results ({searchResults.length})</h2>
			{#each searchResults as school}
				<Card.Root>
					<Card.Content class="pt-6">
						<div class="flex items-start justify-between">
							<div class="flex gap-4 flex-1">
								{#if school.logo}
									<img
										src={school.logo}
										alt={school.name}
										class="h-16 w-16 rounded-lg object-cover border"
									/>
								{:else}
									<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 border">
										<span class="text-lg font-medium">{school.name[0]}</span>
									</div>
								{/if}

								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="text-lg font-semibold">{school.name}</h3>
										{#if school.isVerified}
											<Badge variant="secondary" class="bg-green-100 text-green-800">
												✓ Verified
											</Badge>
										{:else}
											<Badge variant="outline">Unverified</Badge>
										{/if}
										{#if school.createdBy === 'instructor'}
											<Badge variant="outline" class="bg-blue-50 text-blue-700">
												Listed by Instructor
											</Badge>
										{/if}
									</div>

									{#if school.bio}
										<p class="text-sm mb-2 line-clamp-2">{school.bio}</p>
									{/if}

									{#if school.resortName}
										<p class="text-sm text-muted-foreground">
											📍 {school.resortName}
										</p>
									{/if}
								</div>
							</div>

							<div class="flex flex-col gap-2 ml-4">
								{#if user.role === 'school-admin'}
									<Button
										onclick={() => openClaimDialog(school)}
										variant="default"
										size="sm"
									>
										Claim School
									</Button>
								{:else if user.role === 'instructor-independent' || user.role === 'instructor-school'}
									<Button href="/dashboard/schools" variant="default" size="sm">
										Apply to Join
									</Button>
								{/if}
								<Button href={`/schools/${school.slug}`} variant="outline" size="sm">
									View Profile
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if searchTerm && !isSearching}
		<Card.Root class="border-dashed">
			<Card.Content class="pt-6">
				<div class="text-center py-8">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto h-12 w-12 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-medium">No schools found</h3>
					<p class="text-muted-foreground mt-2 mb-4">
						Can't find your school? Create a listing to help others find it!
					</p>
					{#if user.role === 'instructor-independent' || user.role === 'instructor-school'}
						<Button onclick={openCreateDialog}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-2 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Create School Listing
						</Button>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- Create School Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Create School Listing</Dialog.Title>
			<Dialog.Description>
				Create a listing for your school. It will be unverified until an admin reviews it.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="schoolName">School Name *</Label>
				<Input id="schoolName" bind:value={createForm.name} required />
			</div>
			<div class="grid gap-2">
				<Label for="resort">Resort *</Label>
				<Select.Root
					onSelectedChange={(v) => (createForm.resortId = v?.value || null)}
				>
					<Select.Trigger>
						<Select.Value placeholder="Select resort" />
					</Select.Trigger>
					<Select.Content>
						{#each resorts as resort}
							<Select.Item value={resort.id}>{resort.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-2">
				<Label for="countryCode">Country Code *</Label>
				<Input id="countryCode" bind:value={createForm.countryCode} placeholder="+1" required />
			</div>
			<div class="grid gap-2">
				<Label for="bio">Description</Label>
				<Textarea id="bio" bind:value={createForm.bio} placeholder="Brief description of the school..." />
			</div>
			<div class="grid gap-2">
				<Label for="schoolEmail">Email</Label>
				<Input id="schoolEmail" type="email" bind:value={createForm.schoolEmail} />
			</div>
			<div class="grid gap-2">
				<Label for="schoolPhone">Phone</Label>
				<Input id="schoolPhone" bind:value={createForm.schoolPhone} />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showCreateDialog = false)}>Cancel</Button>
			<Button onclick={handleCreateSchool} disabled={isSubmitting}>
				{isSubmitting ? 'Creating...' : 'Create Listing'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Claim School Dialog -->
<Dialog.Root bind:open={showClaimDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Claim School</Dialog.Title>
			<Dialog.Description>
				Submit a request to claim ownership of {selectedSchool?.name}. The current owner will review your request.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="claimMessage">Message (Optional)</Label>
				<Textarea
					id="claimMessage"
					bind:value={claimMessage}
					placeholder="Explain why you should own this school..."
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showClaimDialog = false)}>Cancel</Button>
			<Button onclick={handleClaimSchool} disabled={isSubmitting}>
				{isSubmitting ? 'Submitting...' : 'Submit Claim'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
