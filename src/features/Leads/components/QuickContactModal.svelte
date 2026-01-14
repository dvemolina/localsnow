<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import { t } from '$lib/i18n/i18n';

	let {
		instructorId,
		instructorName,
		open = $bindable(false),
		isAuthenticated = false,
		user = null
	}: {
		instructorId: number;
		instructorName: string;
		open: boolean;
		isAuthenticated: boolean;
		user?: any;
	} = $props();

	// Form state - Basic contact info
	let clientName = $state(isAuthenticated && user ? `${user.name} ${user.lastName || ''}`.trim() : '');
	let clientEmail = $state(isAuthenticated && user ? user.email : '');
	let clientPhone = $state(isAuthenticated && user?.phone ? user.phone : '');
	let message = $state('');

	// Form state - Lesson details (optional)
	let preferredDates = $state('');
	let numberOfStudents = $state<number | null>(null);
	let skillLevel = $state<string>('');

	let isSubmitting = $state(false);
	let submitSuccess = $state(false);

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			submitSuccess = false;
			// Re-initialize with user data if authenticated
			clientName = isAuthenticated && user ? `${user.name} ${user.lastName || ''}`.trim() : '';
			clientEmail = isAuthenticated && user ? user.email : '';
			clientPhone = isAuthenticated && user?.phone ? user.phone : '';
			message = '';
			// Reset lesson details
			preferredDates = '';
			numberOfStudents = null;
			skillLevel = '';
		}
	});

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

			// Submit to API
			const response = await fetch(`/api/instructors/${instructorId}/contact`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					clientName: clientName.trim() || undefined,
					clientEmail: clientEmail.trim(),
					clientPhone: clientPhone.trim() || undefined,
					message: message.trim(),
					preferredDates: preferredDates.trim() || undefined,
					numberOfStudents: numberOfStudents || undefined,
					skillLevel: skillLevel || undefined
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
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{$t('contact_instructor_title') || `Contact ${instructorName}`}</Dialog.Title>
			<Dialog.Description>
				{$t('contact_instructor_description') || `Send a quick message to ${instructorName}. They'll get back to you soon.`}
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
			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- Name (Optional) -->
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

				<!-- Email (Required) -->
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

				<!-- Phone (Optional) -->
				<div class="space-y-2">
					<Label for="clientPhone">
						{$t('label_phone') || 'Phone'} <span class="text-xs text-muted-foreground">({$t('label_optional') || 'Optional'})</span>
					</Label>
					<Input
						id="clientPhone"
						type="tel"
						bind:value={clientPhone}
						placeholder={$t('placeholder_your_phone') || '+34 123 456 789'}
						maxlength={20}
						disabled={isSubmitting}
					/>
				</div>

				<!-- Lesson Details Section Header -->
				<div class="border-t pt-4">
					<p class="text-sm font-medium text-muted-foreground mb-3">
						{$t('contact_lesson_details_optional') || 'Lesson Details (Optional)'}
					</p>

					<div class="space-y-3">
						<!-- Preferred Dates (Optional) -->
						<div class="space-y-2">
							<Label for="preferredDates">
								{$t('label_preferred_dates') || 'When are you planning to ski?'}
							</Label>
							<Input
								id="preferredDates"
								type="text"
								bind:value={preferredDates}
								placeholder={$t('placeholder_preferred_dates') || 'e.g., January 15-20, 2026'}
								maxlength={100}
								disabled={isSubmitting}
							/>
						</div>

						<!-- Number of Students (Optional) -->
						<div class="space-y-2">
							<Label for="numberOfStudents">
								{$t('label_number_of_students') || 'Number of students'}
							</Label>
							<Select.Root
								onSelectedChange={(selected) => {
									numberOfStudents = selected?.value ? parseInt(selected.value) : null;
								}}
							>
								<Select.Trigger disabled={isSubmitting}>
									<Select.Value placeholder={$t('placeholder_select_number') || 'Select number'} />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="1">{$t('students_one') || '1 student'}</Select.Item>
									<Select.Item value="2">{$t('students_two') || '2 students'}</Select.Item>
									<Select.Item value="3">{$t('students_three') || '3 students'}</Select.Item>
									<Select.Item value="4">{$t('students_four') || '4 students'}</Select.Item>
									<Select.Item value="5">{$t('students_five_plus') || '5+ students'}</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>

						<!-- Skill Level (Optional) -->
						<div class="space-y-2">
							<Label for="skillLevel">
								{$t('label_skill_level') || 'Skill level'}
							</Label>
							<Select.Root
								onSelectedChange={(selected) => {
									skillLevel = selected?.value || '';
								}}
							>
								<Select.Trigger disabled={isSubmitting}>
									<Select.Value placeholder={$t('placeholder_select_level') || 'Select level'} />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="beginner">{$t('skill_beginner') || 'Beginner'}</Select.Item>
									<Select.Item value="intermediate">{$t('skill_intermediate') || 'Intermediate'}</Select.Item>
									<Select.Item value="advanced">{$t('skill_advanced') || 'Advanced'}</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>
				</div>

				<!-- Message (Required) -->
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

				<!-- Submit Button -->
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
