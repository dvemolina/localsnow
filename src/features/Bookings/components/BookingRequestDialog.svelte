<!-- src/features/Instructors/components/BookingRequestDialog.svelte -->
<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Input } from '$src/lib/components/ui/input';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import { Button } from '$src/lib/components/ui/button';
	import * as Select from '$src/lib/components/ui/select';

	let { 
		instructorId, 
		instructorName,
		open = $bindable(false)
	}: {
		instructorId: number;
		instructorName: string;
		open: boolean;
	} = $props();

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
				
				// Close dialog after 2 seconds to show success message
				setTimeout(() => {
					open = false;
					submitSuccess = false;
				}, 2500);
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

	const lessonTypes = [
		{ value: 'private', label: 'Private Lesson' },
		{ value: 'group', label: 'Group Lesson' },
		{ value: 'half-day', label: 'Half Day' },
		{ value: 'full-day', label: 'Full Day' }
	];

	const skillLevels = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' },
		{ value: 'expert', label: 'Expert' }
	];

	// Get tomorrow's date as minimum date
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDate = tomorrow.toISOString().split('T')[0];
</script>

<Dialog.Root bind:open modal={true}>
	<Dialog.Content 
		class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
		onInteractOutside={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>Request a Lesson with {instructorName}</Dialog.Title>
			<Dialog.Description>
				Fill out the form below and {instructorName} will get back to you within 24 hours to confirm
				availability and finalize details.
			</Dialog.Description>
		</Dialog.Header>

		{#if submitSuccess}
			<div class="my-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200">
				<div class="flex items-start gap-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-6 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div>
						<p class="font-semibold">Request Sent Successfully!</p>
						<p class="mt-1 text-sm">
							{instructorName} will contact you at {formData.clientEmail} to confirm your lesson details.
						</p>
					</div>
				</div>
			</div>
		{/if}

		{#if submitError}
			<div class="my-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
				<div class="flex items-start gap-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-6 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div>
						<p class="font-semibold">Error</p>
						<p class="mt-1 text-sm">{submitError}</p>
					</div>
				</div>
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Client Name -->
			<div class="w-full">
				<label for="clientName" class="mb-1.5 block text-sm font-medium">
					Your Name <span class="text-red-500">*</span>
				</label>
				<Input
					id="clientName"
					bind:value={formData.clientName}
					required
					placeholder="John Doe"
					disabled={isSubmitting || submitSuccess}
				/>
			</div>

			<!-- Email & Phone Row -->
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="clientEmail" class="mb-1.5 block text-sm font-medium">
						Email <span class="text-red-500">*</span>
					</label>
					<Input
						id="clientEmail"
						type="email"
						bind:value={formData.clientEmail}
						required
						placeholder="john@example.com"
						disabled={isSubmitting || submitSuccess}
					/>
				</div>
				<div>
					<label for="clientPhone" class="mb-1.5 block text-sm font-medium">
						Phone Number
					</label>
					<Input
						id="clientPhone"
						type="tel"
						bind:value={formData.clientPhone}
						placeholder="+1 234 567 8900"
						disabled={isSubmitting || submitSuccess}
					/>
				</div>
			</div>

			<!-- Preferred Date & Lesson Type Row -->
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="preferredDate" class="mb-1.5 block text-sm font-medium">
						Preferred Date <span class="text-red-500">*</span>
					</label>
					<Input
						id="preferredDate"
						type="date"
						bind:value={formData.preferredDate}
						required
						disabled={isSubmitting || submitSuccess}
						min={minDate}
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						Select your preferred lesson date
					</p>
				</div>
				<div>
					<label for="lessonType" class="mb-1.5 block text-sm font-medium">
						Lesson Type <span class="text-red-500">*</span>
					</label>
					<Select.Root bind:value={formData.lessonType} disabled={isSubmitting || submitSuccess}>
						<Select.Trigger id="lessonType" class="w-full">
							<Select.Value placeholder="Select lesson type" />
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
					<label for="numberOfPeople" class="mb-1.5 block text-sm font-medium">
						Number of People
					</label>
					<Input
						id="numberOfPeople"
						type="number"
						bind:value={formData.numberOfPeople}
						min="1"
						max="10"
						disabled={isSubmitting || submitSuccess}
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						How many people will be taking the lesson?
					</p>
				</div>
				<div>
					<label for="skillLevel" class="mb-1.5 block text-sm font-medium">
						Your Skill Level <span class="text-red-500">*</span>
					</label>
					<Select.Root bind:value={formData.skillLevel} disabled={isSubmitting || submitSuccess}>
						<Select.Trigger id="skillLevel" class="w-full">
							<Select.Value placeholder="Select your level" />
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
				<label for="message" class="mb-1.5 block text-sm font-medium">
					Additional Information
				</label>
				<Textarea
					id="message"
					bind:value={formData.message}
					placeholder="Tell the instructor about your goals, experience, or any special requirements..."
					rows={4}
					disabled={isSubmitting || submitSuccess}
				/>
				<p class="mt-1 text-xs text-muted-foreground">
					Optional: Share any specific goals, concerns, or questions you have
				</p>
			</div>

			<!-- Submit Button -->
			<div class="flex gap-3 pt-4">
				<Button 
					type="button" 
					variant="outline" 
					class="flex-1"
					onclick={() => open = false}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button 
					type="submit" 
					class="flex-1" 
					disabled={isSubmitting || submitSuccess}
				>
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
						Sending...
					{:else if submitSuccess}
						Sent!
					{:else}
						Send Request
					{/if}
				</Button>
			</div>

			<p class="text-center text-xs text-muted-foreground pt-2">
				By submitting, you agree that the instructor will contact you directly to finalize booking
				details and pricing.
			</p>
		</form>
	</Dialog.Content>
</Dialog.Root>