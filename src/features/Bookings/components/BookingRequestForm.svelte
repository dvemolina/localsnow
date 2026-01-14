<script lang="ts">
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import { Button } from '$src/lib/components/ui/button';
	import * as Select from '$src/lib/components/ui/select';
	import { t } from '$lib/i18n/i18n';
	let { instructorId, instructorName } = $props();

	let formData = $state({
		clientName: '',
		clientEmail: '',
		clientPhone: '',
		preferredDate: '',
		lessonType: 'private',
		numberOfPeople: '1',
		skillLevel: '',
		message: ''
	});

	let isSubmitting = $state(false);
	let submitSuccess = $state(false);
	let submitError = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		submitError = '';
		submitSuccess = false;

		try {
			const response = await fetch(`/instructors/${instructorId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...formData,
					instructorId
				})
			});

			if (response.ok) {
				submitSuccess = true;
				// Reset form
				formData = {
					clientName: '',
					clientEmail: '',
					clientPhone: '',
					preferredDate: '',
					lessonType: 'private',
					numberOfPeople: '1',
					skillLevel: '',
					message: ''
				};
			} else {
				const error = await response.json();
				submitError = error.message || 'Failed to submit request. Please try again.';
			}
		} catch (err) {
			submitError = 'An error occurred. Please try again later.';
			console.error('Booking request error:', err);
		} finally {
			isSubmitting = false;
		}
	}

	const lessonTypes = $derived([
		{ value: 'private', label: $t('lesson_type_private') },
		{ value: 'group', label: $t('lesson_type_group') },
		{ value: 'half-day', label: $t('lesson_type_half_day') },
		{ value: 'full-day', label: $t('lesson_type_full_day') }
	]);

	const skillLevels = $derived([
		{ value: 'beginner', label: $t('skill_level_beginner') },
		{ value: 'intermediate', label: $t('skill_level_intermediate') },
		{ value: 'advanced', label: $t('skill_level_advanced') },
		{ value: 'expert', label: $t('skill_level_expert') }
	]);
</script>

<div class="rounded-lg border border-border bg-card p-6 shadow-md">
	<h2 class="title4 mb-2">{$t('booking_form_title')}</h2>
	<p class="mb-6 text-sm text-muted-foreground">
		{$t('booking_form_subtitle', { values: { name: instructorName } })}
	</p>

	{#if submitSuccess}
		<div class="mb-6 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200">
			<p class="font-medium">{$t('booking_form_success')} ✓</p>
			<p class="mt-1 text-sm">
				{$t('booking_form_success_message', { values: { name: instructorName } })}
			</p>
		</div>
	{/if}

	{#if submitError}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
			<p class="font-medium">{$t('error_title')}</p>
			<p class="mt-1 text-sm">{submitError}</p>
		</div>
	{/if}

	<form onsubmit={handleSubmit} class="space-y-4">
		<!-- Client Name -->
		<div class="w-full">
			<label for="clientName" class="mb-1 block text-sm font-medium">{$t('form_label_your_name')} *</label>
			<Input
				id="clientName"
				bind:value={formData.clientName}
				required
				placeholder={$t('form_placeholder_your_name')}
				disabled={isSubmitting}
			/>
		</div>

		<!-- Email & Phone Row -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="clientEmail" class="mb-1 block text-sm font-medium">{$t('form_label_email')} *</label>
				<Input
					id="clientEmail"
					type="email"
					bind:value={formData.clientEmail}
					required
					placeholder={$t('form_placeholder_email')}
					disabled={isSubmitting}
				/>
			</div>
			<div>
				<label for="clientPhone" class="mb-1 block text-sm font-medium">{$t('form_label_phone')}</label>
				<Input
					id="clientPhone"
					type="tel"
					bind:value={formData.clientPhone}
					placeholder={$t('form_placeholder_phone')}
					disabled={isSubmitting}
				/>
			</div>
		</div>

		<!-- Preferred Date & Lesson Type Row -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="preferredDate" class="mb-1 block text-sm font-medium">{$t('form_label_preferred_date')} *</label>
				<Input
					id="preferredDate"
					type="date"
					bind:value={formData.preferredDate}
					required
					disabled={isSubmitting}
					min={new Date().toISOString().split('T')[0]}
				/>
			</div>
			<div>
				<label for="lessonType" class="mb-1 block text-sm font-medium">{$t('form_label_lesson_type')} *</label>
				<Select.Root bind:value={formData.lessonType}>
					<Select.Trigger disabled={isSubmitting}>
						<Select.Value placeholder={$t('form_placeholder_select_lesson_type')} />
					</Select.Trigger>
					<Select.Content>
						{#each lessonTypes as type}
							<Select.Item value={type.value}>{type.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Number of People & Skill Level Row -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="numberOfPeople" class="mb-1 block text-sm font-medium">{$t('form_label_number_of_people')}</label>
				<Input
					id="numberOfPeople"
					type="number"
					bind:value={formData.numberOfPeople}
					min="1"
					max="10"
					disabled={isSubmitting}
				/>
			</div>
			<div>
				<label for="skillLevel" class="mb-1 block text-sm font-medium">{$t('form_label_skill_level')} *</label>
				<Select.Root bind:value={formData.skillLevel} required>
					<Select.Trigger disabled={isSubmitting}>
						<Select.Value placeholder={$t('form_placeholder_select_level')} />
					</Select.Trigger>
					<Select.Content>
						{#each skillLevels as level}
							<Select.Item value={level.value}>{level.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Message -->
		<div>
			<label for="message" class="mb-1 block text-sm font-medium">{$t('form_label_additional_info')}</label>
			<Textarea
				id="message"
				bind:value={formData.message}
				placeholder={$t('form_placeholder_additional_info')}
				rows={4}
				disabled={isSubmitting}
			/>
			<p class="mt-1 text-xs text-muted-foreground">
				{$t('form_help_additional_info')}
			</p>
		</div>

		<!-- Submit Button -->
		<Button type="submit" class="w-full" disabled={isSubmitting}>
			{#if isSubmitting}
				{$t('button_sending_request')}
			{:else}
				{$t('button_send_lesson_request')}
			{/if}
		</Button>

		<p class="text-center text-xs text-muted-foreground">
			{$t('booking_form_disclaimer')}
		</p>
	</form>
</div>