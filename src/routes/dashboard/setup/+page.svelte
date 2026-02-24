<script lang="ts">
	import { superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { setupBasicsSchema, setupTeachingSchema, setupRateSchema } from './setupSchemas';
	import Button from '$src/lib/components/ui/button/button.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';

	let { data } = $props();

	const currentStep = $derived(data.currentStep);
	const totalSteps = $derived(data.totalSteps);
	const isSchool = $derived(data.isSchool);

	// ── Step 1: Contact info + optional photo ──────────────────────────────
	const basicsFormObj = superForm(data.basicsForm, {
		validators: zodClient(setupBasicsSchema),
		id: 'basics'
	});
	const {
		form: basicsData,
		enhance: enhanceBasics,
		submitting: submittingBasics
	} = basicsFormObj;
	const profileImageProxy = fileProxy(basicsFormObj, 'profileImage');
	const qualificationProxy = fileProxy(basicsFormObj, 'qualification');

	// ── Step 2: Resort + Sports ────────────────────────────────────────────
	const teachingFormObj = superForm(data.teachingForm, {
		validators: zodClient(setupTeachingSchema),
		dataType: 'json',
		id: 'teaching'
	});
	const {
		form: teachingData,
		enhance: enhanceTeaching,
		submitting: submittingTeaching
	} = teachingFormObj;

	// ── Step 3: Base rate (independent only) ──────────────────────────────
	const rateFormObj = superForm(data.rateForm, {
		validators: zodClient(setupRateSchema),
		id: 'rate'
	});
	const {
		form: rateData,
		enhance: enhanceRate,
		submitting: submittingRate
	} = rateFormObj;

	const steps = $derived(
		isSchool
			? [{ label: 'Contact' }, { label: 'Teaching' }]
			: [{ label: 'Contact' }, { label: 'Teaching' }, { label: 'Your Rate' }]
	);

	const stepTitles = [
		'Add your contact details',
		'Where do you teach?',
		"Set your base rate"
	];
	const stepSubtitles = [
		'Students will use this to reach you directly.',
		'Choose your home resort and sports.',
		'Your hourly rate for a private 1-on-1 lesson.'
	];
</script>

<div class="container mx-auto max-w-xl py-8">
	<!-- Header -->
	<div class="mb-8 text-center">
		<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
			<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		</div>
		<h1 class="title2 mb-1">{stepTitles[currentStep - 1]}</h1>
		<p class="text-sm text-muted-foreground">{stepSubtitles[currentStep - 1]}</p>
	</div>

	<!-- Step indicator -->
	<div class="mb-8 flex items-center justify-center">
		{#each steps as step, i}
			{@const stepNum = i + 1}
			{@const isActive = stepNum === currentStep}
			{@const isDone = stepNum < currentStep}
			<div class="flex items-center">
				<div class="flex flex-col items-center gap-1">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
						{isDone
							? 'bg-green-600 text-white'
							: isActive
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground'}"
					>
						{#if isDone}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							{stepNum}
						{/if}
					</div>
					<span class="text-xs {isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}"
						>{step.label}</span
					>
				</div>
				{#if i < steps.length - 1}
					<div class="mx-3 mb-4 h-px w-10 bg-border"></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- ── STEP 1: Contact info ──────────────────────────────────────────── -->
	{#if currentStep === 1}
		<form
			method="POST"
			action="?/saveBasics"
			use:enhanceBasics
			enctype="multipart/form-data"
			class="space-y-5"
		>
			<!-- Phone -->
			<div class="grid grid-cols-[1fr_2fr] gap-3 items-end">
				<CountryCodeSelect form={basicsFormObj} name="professionalCountryCode" />
				<Form.Field form={basicsFormObj} name="professionalPhone">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								>Phone <span class="text-red-500">*</span></Form.Label
							>
							<Input
								{...props}
								bind:value={$basicsData.professionalPhone}
								placeholder="XXX XXX XXXX"
								autocomplete="tel"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<!-- Bio (optional) -->
			<Form.Field form={basicsFormObj} name="bio">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							Bio
							<span class="ml-1 text-xs text-muted-foreground">(optional)</span>
						</Form.Label>
						<Textarea
							{...props}
							bind:value={$basicsData.bio}
							placeholder="Tell students about your teaching style and experience…"
							rows={4}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Profile photo (optional) -->
			<Form.Field form={basicsFormObj} name="profileImage">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							Profile photo
							<span class="ml-1 text-xs text-muted-foreground">(optional)</span>
						</Form.Label>
						<Input
							{...props}
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							bind:files={$profileImageProxy}
							class="cursor-pointer"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Qualification certificate (required for verification) -->
		<Form.Field form={basicsFormObj} name="qualification">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>
						Qualification certificate
						<span class="ml-1 text-xs font-semibold text-red-600">Required for verification</span>
					</Form.Label>
					<Input
						{...props}
						type="file"
						accept="application/pdf"
						bind:files={$qualificationProxy}
						class="cursor-pointer"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						Upload your instructor certification document (PDF, max 10MB)
					</p>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Button type="submit" class="w-full" size="lg" disabled={$submittingBasics}>
				{#if $submittingBasics}
					<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					Saving…
				{:else}
					Continue →
				{/if}
			</Button>
		</form>

	<!-- ── STEP 2: Resort + Sports ───────────────────────────────────────── -->
	{:else if currentStep === 2}
		<form
			method="POST"
			action="?/saveTeaching"
			use:enhanceTeaching
			class="space-y-5"
		>
			<SearchResort form={teachingFormObj} name="resort" />

			<SportsCheckboxes form={teachingFormObj} name="sports" />

			<div class="flex gap-3">
				<a href="?step=1" class="flex-1">
					<Button variant="outline" class="w-full" type="button">← Back</Button>
				</a>
				<Button type="submit" class="flex-1" size="default" disabled={$submittingTeaching}>
					{#if $submittingTeaching}
						<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Saving…
					{:else}
						{isSchool ? 'Finish ✓' : 'Continue →'}
					{/if}
				</Button>
			</div>
		</form>

	<!-- ── STEP 3: Base rate (independent only) ─────────────────────────── -->
	{:else if currentStep === 3}
		<form method="POST" action="?/saveRate" use:enhanceRate class="space-y-5">
			<Form.Field form={rateFormObj} name="basePrice">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Hourly rate <span class="text-red-500">*</span></Form.Label>
						<Input
							{...props}
							type="number"
							min="0"
							bind:value={$rateData.basePrice}
							placeholder="e.g. 60"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<CurrencySelect form={rateFormObj} name="currency" />

			<p class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
				This is your base rate for 1–2 students. You can add group pricing, duration packages,
				and promo codes later from the Lessons page.
			</p>

			<div class="flex gap-3">
				<a href="?step=2" class="flex-1">
					<Button variant="outline" class="w-full" type="button">← Back</Button>
				</a>
				<Button type="submit" class="flex-1" disabled={$submittingRate}>
					{#if $submittingRate}
						<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Saving…
					{:else}
						Finish ✓
					{/if}
				</Button>
			</div>
		</form>
	{/if}

	<!-- Skip link -->
	<div class="mt-8 text-center">
		<a
			href="/dashboard"
			class="text-xs text-muted-foreground transition-colors hover:text-foreground"
		>
			Skip for now — I'll finish later
		</a>
	</div>
</div>
