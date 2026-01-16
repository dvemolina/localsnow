<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';

	let { form, name = 'school', label = 'School', isFilter = false } = $props<{
		form: any;
		name?: string;
		label?: string;
		isFilter?: boolean;
	}>();

	let schools = $state<Array<{ id: number; name: string }>>([]);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/schools/list');
			if (response.ok) {
				schools = await response.json();
			}
		} catch (error) {
			console.error('Error loading schools:', error);
		} finally {
			isLoading = false;
		}
	});

	const selectedSchool = $derived(
		form.form[name] ? schools.find((s) => s.id === form.form[name]) : null
	);

	function handleSchoolChange(selected: { value: number; label: string } | undefined) {
		if (selected) {
			form.form[name] = selected.value;
		} else {
			form.form[name] = undefined;
		}
	}
</script>

<div class="space-y-2">
	<Label for={name}>{label}</Label>
	<Select.Root
		selected={selectedSchool
			? { value: selectedSchool.id, label: selectedSchool.name }
			: undefined}
		onSelectedChange={handleSchoolChange}
	>
		<Select.Trigger id={name} class="w-full">
			<Select.Value placeholder={isLoading ? 'Loading schools...' : 'Select a school'} />
		</Select.Trigger>
		<Select.Content>
			{#if isFilter}
				<Select.Item value={undefined}>All Schools</Select.Item>
			{/if}
			{#each schools as school}
				<Select.Item value={school.id}>{school.name}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
