<script lang="ts">
	import SchoolSignupForm from '$src/features/Schools/components/SchoolSignupForm.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let selectedOption = $state<'search' | 'create' | null>(null);
	let searchTerm = $state('');
	let searchResults = $state<any[]>([]);
	let isSearching = $state(false);
	let showRequestDialog = $state(false);
	let selectedSchool = $state<any>(null);
	let requestMessage = $state('');
	let isSubmitting = $state(false);

	async function handleSearch() {
		if (!searchTerm || searchTerm.trim().length < 2) {
			toast.error('Please enter at least 2 characters');
			return;
		}

		isSearching = true;
		try {
			const params = new URLSearchParams({ q: searchTerm });
			const response = await fetch(`/api/schools/search?${params}`);
			const result = await response.json();

			if (result.success) {
				searchResults = result.schools;
				if (result.schools.length === 0) {
					toast.info('No schools found. You can create a new listing below!');
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

	function openRequestDialog(school: any) {
		selectedSchool = school;
		showRequestDialog = true;
		requestMessage = '';
	}

	async function handleRequestAccess() {
		if (!selectedSchool) return;

		isSubmitting = true;
		try {
			const response = await fetch('/api/schools/verification-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					schoolId: selectedSchool.id,
					schoolName: selectedSchool.name,
					message: requestMessage
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
				toast.success('Request submitted! Admin will review it soon.');
				showRequestDialog = false;
				// Redirect to dashboard
				window.location.href = '/dashboard';
			} else {
				toast.error(result.error || 'Failed to submit request');
			}
		} catch (error) {
			console.error('Request error:', error);
			toast.error('Failed to submit request');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	{#if selectedOption === null}
		<!-- Choice Screen -->
		<div class="space-y-4">
			<div>
				<h1 class="title3">Manage a School</h1>
				<p class="text-muted-foreground">
					Choose how you want to get started with school management
				</p>
			</div>

			<div class="grid md:grid-cols-2 gap-4">
				<!-- Option 1: Search for Existing School -->
				<Card.Root class="cursor-pointer hover:border-primary transition-colors" onclick={() => selectedOption = 'search'}>
					<Card.Header>
						<div class="flex items-center gap-3 mb-2">
							<div class="p-3 rounded-lg bg-blue-100">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<Card.Title class="text-xl">Find My School</Card.Title>
						</div>
						<Card.Description>
							Search for your school and request admin access. The LocalSnow team will verify your identity.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-2">
							<p class="text-sm">✓ School already exists in directory</p>
							<p class="text-sm">✓ Quick verification process</p>
							<p class="text-sm">✓ Admin will contact you directly</p>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Option 2: Create New School -->
				<Card.Root class="cursor-pointer hover:border-primary transition-colors" onclick={() => selectedOption = 'create'}>
					<Card.Header>
						<div class="flex items-center gap-3 mb-2">
							<div class="p-3 rounded-lg bg-green-100">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							</div>
							<Card.Title class="text-xl">Create New Listing</Card.Title>
						</div>
						<Card.Description>
							Create a new school listing and get instant access to manage it.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="space-y-2">
							<p class="text-sm">✓ School not in directory yet</p>
							<p class="text-sm">✓ Instant access after creation</p>
							<p class="text-sm">✓ Will be verified by admin</p>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>

	{:else if selectedOption === 'search'}
		<!-- Search Screen -->
		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" onclick={() => { selectedOption = null; searchResults = []; searchTerm = ''; }}>
					← Back
				</Button>
			</div>

			<div>
				<h1 class="title3">Find Your School</h1>
				<p class="text-muted-foreground">
					Search for your school and request admin access
				</p>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>Search Schools</Card.Title>
					<Card.Description>
						Enter your school's name or location
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div>
						<Label for="search">School Name or Location</Label>
						<div class="flex gap-2">
							<Input
								id="search"
								bind:value={searchTerm}
								placeholder="e.g., Swiss Snow School, Verbier"
								onkeydown={(e) => e.key === 'Enter' && handleSearch()}
							/>
							<Button onclick={handleSearch} disabled={isSearching}>
								{isSearching ? 'Searching...' : 'Search'}
							</Button>
						</div>
					</div>

					{#if searchResults.length > 0}
						<div class="space-y-3">
							<p class="text-sm font-medium">Found {searchResults.length} school(s):</p>
							{#each searchResults as school}
								<div class="border rounded-lg p-4 space-y-2">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<div class="flex items-center gap-2 mb-1">
												<h3 class="font-semibold">{school.name}</h3>
												{#if school.isVerified}
													<Badge variant="secondary" class="bg-green-100 text-green-800">
														✓ Verified
													</Badge>
												{:else}
													<Badge variant="outline">Unverified</Badge>
												{/if}
											</div>
											{#if school.bio}
												<p class="text-sm text-muted-foreground">{school.bio}</p>
											{/if}
											{#if school.resortName}
												<p class="text-sm text-muted-foreground mt-1">📍 {school.resortName}</p>
											{/if}
										</div>
										<Button onclick={() => openRequestDialog(school)} size="sm">
											Request Access
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{:else if searchTerm && !isSearching}
						<div class="text-center py-8 border-2 border-dashed rounded-lg">
							<svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<h3 class="mt-4 text-lg font-medium">No schools found</h3>
							<p class="text-muted-foreground mt-2 mb-4">
								Your school isn't listed yet. Create a new listing instead!
							</p>
							<Button onclick={() => selectedOption = 'create'}>
								Create New School Listing
							</Button>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

	{:else if selectedOption === 'create'}
		<!-- Create Screen -->
		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" onclick={() => selectedOption = null}>
					← Back
				</Button>
			</div>

			<div>
				<h1 class="title3">Create School Listing</h1>
				<p class="text-muted-foreground hyphens-auto">
					School data will be verified. We may contact you to provide more detailed info to validate it.
				</p>
			</div>

			<SchoolSignupForm {data} />
		</div>
	{/if}
</div>

<!-- Request Access Dialog -->
<Dialog.Root bind:open={showRequestDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Request School Access</Dialog.Title>
			<Dialog.Description>
				Submit a request to the LocalSnow admin team for access to {selectedSchool?.name}.
				They will contact you to verify your identity and grant access.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="message">Message to Admin</Label>
				<Textarea
					id="message"
					bind:value={requestMessage}
					placeholder="Include your role at the school and best contact method (email/phone) so we can verify faster!"
					rows={4}
				/>
			</div>
			<p class="text-sm text-muted-foreground">
				💡 The admin will review your request and contact you directly to verify your identity before granting access.
			</p>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRequestDialog = false)}>Cancel</Button>
			<Button onclick={handleRequestAccess} disabled={isSubmitting}>
				{isSubmitting ? 'Submitting...' : 'Submit Request'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
