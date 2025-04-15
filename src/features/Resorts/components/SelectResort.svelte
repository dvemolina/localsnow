<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';

  let query = $state('');
  let suggestions = $state([]);
  let showSuggestions = $state(false);
  let abortController: AbortController;
  let debounceTimeout: ReturnType<typeof setTimeout>;

  async function fetchSuggestions(q: string) {
    // Abort previous fetch
    abortController?.abort();
    abortController = new AbortController();

    try {
      const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(q)}`, {
        signal: abortController.signal
      });

      if (!res.ok) return;
      const data = await res.json();
      suggestions = data;
      showSuggestions = true;
    } catch (error) {
      if (error.name !== 'AbortError') console.error(error);
    }
  }

  function onInput(event: Event) {
    query = (event.target as HTMLInputElement).value;
    clearTimeout(debounceTimeout);

    if (query.length >= 2) {
      debounceTimeout = setTimeout(() => fetchSuggestions(query), 200);
    } else {
      showSuggestions = false;
      suggestions = [];
    }
  }

  function onSelect(suggestion) {
    // You can adjust this to match your route structure
    goto(`/resorts/${suggestion.slug}`);
    showSuggestions = false;
    suggestions = [];
  }

  onDestroy(() => {
    clearTimeout(debounceTimeout);
    abortController?.abort();
  });
</script>

<div class="relative w-full max-w-lg mx-auto">
  <input
    type="text"
    bind:value={query}
    oninput={onInput}
    placeholder="Search resort…"
    class="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {#if showSuggestions && suggestions.length > 0}
    <ul class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
      {#each suggestions as s}
        <li
          class="cursor-pointer px-4 py-2 hover:bg-blue-50"
          onclick={() => onSelect(s)}
        >
          <div class="font-semibold">{s.name}</div>
          <div class="text-sm text-gray-500">{s.region}, {s.country}</div>
        </li>
      {/each}
    </ul>
  {:else if showSuggestions && suggestions.length === 0}
    <div class="absolute z-50 w-full mt-1 px-4 py-3 text-sm text-gray-400 bg-white border border-gray-200 rounded-xl shadow-md">
      No results found.
    </div>
  {/if}
</div>
