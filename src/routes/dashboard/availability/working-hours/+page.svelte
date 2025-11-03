<script lang="ts">
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { Label } from '$src/lib/components/ui/label';
	import { Input } from '$src/lib/components/ui/input';
	import { Switch } from '$src/lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const daysOfWeek = [
		{ value: 0, label: 'Sunday' },
		{ value: 1, label: 'Monday' },
		{ value: 2, label: 'Tuesday' },
		{ value: 3, label: 'Wednesday' },
		{ value: 4, label: 'Thursday' },
		{ value: 5, label: 'Friday' },
		{ value: 6, label: 'Saturday' }
	];

	type WorkingDay = {
		dayOfWeek: number;
		isEnabled: boolean;
		startTime: string;
		endTime: string;
		seasonStart: string;
		seasonEnd: string;
	};

	let workingDays = $state<WorkingDay[]>(
		daysOfWeek.map((day) => {
			const existing = data.workingHours?.find((h: any) => h.dayOfWeek === day.value);
			return {
				dayOfWeek: day.value,
				isEnabled: !!existing,
				startTime: existing?.startTime || '09:00',
				endTime: existing?.endTime || '17:00',
				seasonStart: existing?.seasonStart || '',
				seasonEnd: existing?.seasonEnd || ''
			};
		})
	);

	let saving = $state(false);

	async function saveWorkingHours() {
		saving = true;
		try {
			// Only send enabled days
			const hoursToSave = workingDays
				.filter((day) => day.isEnabled)
				.map((day) => ({
					dayOfWeek: day.dayOfWeek,
					startTime: day.startTime,
					endTime: day.endTime,
					seasonStart: day.seasonStart || null,
					seasonEnd: day.seasonEnd || null
				}));

			const res = await fetch('/api/availability/working-hours', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ workingHours: hoursToSave })
			});

			const json = await res.json();

			if (res.ok) {
				toast.success('Working hours saved successfully');
				await invalidateAll();
			} else {
				toast.error(json.error || 'Failed to save working hours');
			}
		} catch (error) {
			toast.error('Failed to save working hours');
		} finally {
			saving = false;
		}
	}

	function copyToAll(dayIndex: number) {
		const source = workingDays[dayIndex];
		workingDays = workingDays.map((day) => ({
			...day,
			startTime: source.startTime,
			endTime: source.endTime
		}));
		toast.success('Times copied to all days');
	}

	function setWeekdaysOnly() {
		workingDays = workingDays.map((day) => ({
			...day,
			isEnabled: day.dayOfWeek >= 1 && day.dayOfWeek <= 5
		}));
		toast.success('Set to weekdays only (Mon-Fri)');
	}

	function setAllDays() {
		workingDays = workingDays.map((day) => ({ ...day, isEnabled: true }));
		toast.success('All days enabled');
	}
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">Working Hours</h1>
		<p class="text-muted-foreground">
			Set your regular working hours for each day of the week
		</p>
	</div>

	<!-- Quick Actions -->
	<div class="mb-6 flex gap-3">
		<Button onclick={setWeekdaysOnly} variant="outline" size="sm">
			<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
			Weekdays Only
		</Button>
		<Button onclick={setAllDays} variant="outline" size="sm">
			<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
			All Days
		</Button>
	</div>

	<!-- Working Days -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Weekly Schedule</Card.Title>
			<Card.Description>
				Configure which days you're available and your working hours
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			{#each workingDays as day, index}
				{@const dayInfo = daysOfWeek[index]}
				<div class="space-y-4 rounded-lg border p-4">
					<!-- Day Header -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Switch bind:checked={day.isEnabled} />
							<Label class="cursor-pointer text-base font-semibold">
								{dayInfo.label}
							</Label>
						</div>
						{#if day.isEnabled}
							<Button onclick={() => copyToAll(index)} variant="ghost" size="sm">
								<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
								Copy to all
							</Button>
						{/if}
					</div>

					{#if day.isEnabled}
						<!-- Time Inputs -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Label for="start-{index}">Start Time</Label>
								<Input
									id="start-{index}"
									type="time"
									bind:value={day.startTime}
									class="mt-1"
								/>
							</div>
							<div>
								<Label for="end-{index}">End Time</Label>
								<Input
									id="end-{index}"
									type="time"
									bind:value={day.endTime}
									class="mt-1"
								/>
							</div>
						</div>

						<!-- Optional: Seasonal Availability -->
						<details class="mt-4">
							<summary class="cursor-pointer text-sm text-muted-foreground">
								Seasonal availability (optional)
							</summary>
							<div class="mt-3 grid grid-cols-2 gap-4">
								<div>
									<Label for="season-start-{index}" class="text-xs">
										Season Start (MM-DD)
									</Label>
									<Input
										id="season-start-{index}"
										type="text"
										placeholder="12-01"
										bind:value={day.seasonStart}
										class="mt-1"
									/>
								</div>
								<div>
									<Label for="season-end-{index}" class="text-xs">
										Season End (MM-DD)
									</Label>
									<Input
										id="season-end-{index}"
										type="text"
										placeholder="04-30"
										bind:value={day.seasonEnd}
										class="mt-1"
									/>
								</div>
							</div>
							<p class="mt-2 text-xs text-muted-foreground">
								Leave empty if you're available all year round
							</p>
						</details>
					{/if}
				</div>
			{/each}
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<Button variant="outline" href="/dashboard/availability">
				Back
			</Button>
			<Button onclick={saveWorkingHours} disabled={saving}>
				{#if saving}
					<svg
						class="mr-2 h-4 w-4 animate-spin"
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
					Saving...
				{:else}
					Save Working Hours
				{/if}
			</Button>
		</Card.Footer>
	</Card.Root>

	<!-- Info Card -->
	<Card.Root class="mt-6 border-blue-200 bg-blue-50">
		<Card.Content class="pt-6">
			<div class="flex gap-3">
				<svg
					class="h-5 w-5 flex-shrink-0 text-blue-600"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
				<div class="text-sm text-blue-800">
					<p class="font-medium">How working hours work</p>
					<ul class="mt-2 space-y-1">
						<li>• These are your base available hours for each day</li>
						<li>• Clients will only see slots within these hours</li>
						<li>• Google Calendar blocks will further restrict availability</li>
						<li>• You can add seasonal dates (e.g., winter season only)</li>
					</ul>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>