<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';

	let { id }: { id?: string } = $props();

	let query = $state('');
	let suggestions = $state([]);
	let abortController: AbortController;
	let debounceTimeout: ReturnType<typeof setTimeout>;

	async function fetchSuggestions(q: string) {
		abortController?.abort();
		abortController = new AbortController();

		try {
			const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(q)}`, {
				signal: abortController.signal
			});

			if (res.ok) {
				const data = await res.json();
				console.log('Fetched suggestions:', data);
				suggestions.splice(0, suggestions.length, ...data);
				console.log('Suggestions state after splice:', suggestions);
			}
		} catch (err) {
			if (err.name !== 'AbortError') console.error(err);
		}
	}

	function onInput(event: Event) {
		query = (event.target as HTMLInputElement).value;
		clearTimeout(debounceTimeout);

		if (query.length >= 2) {
			debounceTimeout = setTimeout(() => fetchSuggestions(query), 200);
		} else {
			suggestions = [];
		}
	}

	function selectResort(slug: string) {
		query = '';
		suggestions = [];
		window.location.href = `/resorts/${slug}`;
	}
</script>

<!-- 💡 Floating results dropdown over a relative container -->
<div class="relative mx-auto w-full max-w-md">
	<Command.Root class="rounded-md border border-gray-300">
		<Command.Input
			placeholder="Search resorts..."
			class="h-12 w-full border-0 p-3 text-sm text-gray-700 focus:outline-none"
			oninput={onInput}
			value={query}
			{id}
		/>
	</Command.Root>

	{#if query.length >= 2 && suggestions.length > 0}
		<div
			class="absolute top-full z-50 max-h-64 w-full overflow-auto rounded-md border border-border bg-white shadow-md"
		>
    <Command.Root>
			<Command.Group>
				{#each suggestions as resort}
					<Command.Item
						value={resort.name}
						onselect={() => selectResort(resort.slug)}
						class="w-full cursor-pointer px-4 py-2 hover:bg-muted"
					>
						<div class="flex flex-col text-left">
							<span class="font-medium">{resort.name}</span>
							<span class="text-sm text-muted-foreground">{resort.region}, {resort.country}</span>
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
    </Command.Root>
		</div>
	{:else if query.length >= 2}
		<div
			class="absolute top-full z-50 w-full rounded-md border border-border bg-white px-4 py-2 text-sm text-muted-foreground shadow-md"
		>
			No resorts found.
		</div>
	{/if}
</div>
