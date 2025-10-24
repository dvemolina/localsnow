<!-- src/routes/dashboard/lessons/+page.svelte -->
<script lang="ts">
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { Input } from '$src/lib/components/ui/input';
	import * as Form from '$src/lib/components/ui/form';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { lessonSchema } from '$src/features/Lessons/lib/lessonSchema';
	import { toast } from 'svelte-sonner';

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
			1: 'Ski',
			2: 'Snowboard',
			3: 'Telemark'
		};
		return sportNames[sportId] || 'Unknown';
	};
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">Base Lesson Configuration</h1>
		<p class="text-muted-foreground">
			Set your standard hourly rate and available sports. This will be shown to potential clients.
		</p>
	</div>

	{#if hasBaseLesson && !isEditing}
		<!-- Display existing base lesson -->
		<Card.Root class="border-2">
			<Card.Header>
				<div class="flex items-start justify-between">
					<div>
						<Card.Title class="flex items-center gap-2">
							Base Lesson Rate
							<Badge variant="secondary" class="text-xs">Standard</Badge>
						</Card.Title>
						<Card.Description class="mt-1">
							Your hourly rate for private lessons
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
						Edit
					</Button>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4">
				<!-- Price Display -->
				<div class="rounded-lg bg-muted p-4">
					<div class="flex items-baseline gap-2">
						<span class="text-3xl font-bold">{baseLesson.basePrice}</span>
						<span class="text-lg text-muted-foreground">{baseLesson.currency}/hour</span>
					</div>
					<p class="mt-1 text-sm text-muted-foreground">Base hourly rate</p>
				</div>

				<!-- Sports Display -->
				<div>
					<h3 class="mb-2 text-sm font-medium">Available Sports</h3>
					<div class="flex flex-wrap gap-2">
						{#each baseLesson.sports as sportId}
							<Badge variant="outline" class="text-sm">
								{getSportName(sportId)}
							</Badge>
						{/each}
					</div>
				</div>

				<!-- Info Box -->
				<div class="rounded-md bg-blue-50 p-3 ">
					<p class="text-sm text-blue-800 ">
						<strong>Note:</strong> This is your base rate. You can discuss custom pricing directly with clients for longer sessions or group lessons.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Edit/Create Form -->
		<Card.Root>
			<Card.Header>
				<Card.Title>
					{hasBaseLesson ? 'Edit Base Lesson' : 'Create Base Lesson'}
				</Card.Title>
				<Card.Description>
					Set your hourly rate and select which sports you teach
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form method="POST" action="?/saveBaseLesson" use:enhance class="space-y-6">
					<!-- Sports Selection -->
					<div>
						<label class="text-sm font-medium mb-2 block">
							Sports You Teach <span class="text-red-500">*</span>
						</label>
						<SportsCheckboxes {form} name="sports" />
						<p class="text-xs text-muted-foreground mt-2">
							Select all sports you're qualified to teach
						</p>
					</div>

					<!-- Pricing -->
					<div class="grid gap-4 sm:grid-cols-3">
						<Form.Field {form} name="basePrice" class="sm:col-span-2">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Hourly Rate <span class="text-red-500">*</span></Form.Label>
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
										Your standard rate for a 1-hour private lesson
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
								<p class="font-medium">About your base lesson</p>
								<p class="mt-1">This represents your standard hourly rate. Clients will see this on your profile. You can teach any of the sports you selected - perfect for multi-disciplinary instructors!</p>
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
								Cancel
							</Button>
						{/if}
						<Button type="submit" disabled={$delayed} class="flex-1">
							{#if $delayed}
								<span class="flex items-center gap-2">
									<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Saving...
								</span>
							{:else}
								{hasBaseLesson ? 'Update Base Lesson' : 'Save Base Lesson'}
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
			<Card.Title class="text-base">Multi-Sport Instructors</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3 text-sm text-muted-foreground">
			<p>
				You can select multiple sports if you're qualified to teach them:
			</p>
			<ul class="space-y-2">
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>One base hourly rate applies to all sports you teach</span>
				</li>
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>Clients can see all sports you're certified for</span>
				</li>
				<li class="flex gap-2">
					<span class="text-primary">✓</span>
					<span>Perfect for instructors who teach skiing and snowboarding</span>
				</li>
			</ul>
			<p class="text-xs italic">
				Tip: Your base rate is the same across all sports. If you want to charge differently per sport, you can discuss custom pricing directly with clients.
			</p>
		</Card.Content>
	</Card.Root>
</div>