<script lang="ts">
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { Input } from '$src/lib/components/ui/input';
	import * as Form from '$src/lib/components/ui/form';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import LessonPricingManager from '$src/features/Pricing/components/LessonPricingManager.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { lessonSchema } from '$src/features/Lessons/lib/lessonSchema';
	import { toast } from 'svelte-sonner';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	const form = superForm(data.lessonForm, {
		validators: zodClient(lessonSchema),
		dataType: 'json',
		onUpdated: ({ form }) => {
			if (form.valid && form.message) {
				toast.success('Base lesson saved successfully!');
				isEditing = false;
			}
		}
	});

	const { form: formData, enhance, delayed } = form;

	// Check if base lesson exists
	const hasBaseLesson = data.baseLesson !== null && data.baseLesson !== undefined;
	const baseLesson = data.baseLesson;

	const isSchoolInstructor = data.isSchoolInstructor ?? false;
	const affiliatedSchool = data.affiliatedSchool ?? null;
	const schoolBaseLesson = data.schoolBaseLesson ?? null;
	const schoolGroupTiers = data.schoolGroupTiers ?? [];
	const schoolDurationPackages = data.schoolDurationPackages ?? [];
	const hasSchoolFares = !!schoolBaseLesson;

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
			1: $t('sports_ski'),
			2: $t('sports_snowboard'),
			3: $t('sports_telemark')
		};
		return sportNames[sportId] || 'Unknown';
	};
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">{$t('lessons_page_title')}</h1>
		<p class="text-muted-foreground">
			{isSchoolInstructor ? $t('lessons_page_subtitle_school') : $t('lessons_page_subtitle')}
		</p>
	</div>

	<!-- School Fares Banner (read-only) for school instructors -->
	{#if isSchoolInstructor && affiliatedSchool}
		{#if hasSchoolFares}
			<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
				<div class="mb-3 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
					</svg>
					<h2 class="text-sm font-semibold text-blue-800">
						{$t('lessons_school_fares_title', { schoolName: affiliatedSchool.name })}
					</h2>
				</div>
				<p class="mb-4 text-sm text-blue-700">
					{$t('lessons_school_fares_desc')}
				</p>
				<!-- School base rate (read-only) -->
				<div class="rounded-md bg-white border border-blue-100 p-3">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs text-blue-600 mb-1">{$t('lessons_school_base_rate')}</p>
							<div class="flex items-baseline gap-1">
								<span class="text-2xl font-bold text-blue-800">{schoolBaseLesson.basePrice}</span>
								<span class="text-sm text-blue-600">{schoolBaseLesson.currency}/h</span>
							</div>
						</div>
						{#if schoolGroupTiers.length > 0}
							<div class="text-right">
								<p class="text-xs text-blue-600">{schoolGroupTiers.length} {$t('lessons_group_tiers_count')}</p>
							</div>
						{/if}
						{#if schoolDurationPackages.length > 0}
							<div class="text-right">
								<p class="text-xs text-blue-600">{schoolDurationPackages.length} {$t('lessons_packages_count')}</p>
							</div>
						{/if}
					</div>
				</div>
				<p class="mt-3 text-xs text-blue-600 italic">
					{$t('lessons_school_fares_override_hint')}
				</p>
			</div>
		{:else}
			<div class="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
				<div class="flex items-start gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0 text-amber-600  mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
					<div>
						<p class="text-sm font-medium text-amber-800">
							{$t('lessons_school_no_fares_title', { schoolName: affiliatedSchool.name })}
						</p>
						<p class="mt-1 text-sm text-amber-700">
							{$t('lessons_school_no_fares_desc')}
						</p>
					</div>
				</div>
			</div>
		{/if}
	{/if}

	{#if hasBaseLesson && !isEditing}
	<!-- Unified Base Lesson Display -->
	<Card.Root class="border-2">
		<Card.Header>
			<div class="flex items-start justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						{$t('lessons_base_lesson_config')}
						<Badge variant="secondary" class="text-xs">{$t('status_active')}</Badge>
					</Card.Title>
					<Card.Description class="mt-1">
						{$t('lessons_base_lesson_config_desc')}
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
					{$t('button_edit')}
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
					{$t('lessons_hourly_rate_label')}
				</h3>
				<div class="rounded-lg bg-muted p-4">
					<div class="flex items-baseline gap-2">
						<span class="text-3xl font-bold">{baseLesson?.basePrice}</span>
						<span class="text-lg text-muted-foreground">{baseLesson?.currency}/{$t('form_label_hours').toLowerCase()}</span>
					</div>
					<p class="mt-1 text-sm text-muted-foreground">{$t('lessons_rate_help_text')}</p>
				</div>
			</div>

			<!-- Sports Display -->
			<div>
				<h3 class="mb-3 text-sm font-medium flex items-center gap-2">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					{$t('lessons_available_sports')}
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
					<strong>💡 {$t('lessons_flexible_pricing_info')}</strong>
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Pricing Manager - Advanced Options -->
	<div class="mt-6">
		<div class="mb-4">
			<h2 class="title3 mb-1">{$t('lessons_advanced_pricing')}</h2>
			<p class="text-sm text-muted-foreground">
				{$t('lessons_advanced_pricing_desc')}
			</p>
		</div>
		<LessonPricingManager
			lesson={baseLesson}
			groupTiers={data.groupTiers || []}
			durationPackages={data.durationPackages || []}
			promoCodes={data.promoCodes || []}
		/>
	</div>
{:else}
		<!-- Edit/Create Form -->
		<Card.Root>
			<Card.Header>
				<Card.Title>
					{hasBaseLesson ? $t('lessons_edit_base_lesson') : $t('lessons_create_base_lesson')}
				</Card.Title>
				<Card.Description>
					{$t('lessons_form_description')}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form method="POST" action="?/saveBaseLesson" use:enhance class="space-y-6">
					<!-- Sports Selection -->
					<div>
						<label class="text-sm font-medium mb-2 block">
							{$t('lessons_sports_label')} <span class="text-red-500">*</span>
						</label>
						<SportsCheckboxes {form} name="sports" />
						<p class="text-xs text-muted-foreground mt-2">
							{$t('lessons_sports_help')}
						</p>
					</div>

					<!-- Pricing -->
					<div class="grid gap-4 sm:grid-cols-3">
						<Form.Field {form} name="basePrice" class="sm:col-span-2">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{$t('lessons_hourly_rate_label')} <span class="text-red-500">*</span></Form.Label>
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
										{$t('lessons_hourly_rate_help')}
									</Form.Description>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<CurrencySelect {form} name="currency" />
					</div>

					<!-- Info Notice -->
					<div class="rounded-md border border-yellow-200 bg-yellow-50 p-4 ">
						<div class="flex gap-3">
							<svg class="h-5 w-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
							</svg>
							<div class="text-sm text-yellow-800 ">
								<p class="font-medium">{$t('lessons_about_base_lesson')}</p>
								<p class="mt-1">{$t('lessons_about_base_lesson_text')}</p>
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
								{$t('button_cancel')}
							</Button>
						{/if}
						<Button type="submit" disabled={$delayed} class="flex-1">
							{#if $delayed}
								<span class="flex items-center gap-2">
									<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{$t('button_saving')}
								</span>
							{:else}
								{hasBaseLesson ? $t('lessons_button_update') : $t('lessons_button_save')}
							{/if}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Additional Info Section -->
	<Card.Root class="mt-6">
		<Card.Header>
			<Card.Title class="text-base">{$t('lessons_multi_sport_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3 text-sm text-muted-foreground">
			<p>
				{$t('lessons_multi_sport_desc')}
			</p>
			<ul class="space-y-2">
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>{$t('lessons_multi_sport_bullet1')}</span>
				</li>
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>{$t('lessons_multi_sport_bullet2')}</span>
				</li>
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>{$t('lessons_multi_sport_bullet3')}</span>
				</li>
			</ul>
			<p class="text-xs italic">
				{$t('lessons_multi_sport_tip')}
			</p>
		</Card.Content>
	</Card.Root>
</div>
