<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import { t } from '$lib/i18n/i18n';
	import { invalidateAll } from '$app/navigation';

	let {
		open = $bindable(false),
		instructorLessons = []
	}: {
		open: boolean;
		instructorLessons: any[];
	} = $props();

	// Form state
	let clientName = $state('');
	let clientEmail = $state('');
	let clientCountryCode = $state(34);
	let clientPhone = $state('');
	let numberOfStudents = $state(1);
	let startDate = $state('');
	let startTime = $state('10:00'); // New time field
	let endDate = $state('');
	let endTime = $state(''); // Optional end time
	let hoursPerDay = $state(2);
	let skillLevel = $state('intermediate');
	let selectedLessonId = $state<number | null>(null);
	let manualPrice = $state<number | null>(null);
	let currency = $state('€');
	let notes = $state('');
	let message = $state('');

	let isSubmitting = $state(false);
	let submitSuccess = $state(false);

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			submitSuccess = false;
			clientName = '';
			clientEmail = '';
			clientCountryCode = 34;
			clientPhone = '';
			numberOfStudents = 1;
			startDate = '';
			startTime = '10:00';
			endDate = '';
			endTime = '';
			hoursPerDay = 2;
			skillLevel = 'intermediate';
			selectedLessonId = instructorLessons[0]?.id || null;
			manualPrice = null;
			currency = '€';
			notes = '';
			message = '';
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		try {
			// Client-side validation
			if (!clientName || !clientName.trim()) {
				toast.error($t('error_name_required') || 'Client name is required');
				isSubmitting = false;
				return;
			}

			if (!startDate) {
				toast.error($t('error_start_date_required') || 'Start date is required');
				isSubmitting = false;
				return;
			}

			if (manualPrice && manualPrice < 0) {
				toast.error($t('error_invalid_price') || 'Price must be positive');
				isSubmitting = false;
				return;
			}

			// Format phone number
			const fullPhone = clientPhone ? `+${clientCountryCode} ${clientPhone}` : undefined;

			// Format dates with time for API
			const startDateTime = new Date(`${startDate}T${startTime || '10:00'}`).toISOString();
			const endDateTime = endDate
				? new Date(`${endDate}T${endTime || startTime || '10:00'}`).toISOString()
				: null;

			// Submit to API
			const response = await fetch('/api/bookings/manual', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					clientName: clientName.trim(),
					clientEmail: clientEmail.trim() || undefined, // Optional now
					clientPhone: fullPhone,
					numberOfStudents,
					startDate: startDateTime,
					endDate: endDateTime,
					hoursPerDay,
					skillLevel,
					lessonId: selectedLessonId,
					manualPrice,
					currency,
					notes: notes.trim() || undefined,
					message: message.trim() || undefined
				})
			});

			const result = await response.json();

			if (!response.ok) {
				if (response.status === 429) {
					toast.error($t('error_rate_limit') || 'Too many requests. Please try again later.');
				} else if (response.status === 400) {
					toast.error(result.message || $t('error_validation_failed') || 'Please check your input');
				} else {
					toast.error($t('error_add_booking_failed') || 'Failed to add booking. Please try again.');
				}
				isSubmitting = false;
				return;
			}

			// Success
			submitSuccess = true;
			toast.success($t('success_booking_added') || 'Booking added successfully!');

			// Refresh data
			await invalidateAll();

			// Close dialog after short delay
			setTimeout(() => {
				open = false;
			}, 1500);
		} catch (error) {
			console.error('Error adding manual booking:', error);
			toast.error($t('error_add_booking_failed') || 'Failed to add booking. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	const skillLevels = $derived([
		{ value: 'beginner', label: $t('skill_beginner') || 'Beginner' },
		{ value: 'intermediate', label: $t('skill_intermediate') || 'Intermediate' },
		{ value: 'advanced', label: $t('skill_advanced') || 'Advanced' }
	]);
</script>

<Dialog.Root bind:open modal={true}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
		<Dialog.Header>
			<Dialog.Title>{$t('add_manual_booking_title') || 'Add Manual Booking'}</Dialog.Title>
			<Dialog.Description>
				{$t('add_manual_booking_description') || 'Add a client you acquired outside LocalSnow to keep track of all your bookings in one place'}
			</Dialog.Description>
		</Dialog.Header>

		{#if submitSuccess}
			<div class="flex flex-col items-center gap-4 py-8">
				<div class="flex size-16 items-center justify-center rounded-full bg-green-100">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-8 text-green-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<p class="text-center text-sm text-muted-foreground">
					{$t('booking_added_success_message') || 'Booking added successfully!'}
				</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Client Information Section -->
				<div class="space-y-4">
					<h3 class="text-sm font-semibold">{$t('label_client_information') || 'Client Information'}</h3>

					<!-- Name -->
					<div class="space-y-2">
						<Label for="clientName">
							{$t('label_name') || 'Name'} <span class="text-destructive">*</span>
						</Label>
						<Input
							id="clientName"
							type="text"
							bind:value={clientName}
							placeholder={$t('placeholder_client_name') || 'Client name'}
							maxlength={100}
							required
							disabled={isSubmitting}
						/>
					</div>

					<!-- Email -->
					<div class="space-y-2">
						<Label for="clientEmail">
							{$t('label_email') || 'Email'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
						</Label>
						<Input
							id="clientEmail"
							type="email"
							bind:value={clientEmail}
							placeholder={$t('placeholder_client_email') || 'client@example.com'}
							disabled={isSubmitting}
						/>
						<p class="text-xs text-muted-foreground">
							{$t('email_help_text') || 'Required to send review link after lesson. Can add later.'}
						</p>
					</div>

					<!-- Phone -->
					<div class="space-y-2">
						<Label for="clientPhone">
							{$t('label_phone') || 'Phone'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
						</Label>
						<div class="flex gap-2">
							<Select.Root
								selected={{ value: clientCountryCode, label: `+${clientCountryCode}` }}
								onSelectedChange={(selected) => {
									if (selected?.value) clientCountryCode = selected.value;
								}}
							>
								<Select.Trigger class="w-[120px]" disabled={isSubmitting}>
									<Select.Value placeholder="+34" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value={1}>+1 (USA/Canada)</Select.Item>
									<Select.Item value={34}>+34 (Spain)</Select.Item>
									<Select.Item value={33}>+33 (France)</Select.Item>
									<Select.Item value={39}>+39 (Italy)</Select.Item>
									<Select.Item value={49}>+49 (Germany)</Select.Item>
									<Select.Item value={44}>+44 (UK)</Select.Item>
								</Select.Content>
							</Select.Root>
							<Input
								id="clientPhone"
								type="tel"
								bind:value={clientPhone}
								placeholder="123 456 789"
								class="flex-1"
								disabled={isSubmitting}
							/>
						</div>
					</div>
				</div>

				<!-- Booking Details Section -->
				<div class="space-y-4 border-t pt-4">
					<h3 class="text-sm font-semibold">{$t('label_booking_details') || 'Booking Details'}</h3>

					<!-- Lesson/Service -->
					{#if instructorLessons.length > 0}
						<div class="space-y-2">
							<Label for="lesson">{$t('label_lesson_service') || 'Lesson/Service'}</Label>
							<Select.Root
								selected={{
									value: selectedLessonId,
									label: instructorLessons.find(l => l.id === selectedLessonId)?.title || 'Select lesson'
								}}
								onSelectedChange={(selected) => {
									if (selected?.value) selectedLessonId = selected.value;
								}}
							>
								<Select.Trigger disabled={isSubmitting}>
									<Select.Value />
								</Select.Trigger>
								<Select.Content>
									{#each instructorLessons as lesson}
										<Select.Item value={lesson.id}>{lesson.title}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					{/if}

					<!-- Dates and Times -->
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="startDate">
									{$t('label_start_date') || 'Start Date'} <span class="text-destructive">*</span>
								</Label>
								<Input
									id="startDate"
									type="date"
									bind:value={startDate}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div class="space-y-2">
								<Label for="startTime">
									{$t('label_start_time') || 'Start Time'}
								</Label>
								<Input
									id="startTime"
									type="time"
									bind:value={startTime}
									disabled={isSubmitting}
								/>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="endDate">
									{$t('label_end_date') || 'End Date'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
								</Label>
								<Input
									id="endDate"
									type="date"
									bind:value={endDate}
									disabled={isSubmitting}
								/>
							</div>
							<div class="space-y-2">
								<Label for="endTime">
									{$t('label_end_time') || 'End Time'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
								</Label>
								<Input
									id="endTime"
									type="time"
									bind:value={endTime}
									disabled={isSubmitting}
								/>
							</div>
						</div>
					</div>

					<!-- Students and Hours -->
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="numberOfStudents">{$t('label_number_of_students') || 'Number of students'}</Label>
							<Input
								id="numberOfStudents"
								type="number"
								bind:value={numberOfStudents}
								min={1}
								max={20}
								disabled={isSubmitting}
							/>
						</div>
						<div class="space-y-2">
							<Label for="hoursPerDay">{$t('label_hours_per_day') || 'Hours per day'}</Label>
							<Input
								id="hoursPerDay"
								type="number"
								bind:value={hoursPerDay}
								min={1}
								max={12}
								step={0.5}
								disabled={isSubmitting}
							/>
						</div>
					</div>

					<!-- Skill Level -->
					<div class="space-y-2">
						<Label for="skillLevel">{$t('label_skill_level') || 'Skill level'}</Label>
						<Select.Root
							selected={{ value: skillLevel, label: skillLevels.find(s => s.value === skillLevel)?.label || 'Intermediate' }}
							onSelectedChange={(selected) => {
								if (selected?.value) skillLevel = selected.value;
							}}
						>
							<Select.Trigger disabled={isSubmitting}>
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								{#each skillLevels as level}
									<Select.Item value={level.value}>{level.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Price -->
					<div class="grid grid-cols-3 gap-4">
						<div class="col-span-2 space-y-2">
							<Label for="manualPrice">
								{$t('label_price') || 'Price'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
							</Label>
							<Input
								id="manualPrice"
								type="number"
								bind:value={manualPrice}
								min={0}
								step={1}
								placeholder={$t('placeholder_price') || 'Enter price'}
								disabled={isSubmitting}
							/>
							<p class="text-xs text-muted-foreground">
								{$t('price_help_text') || 'Leave empty if not agreed yet'}
							</p>
						</div>
						<div class="space-y-2">
							<Label for="currency">{$t('label_currency') || 'Currency'}</Label>
							<Select.Root
								selected={{ value: currency, label: currency }}
								onSelectedChange={(selected) => {
									if (selected?.value) currency = selected.value;
								}}
							>
								<Select.Trigger disabled={isSubmitting}>
									<Select.Value />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="€">€ (EUR)</Select.Item>
									<Select.Item value="$">$ (USD)</Select.Item>
									<Select.Item value="£">£ (GBP)</Select.Item>
									<Select.Item value="CHF">CHF</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<!-- Message (Optional) -->
					<div class="space-y-2">
						<Label for="message">
							{$t('label_message') || 'Message'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
						</Label>
						<Textarea
							id="message"
							bind:value={message}
							placeholder={$t('placeholder_booking_message') || 'Any additional details about the booking...'}
							rows={3}
							maxlength={1000}
							disabled={isSubmitting}
						/>
					</div>

					<!-- Private Notes -->
					<div class="space-y-2">
						<Label for="notes">
							{$t('label_private_notes') || 'Private Notes'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
						</Label>
						<Textarea
							id="notes"
							bind:value={notes}
							placeholder={$t('placeholder_private_notes') || 'Private notes (only visible to you)...'}
							rows={3}
							maxlength={1000}
							disabled={isSubmitting}
						/>
						<p class="text-xs text-muted-foreground">
							{$t('notes_help_text') || 'These notes are private and won\'t be visible to the client'}
						</p>
					</div>
				</div>

				<!-- Submit Buttons -->
				<div class="flex justify-end gap-2 pt-4">
					<Button
						type="button"
						variant="outline"
						onclick={() => (open = false)}
						disabled={isSubmitting}
					>
						{$t('button_cancel') || 'Cancel'}
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<svg
								class="mr-2 size-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							{$t('button_adding') || 'Adding...'}
						{:else}
							{$t('button_add_booking') || 'Add Booking'}
						{/if}
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
