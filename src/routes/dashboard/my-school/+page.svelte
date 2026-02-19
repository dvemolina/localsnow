<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Card from '$src/lib/components/ui/card';
	import { Badge } from '$src/lib/components/ui/badge';
	import Button from '$src/lib/components/ui/button/button.svelte';
	import { Input } from '$src/lib/components/ui/input';
	import { Label } from '$src/lib/components/ui/label';

	let { data, form } = $props();

	// ── State ──────────────────────────────────────────────────────────────────
	let searchQuery = $state(data.searchQuery ?? '');
	let searchTimeout: ReturnType<typeof setTimeout>;
	let showRegistrationForm = $state(false);
	let submitting = $state<string | null>(null); // which action is in flight

	// ── Effects ───────────────────────────────────────────────────────────────
	$effect(() => {
		if (form?.success && form.message) {
			toast.success(form.message);
			invalidateAll();
		}
		if (form?.error) {
			toast.error(form.error);
		}
	});

	// Debounced school search — updates URL → triggers server load
	function onSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL(window.location.href);
			if (searchQuery) {
				url.searchParams.set('q', searchQuery);
			} else {
				url.searchParams.delete('q');
			}
			goto(url.toString(), { replaceState: true, keepFocus: true });
		}, 350);
	}

	// Schools already associated with the instructor (to hide them in search)
	const mySchoolId = $derived(data.association?.schoolId ?? null);
	const invitedSchoolIds = $derived(new Set(data.invitations.map(i => i.schoolId)));
	const filteredSchools = $derived(
		data.schoolList.filter(
			s => s.id !== mySchoolId && !invitedSchoolIds.has(s.id)
		)
	);

	const hasActiveSchool = $derived(data.association?.isActive === true);
	const hasPendingApplication = $derived(
		data.association !== null &&
		data.association.isActive === false &&
		data.association.requestedBy === 'instructor'
	);
</script>

<div class="container mx-auto max-w-3xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<a href="/dashboard" class="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Dashboard
		</a>
		<h1 class="title2 mb-1">My School</h1>
		<p class="text-muted-foreground">
			Connect with your ski school so clients know where you teach.
		</p>
	</div>

	<!-- ── ACTIVE SCHOOL ───────────────────────────────────────────────────── -->
	{#if hasActiveSchool && data.association}
		<Card.Root class="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
			<Card.Header>
				<div class="flex items-center gap-3">
					{#if data.association.schoolLogo}
						<img
							src={data.association.schoolLogo}
							alt={data.association.schoolName}
							class="h-12 w-12 rounded-lg object-cover"
						/>
					{:else}
						<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700">
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
						</div>
					{/if}
					<div>
						<Card.Title class="text-green-900 dark:text-green-100">
							{data.association.schoolName}
						</Card.Title>
						<Badge variant="default" class="mt-1 bg-green-600">Active member</Badge>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-green-800 dark:text-green-200">
					You are currently a member of this school. Clients can find your profile through the school directory.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- ── PENDING APPLICATION ─────────────────────────────────────────────── -->
	{#if hasPendingApplication && data.association}
		<Card.Root class="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-amber-900 dark:text-amber-100">
					<svg class="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
					</svg>
					Application pending
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="mb-4 text-sm text-amber-800 dark:text-amber-200">
					Your application to <strong>{data.association.schoolName}</strong> is awaiting review by the school admin.
				</p>
				<form
					method="POST"
					action="?/cancelApplication"
					use:enhance={({ submitter }) => {
						submitting = 'cancel';
						return async ({ update }) => {
							await update();
							submitting = null;
						};
					}}
				>
					<input type="hidden" name="schoolId" value={data.association.schoolId} />
					<Button
						type="submit"
						variant="outline"
						size="sm"
						disabled={submitting === 'cancel'}
						class="border-amber-400 text-amber-800 hover:bg-amber-100"
					>
						{submitting === 'cancel' ? 'Cancelling…' : 'Cancel application'}
					</Button>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- ── PENDING INVITATIONS FROM SCHOOLS ──────────────────────────────── -->
	{#if data.invitations.length > 0}
		<div class="mb-6">
			<h2 class="title4 mb-3">Pending invitations</h2>
			<div class="space-y-3">
				{#each data.invitations as invitation (invitation.schoolId)}
					<Card.Root class="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
						<Card.Content class="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
							<div class="flex items-center gap-3">
								{#if invitation.schoolLogo}
									<img
										src={invitation.schoolLogo}
										alt={invitation.schoolName}
										class="h-10 w-10 rounded-lg object-cover"
									/>
								{:else}
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
												d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
										</svg>
									</div>
								{/if}
								<div>
									<p class="font-semibold text-blue-900 dark:text-blue-100">{invitation.schoolName}</p>
									<p class="text-xs text-blue-600 dark:text-blue-300">
										Invited {new Date(invitation.requestedAt).toLocaleDateString()}
									</p>
								</div>
							</div>
							<div class="flex gap-2">
								<form method="POST" action="?/acceptInvitation" use:enhance={({ submitter }) => {
									submitting = `accept-${invitation.schoolId}`;
									return async ({ update }) => { await update(); submitting = null; };
								}}>
									<input type="hidden" name="schoolId" value={invitation.schoolId} />
									<input type="hidden" name="schoolName" value={invitation.schoolName} />
									<Button type="submit" size="sm" disabled={!!submitting}>
										{submitting === `accept-${invitation.schoolId}` ? 'Accepting…' : 'Accept'}
									</Button>
								</form>
								<form method="POST" action="?/rejectInvitation" use:enhance={({ submitter }) => {
									submitting = `reject-${invitation.schoolId}`;
									return async ({ update }) => { await update(); submitting = null; };
								}}>
									<input type="hidden" name="schoolId" value={invitation.schoolId} />
									<input type="hidden" name="schoolName" value={invitation.schoolName} />
									<Button type="submit" variant="outline" size="sm" disabled={!!submitting}>
										{submitting === `reject-${invitation.schoolId}` ? 'Declining…' : 'Decline'}
									</Button>
								</form>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}

	<!-- ── SCHOOL SEARCH (only when no active school / no pending app) ──── -->
	{#if !hasActiveSchool && !hasPendingApplication}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title>Find your school</Card.Title>
				<Card.Description>
					Search the directory and send an application. The school admin will review it.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<!-- Search input -->
				<div class="relative mb-4">
					<svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						type="text"
						placeholder="Search by school name…"
						bind:value={searchQuery}
						oninput={onSearchInput}
						class="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				{#if filteredSchools.length > 0}
					<ul class="divide-y divide-border rounded-lg border">
						{#each filteredSchools as school (school.id)}
							<li class="flex items-center gap-3 p-3">
								<!-- Logo -->
								{#if school.logo}
									<img src={school.logo} alt={school.name} class="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
								{:else}
									<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
												d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
										</svg>
									</div>
								{/if}

								<!-- Info -->
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<span class="truncate font-medium">{school.name}</span>
										{#if school.isVerified}
											<Badge variant="default" class="shrink-0 bg-green-600 text-xs">Verified</Badge>
										{/if}
									</div>
									{#if school.bio}
										<p class="truncate text-xs text-muted-foreground">{school.bio}</p>
									{/if}
								</div>

								<!-- Apply form -->
								<form
									method="POST"
									action="?/applyToSchool"
									use:enhance={({ submitter }) => {
										submitting = `apply-${school.id}`;
										return async ({ update }) => {
											await update();
											submitting = null;
										};
									}}
									class="flex-shrink-0"
								>
									<input type="hidden" name="schoolId" value={school.id} />
									<input type="hidden" name="schoolName" value={school.name} />
									<input type="hidden" name="schoolAdminEmail" value={school.schoolEmail ?? ''} />
									<Button
										type="submit"
										size="sm"
										variant="outline"
										disabled={!!submitting}
									>
										{submitting === `apply-${school.id}` ? 'Sending…' : 'Apply'}
									</Button>
								</form>
							</li>
						{/each}
					</ul>
				{:else if searchQuery}
					<p class="py-6 text-center text-sm text-muted-foreground">
						No schools found for "<strong>{searchQuery}</strong>".
					</p>
				{:else}
					<p class="py-6 text-center text-sm text-muted-foreground">
						Start typing to search schools…
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- ── SCHOOL NOT LISTED ─────────────────────────────────────────── -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					School not listed?
				</Card.Title>
				<Card.Description>
					Request its registration. We'll review it and add it to the directory — then you can apply.
				</Card.Description>
			</Card.Header>

			{#if form?.registrationRequested}
				<!-- Success state -->
				<Card.Content>
					<div class="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
						<svg class="h-5 w-5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
						<div>
							<p class="font-medium text-green-800 dark:text-green-200">{form.message}</p>
							<p class="mt-1 text-sm text-green-700 dark:text-green-300">
								Once we add the school you'll be able to search for it and apply.
							</p>
						</div>
					</div>
				</Card.Content>
			{:else}
				<Card.Content>
					<button
						type="button"
						onclick={() => showRegistrationForm = !showRegistrationForm}
						class="flex w-full items-center justify-between rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
					>
						<span>{showRegistrationForm ? 'Hide form' : 'Request a new school registration'}</span>
						<svg
							class="h-4 w-4 transition-transform duration-200 {showRegistrationForm ? 'rotate-180' : ''}"
							fill="none" stroke="currentColor" viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{#if showRegistrationForm}
						<form
							method="POST"
							action="?/requestSchoolRegistration"
							use:enhance={({ submitter }) => {
								submitting = 'register';
								return async ({ update }) => {
									await update();
									submitting = null;
									showRegistrationForm = false;
								};
							}}
							class="mt-4 space-y-4"
						>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="space-y-1.5">
									<Label for="schoolName">School name *</Label>
									<Input
										id="schoolName"
										name="schoolName"
										placeholder="e.g. Ski School Andorra"
										required
									/>
									{#if form?.fieldErrors?.schoolName}
										<p class="text-xs text-destructive">{form.fieldErrors.schoolName[0]}</p>
									{/if}
								</div>

								<div class="space-y-1.5">
									<Label for="resortName">Resort / location *</Label>
									<Input
										id="resortName"
										name="resortName"
										placeholder="e.g. Grandvalira"
										required
									/>
									{#if form?.fieldErrors?.resortName}
										<p class="text-xs text-destructive">{form.fieldErrors.resortName[0]}</p>
									{/if}
								</div>

								<div class="space-y-1.5">
									<Label for="schoolEmail">School contact email *</Label>
									<Input
										id="schoolEmail"
										name="schoolEmail"
										type="email"
										placeholder="info@myschool.com"
										required
									/>
									{#if form?.fieldErrors?.schoolEmail}
										<p class="text-xs text-destructive">{form.fieldErrors.schoolEmail[0]}</p>
									{/if}
								</div>

								<div class="space-y-1.5">
									<Label for="schoolPhone">School phone *</Label>
									<Input
										id="schoolPhone"
										name="schoolPhone"
										type="tel"
										placeholder="+376 123 456"
										required
									/>
									{#if form?.fieldErrors?.schoolPhone}
										<p class="text-xs text-destructive">{form.fieldErrors.schoolPhone[0]}</p>
									{/if}
								</div>

								<div class="space-y-1.5 sm:col-span-2">
									<Label for="website">School website (optional)</Label>
									<Input
										id="website"
										name="website"
										type="url"
										placeholder="https://myskischool.com"
									/>
									{#if form?.fieldErrors?.website}
										<p class="text-xs text-destructive">{form.fieldErrors.website[0]}</p>
									{/if}
								</div>
							</div>

							<div class="flex items-center justify-between pt-1">
								<p class="text-xs text-muted-foreground">
									We'll review and add the school within a few days.
								</p>
								<Button
									type="submit"
									disabled={submitting === 'register'}
									size="sm"
								>
									{submitting === 'register' ? 'Sending…' : 'Submit request'}
								</Button>
							</div>
						</form>
					{/if}
				</Card.Content>
			{/if}
		</Card.Root>
	{/if}
</div>
