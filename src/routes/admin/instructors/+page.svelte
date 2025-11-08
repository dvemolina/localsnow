<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const filterOptions = [
		{ value: 'all', label: 'All Instructors' },
		{ value: 'pending', label: 'Pending Verification' },
		{ value: 'verified', label: 'Verified' }
	];

	function applyFilter(filter: string) {
		if (filter === 'all') {
			goto('/admin/instructors');
		} else {
			goto(`/admin/instructors?filter=${filter}`);
		}
	}
</script>

<div>
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="title2">All Instructors</h1>
			<p class="text-muted-foreground">Manage instructor accounts and verifications</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex items-center gap-4">
		<div class="w-64">
			<Select.Root
				selected={data.currentFilter
					? { value: data.currentFilter, label: data.currentFilter }
					: { value: 'all', label: 'All Instructors' }}
				onSelectedChange={(v) => v && applyFilter(v.value)}
			>
				<Select.Trigger>
					<Select.Value placeholder="Filter instructors" />
				</Select.Trigger>
				<Select.Content>
					{#each filterOptions as option}
						<Select.Item value={option.value}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<p class="text-sm text-muted-foreground">{data.instructors.length} instructors</p>
	</div>

	<!-- Instructors Table -->
	<div class="rounded-lg border border-border bg-card">
		{#if data.instructors.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border text-left text-sm text-muted-foreground">
							<th class="p-4 font-medium">ID</th>
							<th class="p-4 font-medium">Name</th>
							<th class="p-4 font-medium">Email</th>
							<th class="p-4 font-medium">Phone</th>
							<th class="p-4 font-medium">Type</th>
							<th class="p-4 font-medium">Verified</th>
							<th class="p-4 font-medium">Joined</th>
							<th class="p-4 font-medium">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.instructors as instructor}
							<tr class="border-b border-border hover:bg-accent/50">
								<td class="p-4 text-sm font-mono">#{instructor.id}</td>
								<td class="p-4">
									<div class="flex items-center gap-3">
										<img
											src={instructor.profileImageUrl || '/local-snow-head.png'}
											alt={instructor.name}
											class="size-10 rounded-full object-cover"
										/>
										<div>
											<p class="font-medium">{instructor.name} {instructor.lastName}</p>
										</div>
									</div>
								</td>
								<td class="p-4 text-sm">{instructor.email}</td>
								<td class="p-4 text-sm">
									{#if instructor.professionalPhone}
										+{instructor.professionalCountryCode} {instructor.professionalPhone}
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</td>
								<td class="p-4">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
									>
										{instructor.role === 'instructor-independent' ? 'Independent' : 'School'}
									</span>
								</td>
								<td class="p-4">
									{#if instructor.isVerified}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
										>
											<svg class="size-3" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											</svg>
											Verified
										</span>
									{:else}
										<span
											class="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
										>
											Pending
										</span>
									{/if}
								</td>
								<td class="p-4 text-sm text-muted-foreground">
									{new Date(instructor.createdAt).toLocaleDateString()}
								</td>
								<td class="p-4">
									<div class="flex gap-2">
										<Button href="/instructors/{instructor.id}" size="sm" variant="ghost"
											>View</Button
										>
										{#if !instructor.isVerified}
											<form method="POST" action="?/verify" use:enhance>
												<input type="hidden" name="instructorId" value={instructor.id} />
												<Button type="submit" size="sm" variant="default">Verify</Button>
											</form>
										{:else}
											<form method="POST" action="?/unverify" use:enhance>
												<input type="hidden" name="instructorId" value={instructor.id} />
												<Button type="submit" size="sm" variant="outline">Unverify</Button>
											</form>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="p-12 text-center">
				<p class="text-muted-foreground">No instructors found</p>
			</div>
		{/if}
	</div>
</div>
