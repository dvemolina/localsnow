<script lang="ts">
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Switch } from '$src/lib/components/ui/switch';
	import { Label } from '$src/lib/components/ui/label';
	import { toast } from 'svelte-sonner';

	type TimeSlot = {
		date: string;
		startTime: string;
		endTime: string;
		status: 'available' | 'blocked' | 'pending' | 'booked';
	};

	type DayAvailability = {
		date: string;
		dayOfWeek: number;
		isWorkingDay: boolean;
		slots: TimeSlot[];
	};

	let {
		instructorId,
		onSelectionChange
	}: {
		instructorId: number;
		onSelectionChange?: (selection: {
			startDate: string;
			endDate: string;
			timeSlots: string[];
			totalHours: number;
		}) => void;
	} = $props();

	let currentMonth = $state(new Date());
	let loading = $state(false);
	let availability = $state<DayAvailability[]>([]);
	let dateRange = $state<{ start: Date | null; end: Date | null }>({ start: null, end: null });
	let selectedTimeSlots = $state<string[]>([]); // Array of "HH:MM" start times
	let sameTimesEveryDay = $state(true); // Toggle for consistent times across all days

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function getMonthDays(date: Date) {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();

		const days: (Date | null)[] = [];

		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(null);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			days.push(new Date(year, month, day));
		}

		return days;
	}

	function formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function getDayAvailability(date: Date): DayAvailability | undefined {
		const dateStr = formatDate(date);
		return availability.find((a) => a.date === dateStr);
	}

	function hasAvailableSlots(date: Date): boolean {
		const dayAvail = getDayAvailability(date);
		if (!dayAvail || !dayAvail.isWorkingDay) return false;
		return dayAvail.slots.some((slot) => slot.status === 'available');
	}

	function previousMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
		loadAvailability();
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
		loadAvailability();
	}

	async function loadAvailability() {
		loading = true;
		try {
			const year = currentMonth.getFullYear();
			const month = currentMonth.getMonth();
			const startDate = new Date(year, month, 1);
			const endDate = new Date(year, month + 1, 0);

			const res = await fetch(
				`/api/availability/${instructorId}?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&slotDuration=60`
			);

			if (res.ok) {
				const data = await res.json();
				availability = data.availability || [];
			} else {
				toast.error('Failed to load availability');
			}
		} catch (error) {
			toast.error('Failed to load availability');
			console.error('Error loading availability:', error);
		} finally {
			loading = false;
		}
	}

	function handleDateClick(day: Date) {
		const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
		const hasSlots = hasAvailableSlots(day);

		if (isPast || !hasSlots) return;

		// Multi-day range selection logic
		if (!dateRange.start || (dateRange.start && dateRange.end)) {
			// Start new selection
			dateRange = { start: day, end: null };
			selectedTimeSlots = []; // Reset time slots when starting new selection
		} else {
			// Complete the range
			if (day < dateRange.start) {
				// Clicked before start - swap them
				dateRange = { start: day, end: dateRange.start };
			} else {
				dateRange = { start: dateRange.start, end: day };
			}
		}

		notifySelectionChange();
	}

	function toggleTimeSlot(startTime: string) {
		if (selectedTimeSlots.includes(startTime)) {
			selectedTimeSlots = selectedTimeSlots.filter((t) => t !== startTime);
		} else {
			selectedTimeSlots = [...selectedTimeSlots, startTime].sort();
		}
		notifySelectionChange();
	}

	function notifySelectionChange() {
		if (!dateRange.start || !onSelectionChange) return;

		const endDate = dateRange.end || dateRange.start;
		const totalDays = Math.ceil(
			(endDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
		) + 1;

		onSelectionChange({
			startDate: formatDate(dateRange.start),
			endDate: formatDate(endDate),
			timeSlots: selectedTimeSlots,
			totalHours: selectedTimeSlots.length * totalDays
		});
	}

	function isDateInRange(date: Date): boolean {
		if (!dateRange.start) return false;
		if (!dateRange.end) return date.toDateString() === dateRange.start.toDateString();
		return date >= dateRange.start && date <= dateRange.end;
	}

	function clearSelection() {
		dateRange = { start: null, end: null };
		selectedTimeSlots = [];
		notifySelectionChange();
	}

	// Get common available time slots across selected date range
	function getCommonTimeSlots(): string[] {
		if (!dateRange.start) return [];

		const endDate = dateRange.end || dateRange.start;
		const dates: Date[] = [];
		const current = new Date(dateRange.start);

		while (current <= endDate) {
			dates.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}

		// Get availability for all dates in range
		const allAvailability = dates
			.map((d) => getDayAvailability(d))
			.filter((a): a is DayAvailability => a !== undefined && a.isWorkingDay);

		if (allAvailability.length === 0) return [];

		// Find time slots available on ALL selected days
		const firstDaySlots = allAvailability[0].slots
			.filter((s) => s.status === 'available')
			.map((s) => s.startTime);

		return firstDaySlots.filter((time) =>
			allAvailability.every((day) =>
				day.slots.some((slot) => slot.startTime === time && slot.status === 'available')
			)
		);
	}

	$effect(() => {
		loadAvailability();
	});

	let monthDays = $derived(getMonthDays(currentMonth));
	let commonTimeSlots = $derived(getCommonTimeSlots());
	let totalDays = $derived(
		dateRange.start && dateRange.end
			? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
			: dateRange.start
				? 1
				: 0
	);
</script>

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex flex-col sm:flex-row items-center justify-between gap-2">
			<Card.Title>Select Dates & Times</Card.Title>
			<div class="flex items-center gap-2">
				<Button variant="outline" size="icon" onclick={previousMonth} disabled={loading}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</Button>
				<span class="text-sm font-medium min-w-[140px] text-center">
					{monthNames[currentMonth.getMonth()]}
					{currentMonth.getFullYear()}
				</span>
				<Button variant="outline" size="icon" onclick={nextMonth} disabled={loading}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</Button>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if loading}
			<div class="flex items-center justify-center py-8">
				<svg
					class="h-8 w-8 animate-spin text-muted-foreground"
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
			</div>
		{:else}
			<!-- Selection Summary -->
			{#if dateRange.start}
				<div class="rounded-lg bg-primary/10 border border-primary/20 p-3">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-semibold">Selected Period</span>
						<Button variant="ghost" size="sm" onclick={clearSelection}>
							Clear
						</Button>
					</div>
					<div class="text-sm space-y-1">
						<p>
							<strong>Dates:</strong>
							{dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
							{#if dateRange.end && dateRange.end.toDateString() !== dateRange.start.toDateString()}
								- {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
								<Badge variant="secondary" class="ml-2">{totalDays} days</Badge>
							{/if}
						</p>
						{#if selectedTimeSlots.length > 0}
							<p>
								<strong>Time slots per day:</strong>
								{selectedTimeSlots.length} × 1h
								<Badge variant="secondary" class="ml-2">
									{selectedTimeSlots.length * totalDays}h total
								</Badge>
							</p>
						{/if}
					</div>
				</div>
			{:else}
				<div class="rounded-lg bg-muted p-3 text-sm text-muted-foreground text-center">
					Click a start date, then click an end date (or same date for single day)
				</div>
			{/if}

			<!-- Calendar Grid -->
			<div class="grid grid-cols-7 gap-2">
				{#each dayNames as dayName}
					<div class="text-center text-sm font-semibold text-muted-foreground py-2">
						{dayName}
					</div>
				{/each}

				{#each monthDays as day}
					{#if day === null}
						<div class="aspect-square"></div>
					{:else}
						{@const isToday = day.toDateString() === new Date().toDateString()}
						{@const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))}
						{@const hasSlots = hasAvailableSlots(day)}
						{@const inRange = isDateInRange(day)}

						<button
							type="button"
							class="aspect-square rounded-lg border p-2 text-sm transition-colors
                {inRange
								? 'border-primary bg-primary text-primary-foreground'
								: isPast || !hasSlots
									? 'border-muted bg-muted text-muted-foreground cursor-not-allowed'
									: 'border-border hover:border-primary hover:bg-accent cursor-pointer'}
                {isToday && !inRange ? 'border-primary border-2' : ''}"
							disabled={isPast || !hasSlots}
							onclick={() => handleDateClick(day)}
						>
							<div class="flex flex-col items-center justify-center h-full">
								<span class="font-medium">{day.getDate()}</span>
								{#if hasSlots && !isPast}
									<div class="w-1 h-1 rounded-full bg-green-500 mt-1"></div>
								{/if}
							</div>
						</button>
					{/if}
				{/each}
			</div>

			<!-- Time Slots Selection -->
			{#if dateRange.start}
				<div class="border-t pt-4 mt-4">
					<div class="flex items-center justify-between mb-3">
						<h3 class="font-semibold">
							Select time slots
							{#if totalDays > 1 && sameTimesEveryDay}
								<span class="text-sm font-normal text-muted-foreground">
									(same times on all {totalDays} days)
								</span>
							{/if}
						</h3>
						
						{#if totalDays > 1}
							<div class="flex items-center gap-2">
								<Switch 
									id="same-times" 
									bind:checked={sameTimesEveryDay}
									onCheckedChange={() => {
										if (!sameTimesEveryDay) {
											toast.info('Different times per day coming soon!');
										}
									}}
								/>
								<Label for="same-times" class="text-xs cursor-pointer">Same times daily</Label>
							</div>
						{/if}
					</div>

					{#if sameTimesEveryDay && commonTimeSlots.length > 0}
						<div class="grid grid-cols-3 gap-2">
							{#each commonTimeSlots as time}
								{@const [hour, minute] = time.split(':').map(Number)}
								{@const endHour = String(hour + 1).padStart(2, '0')}
								{@const displayTime = `${time} - ${endHour}:${minute.toString().padStart(2, '0')}`}
								
								<Button
									variant={selectedTimeSlots.includes(time) ? 'default' : 'outline'}
									size="sm"
									class="justify-center text-xs"
									onclick={() => toggleTimeSlot(time)}
								>
									{displayTime}
								</Button>
							{/each}
						</div>
					{:else if sameTimesEveryDay}
						<p class="text-sm text-muted-foreground text-center py-4">
							No common time slots available across all selected dates. Try selecting fewer days or
							different dates.
						</p>
					{:else}
						<!-- Future: Different times per day UI -->
						<div class="rounded-lg border-2 border-dashed border-border p-6 text-center">
							<p class="text-sm text-muted-foreground mb-2">
								🚧 Different times per day feature coming soon!
							</p>
							<p class="text-xs text-muted-foreground">
								For now, please use the same time slots for all days.
							</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Legend -->
			<div class="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 rounded-full bg-green-500"></div>
					<span>Available</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 rounded border border-muted bg-muted"></div>
					<span>Unavailable</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-3 h-3 rounded bg-primary"></div>
					<span>Selected</span>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>