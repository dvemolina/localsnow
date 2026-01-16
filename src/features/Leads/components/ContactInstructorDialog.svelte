<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import AvailabilityCalendar from '$src/features/Availability/components/AvailabilityCalendar.svelte';
	import { toast } from 'svelte-sonner';
	import { getSportName } from '$src/features/Sports/lib/sportsConstants';
	import { t } from '$lib/i18n/i18n';

	let {
		instructorId,
		instructorName,
		baseLesson,
		open = $bindable(false),
		isAuthenticated = false,
		user = null
	}: {
		instructorId: number;
		instructorName: string;
		baseLesson?: any;
		open: boolean;
		isAuthenticated: boolean;
		user?: any;
	} = $props();

	// Form state - Basic contact info
	let clientName = $state(isAuthenticated && user ? `${user.name} ${user.lastName || ''}`.trim() : '');
	let clientEmail = $state(isAuthenticated && user ? user.email : '');
	let clientCountryCode = $state(isAuthenticated && user?.countryCode ? user.countryCode : 34);
	let clientPhone = $state(isAuthenticated && user?.phone ? user.phone : '');
	let message = $state('');

	// Form state - Lesson details (optional)
	let numberOfStudents = $state(1);
	let skillLevel = $state('intermediate');
	let selectedSports = $state<number[]>(baseLesson?.sports || []);
	let calendarSelection = $state<{
		startDate: string;
		endDate: string;
		timeSlots: string[];
		totalHours: number;
	} | null>(null);

	let isSubmitting = $state(false);
	let submitSuccess = $state(false);

	// Price estimation state
	let priceEstimate = $state<{
		totalPrice: number;
		pricePerPerson: number;
		currency: string;
		numberOfDays: number;
		breakdown: Array<{ description: string; amount: number; isDiscount: boolean }>;
	} | null>(null);
	let isCalculatingPrice = $state(false);

	// Available sports from base lesson
	let availableSports = $derived(baseLesson?.sports || []);

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			submitSuccess = false;
			// Re-initialize with user data if authenticated
			clientName = isAuthenticated && user ? `${user.name} ${user.lastName || ''}`.trim() : '';
			clientEmail = isAuthenticated && user ? user.email : '';
			clientCountryCode = isAuthenticated && user?.countryCode ? user.countryCode : 34;
			clientPhone = isAuthenticated && user?.phone ? user.phone : '';
			message = '';
			// Reset lesson details
			numberOfStudents = 1;
			skillLevel = 'intermediate';
			selectedSports = baseLesson?.sports || [];
			calendarSelection = null;
		}
	});

	function handleCalendarChange(selection: {
		startDate: string;
		endDate: string;
		timeSlots: string[];
		totalHours: number;
	}) {
		calendarSelection = selection;
	}

	// Calculate price estimate when calendar selection or number of students changes
	$effect(() => {
		if (calendarSelection && baseLesson && numberOfStudents > 0) {
			calculatePriceEstimate();
		} else {
			priceEstimate = null;
		}
	});

	async function calculatePriceEstimate() {
		if (!calendarSelection || !baseLesson) return;

		isCalculatingPrice = true;
		try {
			const response = await fetch('/api/pricing/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					lessonId: baseLesson.id,
					basePrice: baseLesson.basePrice,
					currency: baseLesson.currency,
					numberOfStudents,
					hoursPerDay: calendarSelection.timeSlots.length || 2,
					startDate: calendarSelection.startDate,
					endDate: calendarSelection.endDate || calendarSelection.startDate
				})
			});

			if (response.ok) {
				priceEstimate = await response.json();
			} else {
				console.error('Failed to calculate price estimate');
				priceEstimate = null;
			}
		} catch (error) {
			console.error('Error calculating price estimate:', error);
			priceEstimate = null;
		} finally {
			isCalculatingPrice = false;
		}
	}

	function formatDatesForDisplay(startDate: string, endDate: string): string {
		const start = new Date(startDate);
		const end = new Date(endDate);

		const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

		if (startDate === endDate) {
			return start.toLocaleDateString('en-US', options);
		} else {
			return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		try {
			// Client-side validation
			if (!clientEmail || !clientEmail.trim()) {
				toast.error($t('error_email_required') || 'Email is required');
				isSubmitting = false;
				return;
			}

			if (!message || message.trim().length < 10) {
				toast.error($t('error_message_too_short') || 'Message must be at least 10 characters');
				isSubmitting = false;
				return;
			}

			if (message.trim().length > 1000) {
				toast.error($t('error_message_too_long') || 'Message must be less than 1000 characters');
				isSubmitting = false;
				return;
			}

			// Format dates for preferredDates field
			let preferredDates: string | undefined = undefined;
			if (calendarSelection) {
				preferredDates = formatDatesForDisplay(calendarSelection.startDate, calendarSelection.endDate);
			}

			// Format phone number
			const fullPhone = clientPhone ? `+${clientCountryCode} ${clientPhone}` : undefined;

			// Submit to API
			const response = await fetch(`/api/instructors/${instructorId}/contact`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					clientName: clientName.trim() || undefined,
					clientEmail: clientEmail.trim(),
					clientPhone: fullPhone,
					message: message.trim(),
					preferredDates,
					numberOfStudents,
					skillLevel
				})
			});

			const result = await response.json();

			if (!response.ok) {
				if (response.status === 429) {
					toast.error($t('error_rate_limit') || 'Too many requests. Please try again later.');
				} else if (response.status === 400) {
					toast.error(result.message || $t('error_validation_failed') || 'Please check your input');
				} else {
					toast.error($t('error_send_message_failed') || 'Failed to send message. Please try again.');
				}
				isSubmitting = false;
				return;
			}

			// Success
			submitSuccess = true;
			toast.success($t('success_message_sent') || 'Your message has been sent successfully!');

			// Close dialog after short delay
			setTimeout(() => {
				open = false;
			}, 1500);
		} catch (error) {
			console.error('Error submitting contact form:', error);
			toast.error($t('error_send_message_failed') || 'Failed to send message. Please try again.');
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
			<Dialog.Title>{$t('contact_instructor_title') || `Contact ${instructorName}`}</Dialog.Title>
			<Dialog.Description>
				{$t('contact_instructor_description') || 'Send a message to the instructor. You can ask questions or request lesson details.'}
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
					{$t('contact_success_message') || 'Your message has been sent successfully!'}
				</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Client Information Section -->
				<div class="space-y-4">
					<h3 class="text-sm font-semibold">{$t('contact_your_information') || 'Your Information'}</h3>

					<!-- Name -->
					<div class="space-y-2">
						<Label for="clientName">
							{$t('label_name') || 'Name'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
						</Label>
						<Input
							id="clientName"
							type="text"
							bind:value={clientName}
							placeholder={$t('placeholder_your_name') || 'Your name'}
							maxlength={100}
							disabled={isSubmitting}
						/>
					</div>

					<!-- Email -->
					<div class="space-y-2">
						<Label for="clientEmail">
							{$t('label_email') || 'Email'} <span class="text-destructive">*</span>
						</Label>
						<Input
							id="clientEmail"
							type="email"
							bind:value={clientEmail}
							placeholder={$t('placeholder_your_email') || 'your.email@example.com'}
							required
							disabled={isSubmitting}
						/>
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
									<Select.Item value={41}>+41 (Switzerland)</Select.Item>
									<Select.Item value={43}>+43 (Austria)</Select.Item>
									<Select.Item value={351}>+351 (Portugal)</Select.Item>
									<Select.Item value={32}>+32 (Belgium)</Select.Item>
									<Select.Item value={31}>+31 (Netherlands)</Select.Item>
									<Select.Item value={46}>+46 (Sweden)</Select.Item>
									<Select.Item value={47}>+47 (Norway)</Select.Item>
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

				<!-- Lesson Details Section (Optional) -->
				<div class="space-y-4 border-t pt-4">
					<h3 class="text-sm font-semibold">{$t('contact_lesson_details_optional') || 'Lesson Details (Optional)'}</h3>
					<p class="text-xs text-muted-foreground">
						{$t('contact_lesson_details_help') || 'Provide lesson preferences to help the instructor prepare a quote'}
					</p>

					<!-- Calendar for Date Selection -->
					{#if instructorId}
						<div class="space-y-2">
							<Label>{$t('label_preferred_dates') || 'When would you like to ski?'}</Label>
							<AvailabilityCalendar
								{instructorId}
								onSelectionChange={handleCalendarChange}
								hideTimeSlots={true}
							/>
							{#if calendarSelection}
								<Badge variant="secondary" class="mt-2">
									{formatDatesForDisplay(calendarSelection.startDate, calendarSelection.endDate)}
								</Badge>
							{/if}
						</div>
					{/if}

					<!-- Number of Students -->
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

					<!-- Sports (if available) -->
					{#if availableSports.length > 0}
						<div class="space-y-2">
							<Label>{$t('label_sports') || 'Sports'}</Label>
							<div class="flex flex-wrap gap-2">
								{#each availableSports as sportId}
									<Badge variant="outline">
										{getSportName(sportId) || `Sport ${sportId}`}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Price Estimate (if calculated) -->
					{#if priceEstimate && calendarSelection}
						<div class="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium text-muted-foreground">
										{$t('label_estimated_price') || 'Estimated Price'}
									</p>
									<p class="text-xs text-muted-foreground mt-1">
										{$t('price_estimate_disclaimer') || 'This is an estimate. Final price may vary.'}
									</p>
								</div>
								<div class="text-right">
									<p class="text-3xl font-bold text-primary">
										{priceEstimate.totalPrice}{priceEstimate.currency}
									</p>
									{#if numberOfStudents > 1}
										<p class="text-xs text-muted-foreground">
											{priceEstimate.pricePerPerson}{priceEstimate.currency} {$t('label_per_person') || 'per person'}
										</p>
									{/if}
								</div>
							</div>

							<!-- Price Breakdown -->
							{#if priceEstimate.breakdown && priceEstimate.breakdown.length > 0}
								<div class="space-y-1 border-t pt-2">
									{#each priceEstimate.breakdown as item}
										<div class="flex items-center justify-between text-xs">
											<span class="text-muted-foreground">{item.description}</span>
											<span class={item.isDiscount ? 'text-green-600 font-medium' : 'font-medium'}>
												{item.isDiscount ? '-' : ''}{Math.abs(item.amount)}{priceEstimate.currency}
											</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else if isCalculatingPrice}
						<div class="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex items-center justify-center">
							<svg
								class="size-5 animate-spin text-primary mr-2"
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
							<span class="text-sm text-muted-foreground">{$t('label_calculating_price') || 'Calculating price...'}</span>
						</div>
					{/if}
				</div>

				<!-- Message Section -->
				<div class="space-y-2">
					<Label for="message">
						{$t('label_message') || 'Message'} <span class="text-destructive">*</span>
					</Label>
					<Textarea
						id="message"
						bind:value={message}
						placeholder={$t('placeholder_your_message') || 'Tell the instructor what you\'re looking for...'}
						rows={5}
						minlength={10}
						maxlength={1000}
						required
						disabled={isSubmitting}
					/>
					<p class="text-xs text-muted-foreground">
						{message.length}/1000 {$t('label_characters') || 'characters'}
					</p>
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
							{$t('button_sending') || 'Sending...'}
						{:else}
							{$t('button_send_message') || 'Send Message'}
						{/if}
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
