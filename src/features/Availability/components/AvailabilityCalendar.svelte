<script lang="ts">
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { Badge } from '$src/lib/components/ui/badge';
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
		onSlotSelect
	}: {
		instructorId: number;
		onSlotSelect?: (date: string, startTime: string, endTime: string) => void;
	} = $props();

	let currentMonth = $state(new Date());
	let loading = $state(false);
	let availability = $state<DayAvailability[]>([]);
	let selectedSlot = $state<{ date: string; startTime: string; endTime: string } | null>(null);

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

		// Add empty cells for days before the month starts
		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(null);
		}

		// Add all days of the month
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
			console.error(error);
		} finally {
			loading = false;
		}
	}

	function selectSlot(date: string, startTime: string, endTime: string) {
		selectedSlot = { date, startTime, endTime };
		if (onSlotSelect) {
			onSlotSelect(date, startTime, endTime);
		}
	}

	// Load availability when component mounts or month changes
	$effect(() => {
		loadAvailability();
	});

	let monthDays = $derived(getMonthDays(currentMonth));
	let selectedDate = $state<Date | null>(null);
</script>

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex flex-col sm:flex-row items-center justify-between">
			<Card.Title>Available Times</Card.Title>
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
			<!-- Calendar Grid -->
			<div class="grid grid-cols-7 gap-2">
				<!-- Day headers -->
				{#each dayNames as dayName}
					<div class="text-center text-sm font-semibold text-muted-foreground py-2">
						{dayName}
					</div>
				{/each}

				<!-- Calendar days -->
				{#each monthDays as day}
					{#if day === null}
						<div class="aspect-square"></div>
					{:else}
						{@const isToday =
							day.toDateString() === new Date().toDateString()}
						{@const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))}
						{@const hasSlots = hasAvailableSlots(day)}
						{@const isSelected = selectedDate?.toDateString() === day.toDateString()}

						<button
							type="button"
							class="aspect-square rounded-lg border p-2 text-sm transition-colors
                {isSelected
								? 'border-primary bg-primary text-primary-foreground'
								: isPast || !hasSlots
									? 'border-muted bg-muted text-muted-foreground cursor-not-allowed'
									: 'border-border hover:border-primary hover:bg-accent cursor-pointer'}
                {isToday && !isSelected ? 'border-primary border-2' : ''}"
							disabled={isPast || !hasSlots}
							onclick={() => {
								if (!isPast && hasSlots) {
									selectedDate = day;
								}
							}}
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

			<!-- Time Slots for Selected Date -->
			{#if selectedDate}
				{@const dayAvail = getDayAvailability(selectedDate)}
				{#if dayAvail && dayAvail.isWorkingDay}
					<div class="border-t pt-4 mt-4">
						<h3 class="font-semibold mb-3">
							Available times on {selectedDate.toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'long',
								day: 'numeric'
							})}
						</h3>
						<div class="grid grid-cols-3 gap-2">
							{#each dayAvail.slots as slot}
								{#if slot.status === 'available'}
									{@const isSelectedSlot =
										selectedSlot?.date === slot.date &&
										selectedSlot?.startTime === slot.startTime}
									<Button
										variant={isSelectedSlot ? 'default' : 'outline'}
										size="sm"
										class="justify-center"
										onclick={() => selectSlot(slot.date, slot.startTime, slot.endTime)}
									>
										{slot.startTime}
									</Button>
								{/if}
							{/each}
						</div>
						{#if dayAvail.slots.filter((s) => s.status === 'available').length === 0}
							<p class="text-sm text-muted-foreground text-center py-4">
								No available time slots for this day
							</p>
						{/if}
					</div>
				{/if}
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
			</div>
		{/if}
	</Card.Content>
</Card.Root>