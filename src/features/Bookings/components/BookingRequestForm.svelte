<script lang="ts">
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import { Button } from '$src/lib/components/ui/button';
	import * as Select from '$src/lib/components/ui/select';

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
</script>

<div class="rounded-lg border border-border bg-card p-6 shadow-md">
	<h2 class="title4 mb-2">Request a Lesson</h2>
	<p class="mb-6 text-sm text-muted-foreground">
		Fill out the form below and {instructorName} will get back to you to confirm availability and finalize
		details.
	</p>

	{#if submitSuccess}
		<div class="mb-6 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200">
			<p class="font-medium">Request Sent Successfully! ✓</p>
			<p class="mt-1 text-sm">
				{instructorName} will contact you within 24 hours to confirm your lesson details.
			</p>
		</div>
	{/if}

	{#if submitError}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
			<p class="font-medium">Error</p>
			<p class="mt-1 text-sm">{submitError}</p>
		</div>
	{/if}

	<form onsubmit={handleSubmit} class="space-y-4">
		<!-- Client Name -->
		<div class="w-full">
			<label for="clientName" class="mb-1 block text-sm font-medium">Your Name *</label>
			<Input
				id="clientName"
				bind:value={formData.clientName}
				required
				placeholder="John Doe"
				disabled={isSubmitting}
			/>
		</div>

		<!-- Email & Phone Row -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="clientEmail" class="mb-1 block text-sm font-medium">Email *</label>
				<Input
					id="clientEmail"
					type="email"
					bind:value={formData.clientEmail}
					required
					placeholder="john@example.com"
					disabled={isSubmitting}
				/>
			</div>
			<div>
				<label for="clientPhone" class="mb-1 block text-sm font-medium">Phone</label>
				<Input
					id="clientPhone"
					type="tel"
					bind:value={formData.clientPhone}
					placeholder="+1 234 567 8900"
					disabled={isSubmitting}
				/>
			</div>
		</div>

		<!-- Preferred Date & Lesson Type Row -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="preferredDate" class="mb-1 block text-sm font-medium">Preferred Date *</label>
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
				<label for="lessonType" class="mb-1 block text-sm font-medium">Lesson Type *</label>
				<Select.Root bind:value={formData.lessonType}>
					<Select.Trigger disabled={isSubmitting}>
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
				<label for="numberOfPeople" class="mb-1 block text-sm font-medium">Number of People</label>
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
				<label for="skillLevel" class="mb-1 block text-sm font-medium">Skill Level *</label>
				<Select.Root bind:value={formData.skillLevel} required>
					<Select.Trigger disabled={isSubmitting}>
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
			<label for="message" class="mb-1 block text-sm font-medium">Additional Information</label>
			<Textarea
				id="message"
				bind:value={formData.message}
				placeholder="Any special requests, goals, or questions..."
				rows={4}
				disabled={isSubmitting}
			/>
			<p class="mt-1 text-xs text-muted-foreground">
				Optional: Tell the instructor about your goals, experience, or any special requirements
			</p>
		</div>

		<!-- Submit Button -->
		<Button type="submit" class="w-full" disabled={isSubmitting}>
			{#if isSubmitting}
				Sending Request...
			{:else}
				Send Lesson Request
			{/if}
		</Button>

		<p class="text-center text-xs text-muted-foreground">
			By submitting this form, you agree that the instructor will contact you directly to finalize
			booking details and pricing.
		</p>
	</form>
</div>