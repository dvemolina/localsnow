<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Input } from '$src/lib/components/ui/input';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import { Button } from '$src/lib/components/ui/button';
	import * as Select from '$src/lib/components/ui/select';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Separator } from '$src/lib/components/ui/separator';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { bookingRequestSchema } from '$src/features/Bookings/lib/bookingRequestSchema';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import AvailabilityCalendar from '$src/features/Availability/components/AvailabilityCalendar.svelte';
	import { toast } from 'svelte-sonner';
	import { getSportName } from '$src/features/Sports/lib/sportsConstants';
	import * as m from '$lib/paraglide/messages';

	let { 
		instructorId,
		lessonId,
		instructorName,
		baseLesson,
		open = $bindable(false),
		isAuthenticated = false,
		user = null
	}: {
		instructorId: number;
		lessonId: number;
		instructorName: string;
		baseLesson: any;
		open: boolean;
		isAuthenticated: boolean;
		user?: any;
	} = $props();

	let priceEstimate = $state<any>(null);
	let isCalculatingPrice = $state(false);
	let calendarSelection = $state<{
		startDate: string;
		endDate: string;
		timeSlots: string[];
		totalHours: number;
	} | null>(null);

	const form = superForm({
        instructorId,
        numberOfStudents: 1,
        startDate: '',
        endDate: '',
        hoursPerDay: 1,
        sports: baseLesson?.sports || [],
        skillLevel: 'intermediate',
        clientName: isAuthenticated && user ? `${user.name} ${user.lastName}` : '',
        clientEmail: isAuthenticated && user ? user.email : '',
        clientCountryCode: isAuthenticated && user?.countryCode ? user.countryCode : 34,
        clientPhone: isAuthenticated && user?.phone ? user.phone : '',
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

	function handleCalendarChange(selection: {
		startDate: string;
		endDate: string;
		timeSlots: string[];
		totalHours: number;
	}) {
		calendarSelection = selection;
		
		// Update form data
		$formData.startDate = selection.startDate;
		$formData.endDate = selection.endDate;
		$formData.hoursPerDay = selection.timeSlots.length;

		// Trigger price calculation
		if (selection.timeSlots.length > 0) {
			calculatePriceEstimate();
		}
	}

	$effect(() => {
		if (open) {
			submitSuccess = false;
			submitError = '';
			calendarSelection = null;
		}
	});

	async function calculatePriceEstimate() {
		if (!calendarSelection || calendarSelection.timeSlots.length === 0 || !baseLesson) return;

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
					startDate: calendarSelection.startDate,
					endDate: calendarSelection.endDate,
					hoursPerDay: calendarSelection.timeSlots.length,
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

	// Recalculate when students or promo code changes
	$effect(() => {
		const deps = [$formData.numberOfStudents, $formData.promoCode];
		if (calendarSelection && calendarSelection.timeSlots.length > 0) {
			calculatePriceEstimate();
		}
	});

	async function handleBooking(e: Event) {
		e.preventDefault();
		
		if (!calendarSelection || calendarSelection.timeSlots.length === 0) {
			toast.error('Please select dates and time slots');
			return;
		}

		isSubmitting = true;
		submitError = '';

		try {
			// ✅ NEW: Single API call that returns checkout URL
			const response = await fetch(`/api/bookings/create`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...$formData,
					startDate: calendarSelection.startDate,
					endDate: calendarSelection.endDate,
					hoursPerDay: calendarSelection.timeSlots.length,
					timeSlots: calendarSelection.timeSlots,
					estimatedPrice: priceEstimate?.totalPrice,
					currency: baseLesson.currency
				})
			});

			if (!response.ok) {
				const error = await response.json();
				submitError = error.message || 'Failed to create booking';
				return;
			}

			const result = await response.json();
			
			// ✅ Redirect to Stripe Checkout
			if (result.checkoutUrl) {
				window.location.href = result.checkoutUrl;
			} else {
				submitError = 'Failed to create payment session';
			}
		} catch (err) {
			submitError = 'An error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	const skillLevels = $derived([
		{ value: 'beginner', label: m.levels_beginner() },
		{ value: 'intermediate', label: m.levels_intermediate() },
		{ value: 'advanced', label: m.levels_advanced() },
		{ value: 'expert', label: m.levels_expert() }
	]);

	let availableSports = $derived(baseLesson?.sports || []);

	let validationError = $state<string | null>(null);
	let requiresPayment = $state(false);
	let activeRequestCount = $state(0);
	let isValidating = $state(false);

	// Validate when email changes (with debounce)
	let validationTimeout: ReturnType<typeof setTimeout>;
	$effect(() => {
		if ($formData.clientEmail && $formData.clientEmail.includes('@')) {
			clearTimeout(validationTimeout);
			validationTimeout = setTimeout(() => {
				validateBookingRequest();
			}, 500);
		}
	});

	async function validateBookingRequest() {
		if (!$formData.clientEmail) return;
		
		isValidating = true;
		validationError = null;
		requiresPayment = false;

		try {
			const response = await fetch('/api/bookings/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					instructorId,
					clientEmail: $formData.clientEmail
				})
			});

			const result = await response.json();
			
			if (!result.allowed) {
				validationError = result.reason;
				requiresPayment = result.requiresPayment || false;
				activeRequestCount = result.activeCount || 0;
			} else {
				activeRequestCount = result.activeCount || 0;
			}
		} catch (error) {
			console.error('Validation error:', error);
		} finally {
			isValidating = false;
		}
	}
</script>

<Dialog.Root bind:open modal={true}>
	<Dialog.Content 
		class="max-h-[90vh] overflow-y-auto sm:max-w-[700px]"
		onInteractOutside={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>Request a Lesson with {instructorName}</Dialog.Title>
			<Dialog.Description>
				{#if !isAuthenticated}
					Create an account or log in to send your booking request.
				{:else}
					Select your preferred dates and times, then complete your details.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if !isAuthenticated}
			<div class="space-y-6 py-6">
				<div class="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
					<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-8 text-primary"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
					</div>
					<h3 class="title4 mb-2">Sign in to Continue</h3>
					<p class="mb-6 text-sm text-muted-foreground">
						Create a free account or log in to send your booking request to {instructorName}.
					</p>

					<div class="space-y-3">
						<Button 
							onclick={() => window.location.href = `/oauth/google?returnTo=${encodeURIComponent(window.location.pathname + '?openBooking=true')}`}
							class="w-full"
							size="lg"
							variant="outline"
						>
							<svg class="mr-2 size-5" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continue with Google
						</Button>

						<div class="flex items-center gap-3">
							<div class="h-px flex-1 bg-border"></div>
							<span class="text-xs text-muted-foreground">or</span>
							<div class="h-px flex-1 bg-border"></div>
						</div>

						<Button 
							onclick={() => window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + '?openBooking=true')}`}
							class="w-full"
							size="lg"
							variant="default"
						>
							Log In
						</Button>

						<Button 
							onclick={() => window.location.href = `/signup?returnTo=${encodeURIComponent(window.location.pathname + '?openBooking=true')}`}
							class="w-full"
							size="lg"
							variant="secondary"
						>
							Create Account
						</Button>
					</div>

					<p class="mt-6 text-xs text-muted-foreground">
						🔒 Your information is secure. We'll redirect you back here after signing in.
					</p>
				</div>

				<div class="rounded-lg border border-border bg-muted/50 p-4">
					<h4 class="mb-3 text-sm font-medium">Why create an account?</h4>
					<ul class="space-y-2 text-xs text-muted-foreground">
						<li class="flex items-start gap-2">
							<svg class="mt-0.5 size-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span>Track all your booking requests in one place</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="mt-0.5 size-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span>Save your details for faster future bookings</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="mt-0.5 size-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span>Get updates on your lesson requests</span>
						</li>
					</ul>
				</div>
			</div>
		{:else if submitSuccess}
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
		{:else}
			{#if submitError}
				<div class="my-4 rounded-lg bg-red-50 p-4 text-red-800">
					<p class="text-sm">{submitError}</p>
				</div>
			{/if}

			<form onsubmit={handleBooking} class="space-y-6">
				<!-- Calendar Selection -->
				<div class="space-y-4">
					<h3 class="font-medium">When do you need lessons?</h3>
					<AvailabilityCalendar 
						{instructorId} 
						onSelectionChange={handleCalendarChange}
					/>
				</div>

				<Separator />

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
								Skill Level <span class="text-red-500">*</span>
							</label>
							<Select.Root type='single' bind:value={$formData.skillLevel} disabled={isSubmitting || submitSuccess}>
								<Select.Trigger class="w-full">
									{#if $formData.skillLevel}
										{skillLevels.find((lvl) => lvl.value === $formData.skillLevel)?.label}
									{:else}
										Select skill level
									{/if}
								</Select.Trigger>

								<Select.Content>
									{#each skillLevels as level (level.value)}
										<Select.Item value={level.value}>{level.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
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
									<span class="text-sm">{getSportName(sportId)}</span>
								</label>
							{/each}
						</div>
						{#if $formData.sports.length === 0}
							<p class="mt-1 text-xs text-red-600">Please select at least one sport</p>
						{/if}
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

				<!-- Deposit Information -->
				<div class="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
					<div class="mb-3 flex items-center gap-2">
						<svg class="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<h3 class="font-medium text-blue-900">€15 Refundable Deposit Required</h3>
					</div>
					
					<div class="space-y-2 text-sm text-blue-800">
						<p class="flex items-start gap-2">
							<svg class="mt-0.5 size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							<span>Fully refundable if no instructor accepts within 48 hours</span>
						</p>
						<p class="flex items-start gap-2">
							<svg class="mt-0.5 size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							<span>Refunded after lesson completion</span>
						</p>
						<p class="flex items-start gap-2">
							<svg class="mt-0.5 size-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							<span>Protects against no-shows</span>
						</p>
					</div>
				</div>

				<!-- Add validation warning before submit button -->
				{#if validationError}
					<div class="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
						<div class="flex items-start gap-3">
							<svg class="size-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<div>
								<p class="font-semibold">Request Limit Reached</p>
								<p class="mt-1 text-sm">{validationError}</p>
								{#if requiresPayment}
									<Button class="mt-3" size="sm" onclick={() => window.location.href = '/pricing/additional-request'}>
										Pay €2 for Additional Request
									</Button>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Request counter -->
				{#if activeRequestCount > 0 && !validationError}
					<div class="rounded-lg bg-blue-50 p-3 text-blue-800">
						<p class="text-sm">
							📊 You have {activeRequestCount} active request{activeRequestCount === 1 ? '' : 's'}. 
							{3 - activeRequestCount} free request{3 - activeRequestCount === 1 ? '' : 's'} remaining.
						</p>
					</div>
				{/if}

				<div class="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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
						disabled={
							isSubmitting || 
							submitSuccess || 
							!calendarSelection || 
							calendarSelection.timeSlots.length === 0 ||
							!!validationError ||
							isValidating
						}
					>
						{#if isValidating}
							Validating...
						{:else if isSubmitting}
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