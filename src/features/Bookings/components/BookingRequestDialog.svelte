<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Input } from '$src/lib/components/ui/input';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import { Button } from '$src/lib/components/ui/button';
	import * as Select from '$src/lib/components/ui/select';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Separator } from '$src/lib/components/ui/separator';
	import GoogleBtn from '$src/lib/components/shared/GoogleBtn.svelte';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { bookingRequestSchema } from '$src/features/Bookings/lib/bookingRequestSchema';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';

	let { 
		instructorId,
		lessonId,
		instructorName,
		baseLesson,
		open = $bindable(false),
		isAuthenticated = false
	}: {
		instructorId: number;
		lessonId: number;
		instructorName: string;
		baseLesson: any;
		open: boolean;
		isAuthenticated: boolean;
	} = $props();

	let currentView = $state<'login' | 'signup' | 'booking'>('booking');
	let priceEstimate = $state<any>(null);
	let isCalculatingPrice = $state(false);

	const form = superForm({
        instructorId,
        numberOfStudents: 1,
        startDate: '',
        endDate: '',
        hoursPerDay: 1,
        sports: baseLesson?.sports || [],
        skillLevel: 'intermediate',
        clientName: '',
        clientEmail: '',
        clientCountryCode: 34, // Default to Spain
        clientPhone: '',
        message: '',
        promoCode: ''
    }, {
        validators: zodClient(bookingRequestSchema),
        SPA: true,
        dataType: 'json'
    });

	const { form: formData, enhance } = form;

	let isSubmitting = $state(false);
	let submitSuccess = $state(false);
	let submitError = $state('');

	$effect(() => {
		if (open) {
			if (!isAuthenticated) {
				currentView = 'login';
			} else {
				currentView = 'booking';
			}
			submitSuccess = false;
			submitError = '';
		}
	});

	// Calculate price estimate whenever relevant fields change
	$effect(() => {
		// Create a dependency on all fields that affect pricing
		const deps = [
			$formData.numberOfStudents,
			$formData.startDate,
			$formData.endDate,
			$formData.hoursPerDay,
			$formData.promoCode
		];
		
		if (
			$formData.numberOfStudents &&
			$formData.startDate &&
			$formData.hoursPerDay &&
			baseLesson
		) {
			calculatePriceEstimate();
		}
	});

	async function calculatePriceEstimate() {
		isCalculatingPrice = true;
		try {
			const response = await fetch(`/api/pricing/calculate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					lessonId: baseLesson.id,
					basePrice: baseLesson.basePrice,
					currency: baseLesson.currency,
					numberOfStudents: $formData.numberOfStudents,
					startDate: $formData.startDate,
					endDate: $formData.endDate || null,
					hoursPerDay: $formData.hoursPerDay,
					promoCode: $formData.promoCode || null
				})
			});

			if (response.ok) {
				priceEstimate = await response.json();
			}
		} catch (error) {
			console.error('Error calculating price:', error);
		} finally {
			isCalculatingPrice = false;
		}
	}

	async function handleBooking(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		submitError = '';
		submitSuccess = false;

		try {
			const response = await fetch(`/instructors/${instructorId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...$formData,
					estimatedPrice: priceEstimate?.totalPrice,
					currency: baseLesson.currency
				})
			});

			if (response.ok) {
				submitSuccess = true;
				setTimeout(() => {
					open = false;
					submitSuccess = false;
				}, 2500);
			} else {
				const error = await response.json();
				submitError = error.message || 'Failed to submit request';
			}
		} catch (err) {
			submitError = 'An error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	const skillLevels = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' },
		{ value: 'expert', label: 'Expert' }
	];

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDate = tomorrow.toISOString().split('T')[0];

	let availableSports = $derived(baseLesson?.sports || []);
    
    // Map sport IDs to names
    const sportNames: Record<number, string> = {
        1: 'Ski',
        2: 'Snowboard',
        3: 'Telemark'
    };
</script>

<Dialog.Root bind:open modal={true}>
	<Dialog.Content 
		class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
		onInteractOutside={(e) => e.preventDefault()}
	>
		{#if currentView === 'booking'}
			<Dialog.Header>
				<Dialog.Title>Request a Lesson with {instructorName}</Dialog.Title>
				<Dialog.Description>
					Fill out the details below to get an accurate price estimate and send your booking request.
				</Dialog.Description>
			</Dialog.Header>

			{#if submitSuccess}
				<div class="my-4 rounded-lg bg-green-50 p-4 text-green-800">
					<div class="flex items-start gap-3">
						<svg class="size-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div>
							<p class="font-semibold">Request Sent Successfully!</p>
							<p class="mt-1 text-sm">{instructorName} will contact you to confirm details.</p>
						</div>
					</div>
				</div>
			{/if}

			{#if submitError}
				<div class="my-4 rounded-lg bg-red-50 p-4 text-red-800">
					<p class="text-sm">{submitError}</p>
				</div>
			{/if}

			<form onsubmit={handleBooking} class="space-y-6">
				<!-- Personal Info -->
				<div class="space-y-4">
					<h3 class="font-medium">Your Information</h3>
					
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1.5 block text-sm font-medium">
								Name <span class="text-red-500">*</span>
							</label>
							<Input bind:value={$formData.clientName} required disabled={isSubmitting || submitSuccess} />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium">
								Email <span class="text-red-500">*</span>
							</label>
							<Input type="email" bind:value={$formData.clientEmail} required disabled={isSubmitting || submitSuccess} />
						</div>
					</div>

					<div class="flex w-full flex-col gap-2 sm:flex-row">
						<CountryCodeSelect {form} name="clientCountryCode" />
						<div class="w-full">
							<label class="mb-1.5 block text-sm font-medium">
								Phone Number <span class="text-red-500">*</span>
							</label>
							<Input 
								type="tel" 
								bind:value={$formData.clientPhone} 
								required 
								disabled={isSubmitting || submitSuccess}
								placeholder="123 456 7890"
							/>
						</div>
					</div>
				</div>

				<Separator />

				<!-- Lesson Details -->
				<div class="space-y-4">
					<h3 class="font-medium">Lesson Details</h3>

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1.5 block text-sm font-medium">
								Number of Students <span class="text-red-500">*</span>
							</label>
							<Input type="number" min="1" max="20" bind:value={$formData.numberOfStudents} required disabled={isSubmitting || submitSuccess} />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium">
								Hours per Day <span class="text-red-500">*</span>
							</label>
							<Input type="number" min="1" max="6" step="1" bind:value={$formData.hoursPerDay} required disabled={isSubmitting || submitSuccess} />
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1.5 block text-sm font-medium">
								Start Date <span class="text-red-500">*</span>
							</label>
							<Input type="date" min={minDate} bind:value={$formData.startDate} required disabled={isSubmitting || submitSuccess} />
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium">
								End Date (optional)
							</label>
							<Input type="date" min={$formData.startDate || minDate} bind:value={$formData.endDate} disabled={isSubmitting || submitSuccess} />
						</div>
					</div>

					<div>
						<label class="mb-1.5 block text-sm font-medium">
							Sports <span class="text-red-500">*</span>
						</label>
						<div class="flex flex-wrap gap-3">
							{#each availableSports as sportId}
								<label class="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										value={sportId}
										checked={$formData.sports.includes(sportId)}
										onchange={(e) => {
											if (e.currentTarget.checked) {
												$formData.sports = [...$formData.sports, sportId];
											} else {
												$formData.sports = $formData.sports.filter(id => id !== sportId);
											}
										}}
										disabled={isSubmitting || submitSuccess}
										class="h-4 w-4 rounded border-gray-300"
									/>
									<span class="text-sm">{sportNames[sportId]}</span>
								</label>
							{/each}
						</div>
						{#if $formData.sports.length === 0}
							<p class="mt-1 text-xs text-red-600">Please select at least one sport</p>
						{/if}
					</div>

					<div>
						<label class="mb-1.5 block text-sm font-medium">
							Skill Level <span class="text-red-500">*</span>
						</label>
						<Select.Root bind:value={$formData.skillLevel} disabled={isSubmitting || submitSuccess}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select level" />
							</Select.Trigger>
							<Select.Content>
								{#each skillLevels as level}
									<Select.Item value={level.value}>{level.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<label class="mb-1.5 block text-sm font-medium">Promo Code (optional)</label>
						<Input bind:value={$formData.promoCode} placeholder="Enter promo code" disabled={isSubmitting || submitSuccess} />
					</div>

					<div>
						<label class="mb-1.5 block text-sm font-medium">Additional Information</label>
						<Textarea
							bind:value={$formData.message}
							placeholder="Tell the instructor about your goals, experience, or special requirements..."
							rows={4}
							disabled={isSubmitting || submitSuccess}
						/>
					</div>
				</div>

				<!-- Price Estimate -->
				{#if priceEstimate}
					<div class="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
						<div class="mb-3 flex items-center justify-between">
							<h3 class="font-medium">Estimated Price</h3>
							{#if isCalculatingPrice}
								<Badge variant="secondary">Calculating...</Badge>
							{/if}
						</div>

						<div class="space-y-2 text-sm">
							{#each priceEstimate.breakdown as item}
								<div class="flex justify-between">
									<span class="text-muted-foreground">{item.description}</span>
									<span class={item.amount < 0 ? 'text-green-600 font-medium' : ''}>
										{item.amount > 0 ? '+' : ''}{item.amount}{priceEstimate.currency}
									</span>
								</div>
							{/each}
							<Separator class="my-2" />
							<div class="flex justify-between text-lg font-bold">
								<span>Total</span>
								<span class="text-primary">{priceEstimate.totalPrice}{priceEstimate.currency}</span>
							</div>
							<div class="text-xs text-muted-foreground text-center">
								{priceEstimate.pricePerPerson}{priceEstimate.currency} per person
								{#if priceEstimate.numberOfDays > 1}
									 × {priceEstimate.numberOfDays} days
								{/if}
							</div>
						</div>

						<p class="mt-3 text-xs text-muted-foreground italic">
							💡 This is an estimate. Final price will be confirmed by the instructor.
						</p>
					</div>
				{/if}

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
							Sending...
						{:else if submitSuccess}
							Sent!
						{:else}
							Send Request
						{/if}
					</Button>
				</div>

				<p class="text-center text-xs text-muted-foreground pt-2">
					By submitting, you agree the instructor will contact you directly.
				</p>
			</form>
		{:else if currentView === 'signup'}
			<Dialog.Header>
				<Dialog.Title>Create Account</Dialog.Title>
				<Dialog.Description>
					Join Local Snow to book lessons with certified instructors
				</Dialog.Description>
			</Dialog.Header>

			{#if submitError}
				<div class="my-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
					<p class="text-sm">{submitError}</p>
				</div>
			{/if}

			<form onsubmit={handleSignup} class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="signup-name" class="mb-1.5 block text-sm font-medium">
							First Name <span class="text-red-500">*</span>
						</label>
						<Input
							id="signup-name"
							bind:value={signupData.name}
							required
							disabled={isSubmitting}
							placeholder="John"
						/>
					</div>
					<div>
						<label for="signup-lastname" class="mb-1.5 block text-sm font-medium">
							Last Name <span class="text-red-500">*</span>
						</label>
						<Input
							id="signup-lastname"
							bind:value={signupData.lastName}
							required
							disabled={isSubmitting}
							placeholder="Doe"
						/>
					</div>
				</div>

				<div>
					<label for="signup-email" class="mb-1.5 block text-sm font-medium">
						Email <span class="text-red-500">*</span>
					</label>
					<Input
						id="signup-email"
						type="email"
						bind:value={signupData.email}
						required
						disabled={isSubmitting}
						placeholder="your@email.com"
					/>
				</div>

				<div>
					<label for="signup-password" class="mb-1.5 block text-sm font-medium">
						Password <span class="text-red-500">*</span>
					</label>
					<Input
						id="signup-password"
						type="password"
						bind:value={signupData.password}
						required
						disabled={isSubmitting}
						placeholder="••••••••"
						minlength="8"
					/>
					<p class="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
				</div>

				<div>
					<label for="signup-confirm" class="mb-1.5 block text-sm font-medium">
						Confirm Password <span class="text-red-500">*</span>
					</label>
					<Input
						id="signup-confirm"
						type="password"
						bind:value={signupData.confirmPassword}
						required
						disabled={isSubmitting}
						placeholder="••••••••"
					/>
				</div>

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
					<Button type="submit" class="flex-1" disabled={isSubmitting}>
						{#if isSubmitting}
							Creating account...
						{:else}
							Sign Up
						{/if}
					</Button>
				</div>
			</form>

			<div class="my-4 flex flex-col items-center">
				<Separator class="w-full" />
				<span class="my-2 text-xs text-muted-foreground">or</span>
				<GoogleBtn>Sign up with Google</GoogleBtn>
			</div>

			<div class="text-center">
				<button
					onclick={() => currentView = 'login'}
					class="text-sm text-primary hover:underline"
				>
					Already have an account? Login
				</button>
			</div>

		{:else}
			<Dialog.Header>
				<Dialog.Title>Request a Lesson with {instructorName}</Dialog.Title>
				<Dialog.Description>
					Fill out the form below and {instructorName} will get back to you within 24 hours.
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
								{instructorName} will contact you to confirm details.
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#if submitError}
				<div class="my-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
					<p class="text-sm">{submitError}</p>
				</div>
			{/if}

			<form onsubmit={handleBooking} class="space-y-4">
				<div class="w-full">
					<label for="clientName" class="mb-1.5 block text-sm font-medium">
						Your Name <span class="text-red-500">*</span>
					</label>
					<Input
						id="clientName"
						bind:value={bookingData.clientName}
						required
						placeholder="John Doe"
						disabled={isSubmitting || submitSuccess}
					/>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="clientEmail" class="mb-1.5 block text-sm font-medium">
							Email <span class="text-red-500">*</span>
						</label>
						<Input
							id="clientEmail"
							type="email"
							bind:value={bookingData.clientEmail}
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
							bind:value={bookingData.clientPhone}
							placeholder="+1 234 567 8900"
							disabled={isSubmitting || submitSuccess}
						/>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="preferredDate" class="mb-1.5 block text-sm font-medium">
							Preferred Date <span class="text-red-500">*</span>
						</label>
						<Input
							id="preferredDate"
							type="date"
							bind:value={bookingData.preferredDate}
							required
							disabled={isSubmitting || submitSuccess}
							min={minDate}
						/>
					</div>
					<div>
						<label for="lessonType" class="mb-1.5 block text-sm font-medium">
							Lesson Type <span class="text-red-500">*</span>
						</label>
						<Select.Root bind:value={bookingData.lessonType} disabled={isSubmitting || submitSuccess}>
							<Select.Trigger id="lessonType" class="w-full">
								<Select.Value placeholder="Select type" />
							</Select.Trigger>
							<Select.Content>
								{#each lessonTypes as type}
									<Select.Item value={type.value}>{type.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="numberOfPeople" class="mb-1.5 block text-sm font-medium">
							Number of People
						</label>
						<Input
							id="numberOfPeople"
							type="number"
							bind:value={bookingData.numberOfPeople}
							min="1"
							max="10"
							disabled={isSubmitting || submitSuccess}
						/>
					</div>
					<div>
						<label for="skillLevel" class="mb-1.5 block text-sm font-medium">
							Skill Level <span class="text-red-500">*</span>
						</label>
						<Select.Root bind:value={bookingData.skillLevel} disabled={isSubmitting || submitSuccess}>
							<Select.Trigger id="skillLevel" class="w-full">
								<Select.Value placeholder="Select level" />
							</Select.Trigger>
							<Select.Content>
								{#each skillLevels as level}
									<Select.Item value={level.value}>{level.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<div>
					<label for="message" class="mb-1.5 block text-sm font-medium">
						Additional Information
					</label>
					<Textarea
						id="message"
						bind:value={bookingData.message}
						placeholder="Tell the instructor about your goals, experience, or special requirements..."
						rows={4}
						disabled={isSubmitting || submitSuccess}
					/>
				</div>

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
							Sending...
						{:else if submitSuccess}
							Sent!
						{:else}
							Send Request
						{/if}
					</Button>
				</div>

				<p class="text-center text-xs text-muted-foreground pt-2">
					By submitting, you agree the instructor will contact you directly.
				</p>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>