<!-- src/features/Bookings/components/BookingRequestDialog.svelte -->
<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import { Input } from '$src/lib/components/ui/input';
	import { Textarea } from '$src/lib/components/ui/textarea';
	import { Button } from '$src/lib/components/ui/button';
	import * as Select from '$src/lib/components/ui/select';
	import GoogleBtn from '$src/lib/components/shared/GoogleBtn.svelte';
	import { Separator } from '$src/lib/components/ui/separator';

	let { 
		instructorId, 
		instructorName,
		open = $bindable(false),
		isAuthenticated = false // Pass from parent
	}: {
		instructorId: number;
		instructorName: string;
		open: boolean;
		isAuthenticated: boolean;
	} = $props();

	// View state: 'login' | 'signup' | 'booking'
	let currentView = $state<'login' | 'signup' | 'booking'>('booking');

	// Authentication forms
	let loginData = $state({
		email: '',
		password: ''
	});

	let signupData = $state({
		name: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: ''
	});

	// Booking form data
	let bookingData = $state({
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

	// When dialog opens, check auth status and set view
	$effect(() => {
		if (open) {
			if (!isAuthenticated) {
				currentView = 'login';
			} else {
				currentView = 'booking';
			}
			// Reset states
			submitSuccess = false;
			submitError = '';
		}
	});

	// Handle Login
	async function handleLogin(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		submitError = '';

		try {
			const response = await fetch('/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(loginData)
			});

			if (response.ok) {
				// Reload page to update auth state
				window.location.reload();
			} else {
				const error = await response.json();
				submitError = error.message || 'Invalid credentials';
			}
		} catch (err) {
			submitError = 'An error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	// Handle Signup
	async function handleSignup(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		submitError = '';

		// Validate passwords match
		if (signupData.password !== signupData.confirmPassword) {
			submitError = 'Passwords do not match';
			isSubmitting = false;
			return;
		}

		try {
			const response = await fetch('/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: signupData.name,
					lastName: signupData.lastName,
					email: signupData.email,
					password: signupData.password
				})
			});

			if (response.ok) {
				// Reload page to update auth state
				window.location.reload();
			} else {
				const error = await response.json();
				submitError = error.message || 'Signup failed';
			}
		} catch (err) {
			submitError = 'An error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	// Handle Booking Submission
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
					...bookingData,
					instructorId
				})
			});

			if (response.ok) {
				submitSuccess = true;
				// Reset form
				bookingData = {
					clientName: '',
					clientEmail: '',
					clientPhone: '',
					preferredDate: '',
					lessonType: 'private',
					numberOfPeople: '1',
					skillLevel: '',
					message: ''
				};
				
				// Close after showing success
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

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDate = tomorrow.toISOString().split('T')[0];
</script>

<Dialog.Root bind:open modal={true}>
	<Dialog.Content 
		class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
		onInteractOutside={(e) => e.preventDefault()}
	>
		<!-- LOGIN VIEW -->
		{#if currentView === 'login'}
			<Dialog.Header>
				<Dialog.Title>Login to Request Lesson</Dialog.Title>
				<Dialog.Description>
					Sign in to your account to book a lesson with {instructorName}
				</Dialog.Description>
			</Dialog.Header>

			{#if submitError}
				<div class="my-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/80 dark:text-red-200">
					<p class="text-sm">{submitError}</p>
				</div>
			{/if}

			<form onsubmit={handleLogin} class="space-y-4">
				<div>
					<label for="login-email" class="mb-1.5 block text-sm font-medium">
						Email <span class="text-red-500">*</span>
					</label>
					<Input
						id="login-email"
						type="email"
						bind:value={loginData.email}
						required
						disabled={isSubmitting}
						placeholder="your@email.com"
					/>
				</div>

				<div>
					<label for="login-password" class="mb-1.5 block text-sm font-medium">
						Password <span class="text-red-500">*</span>
					</label>
					<Input
						id="login-password"
						type="password"
						bind:value={loginData.password}
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
							Logging in...
						{:else}
							Login
						{/if}
					</Button>
				</div>
			</form>

			<div class="my-4 flex flex-col items-center">
				<Separator class="w-full" />
				<span class="my-2 text-xs text-muted-foreground">or</span>
				<GoogleBtn>Continue with Google</GoogleBtn>
			</div>

			<div class="text-center">
				<button
					onclick={() => {currentView = 'signup'; submitError = ''}}
					class="text-sm text-primary hover:underline"
				>
					Don't have an account? Sign up
				</button>
			</div>

		<!-- SIGNUP VIEW -->
		{:else if currentView === 'signup'}
			<Dialog.Header>
				<Dialog.Title>Create Account</Dialog.Title>
				<Dialog.Description>
					Join Local Snow to book lessons with certified instructors
				</Dialog.Description>
			</Dialog.Header>

			{#if submitError}
				<div class="my-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/80 dark:text-red-200">
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
					onclick={() =>  { currentView = 'login'; submitError = ''}}
					class="text-sm text-primary hover:underline"
				>
					Already have an account? Login
				</button>
			</div>

		<!-- BOOKING VIEW -->
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
								{instructorName} will contact you at {bookingData.clientEmail} to confirm details.
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