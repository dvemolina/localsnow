<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Form from '$lib/components/ui/form';
	import { Badge } from '$lib/components/ui/badge';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import CurrencySelect from '$lib/components/shared/CurrencySelect.svelte';
	import LessonPricingManager from '$src/features/Pricing/components/LessonPricingManager.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { lessonSchema } from '$src/features/Lessons/lib/lessonSchema';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { school, baseLesson, groupTiers, durationPackages, promoCodes } = $derived(data);

	const form = superForm(data.lessonForm, {
		validators: zodClient(lessonSchema),
		dataType: 'json',
		onUpdated: ({ form }) => {
			if (form.valid && form.message) {
				toast.success('School base lesson saved successfully!');
				isEditing = false;
			}
		}
	});

	const { form: formData, enhance, delayed } = form;

	const hasBaseLesson = $derived(baseLesson !== null && baseLesson !== undefined);
	let isEditing = $state(false);

	// Pre-populate form if editing
	$effect(() => {
		if (isEditing && baseLesson) {
			$formData.basePrice = baseLesson.basePrice;
			$formData.currency = baseLesson.currency;
			$formData.sports = baseLesson.sports;
		}
	});

	// Helper to get sport name from ID
	const getSportName = (sportId: number) => {
		const sportNames: Record<number, string> = {
			1: m.sports_ski(),
			2: m.sports_snowboard(),
			3: m.sports_telemark()
		};
		return sportNames[sportId] || 'Unknown';
	};
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-3xl font-bold mb-2">School Lessons & Pricing</h1>
		<p class="text-muted-foreground">
			Manage pricing for all instructors in {school.name}
		</p>
	</div>

	<!-- Info Card -->
	<Card.Root class="border-blue-200 bg-blue-50 mb-6">
		<Card.Header>
			<Card.Title class="text-blue-900">School Pricing</Card.Title>
			<Card.Description class="text-blue-700">
				The pricing you set here will automatically apply to all instructors in your school. Instructors cannot set their own prices while part of your school.
			</Card.Description>
		</Card.Header>
	</Card.Root>

	{#if hasBaseLesson && !isEditing}
		<!-- Unified Base Lesson Display -->
		<Card.Root class="border-2">
			<Card.Header>
				<div class="flex items-start justify-between">
					<div>
						<Card.Title class="flex items-center gap-2">
							{m.lessons_base_lesson_config()}
							<Badge variant="secondary" class="text-xs">{m.status_active()}</Badge>
						</Card.Title>
						<Card.Description class="mt-1">
							{m.lessons_base_lesson_config_desc()}
						</Card.Description>
					</div>
					<Button
						variant="outline"
						size="sm"
						onclick={() => isEditing = true}
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						{m.button_edit()}
					</Button>
				</div>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Price Display -->
				<div>
					<h3 class="mb-3 text-sm font-medium flex items-center gap-2">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						{m.lessons_hourly_rate_label()}
					</h3>
					<div class="rounded-lg bg-muted p-4">
						<div class="flex items-baseline gap-2">
							<span class="text-3xl font-bold">{baseLesson?.basePrice}</span>
							<span class="text-lg text-muted-foreground">{baseLesson?.currency}/{m.form_label_hours().toLowerCase()}</span>
						</div>
						<p class="mt-1 text-sm text-muted-foreground">{m.lessons_rate_help_text()}</p>
					</div>
				</div>

				<!-- Sports Display -->
				<div>
					<h3 class="mb-3 text-sm font-medium flex items-center gap-2">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						{m.lessons_available_sports()}
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each baseLesson?.sports as sportId}
							<Badge variant="outline" class="text-sm">
								{getSportName(sportId)}
							</Badge>
						{/each}
					</div>
				</div>

				<!-- Info Box -->
				<div class="rounded-md bg-blue-50 p-3">
					<p class="text-sm text-blue-800">
						<strong>💡 {m.lessons_flexible_pricing_info()}</strong>
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Pricing Manager - Advanced Options -->
		<div class="mt-6">
			<div class="mb-4">
				<h2 class="text-2xl font-bold mb-1">{m.lessons_advanced_pricing()}</h2>
				<p class="text-sm text-muted-foreground">
					{m.lessons_advanced_pricing_desc()}
				</p>
			</div>
			<LessonPricingManager
				lesson={baseLesson}
				groupTiers={groupTiers || []}
				durationPackages={durationPackages || []}
				promoCodes={promoCodes || []}
			/>
		</div>
	{:else}
		<!-- Edit/Create Form -->
		<Card.Root>
			<Card.Header>
				<Card.Title>
					{hasBaseLesson ? m.lessons_edit_base_lesson() : m.lessons_create_base_lesson()}
				</Card.Title>
				<Card.Description>
					{m.lessons_form_description()}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form method="POST" action="?/saveBaseLesson" use:enhance class="space-y-6">
					<!-- Sports Selection -->
					<div role="group" aria-labelledby="sports-label">
						<div id="sports-label" class="text-sm font-medium mb-2 block">
							{m.lessons_sports_label()} <span class="text-red-500">*</span>
						</div>
						<SportsCheckboxes {form} name="sports" />
						<p class="text-xs text-muted-foreground mt-2">
							{m.lessons_sports_help()}
						</p>
					</div>

					<!-- Pricing -->
					<div class="grid gap-4 sm:grid-cols-3">
						<Form.Field {form} name="basePrice" class="sm:col-span-2">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{m.lessons_hourly_rate_label()} <span class="text-red-500">*</span></Form.Label>
									<Input
										{...props}
										bind:value={$formData.basePrice}
										type="number"
										min="0"
										step="1"
										disabled={$delayed}
										placeholder="50"
									/>
									<Form.Description class="text-xs">
										{m.lessons_hourly_rate_help()}
									</Form.Description>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<CurrencySelect {form} name="currency" />
					</div>

					<!-- Info Notice -->
					<div class="rounded-md border border-blue-200 bg-blue-50 p-4">
						<div class="flex gap-3">
							<svg class="h-5 w-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
							</svg>
							<div class="text-sm text-blue-800">
								<p class="font-medium">About School Pricing</p>
								<p class="mt-1">This base rate will apply to all instructors in your school. You can add group tiers, packages, and promo codes after saving the base lesson.</p>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3 pt-4">
						{#if hasBaseLesson}
							<Button
								type="button"
								variant="outline"
								onclick={() => isEditing = false}
								disabled={$delayed}
							>
								{m.button_cancel()}
							</Button>
						{/if}
						<Button type="submit" disabled={$delayed} class="flex-1">
							{#if $delayed}
								<span class="flex items-center gap-2">
									<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{m.button_saving()}
								</span>
							{:else}
								{hasBaseLesson ? m.lessons_button_update() : m.lessons_button_save()}
							{/if}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- How It Works Section -->
	<Card.Root class="mt-6">
		<Card.Header>
			<Card.Title>How School Pricing Works</Card.Title>
		</Card.Header>
		<Card.Content>
			<ul class="space-y-2 text-sm text-muted-foreground">
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Set base hourly rates for your school's lessons</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Create group pricing tiers (e.g., 1-2 students, 3-4 students)</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Offer duration packages (e.g., half-day, full-day)</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Create promo codes for special discounts</span>
				</li>
				<li class="flex gap-2">
					<span class="text-blue-600">→</span>
					<span>All pricing automatically applies to your school instructors' profiles</span>
				</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>
