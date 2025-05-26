<script lang="ts">
  import { Label } from '$src/lib/components/ui/label';
  import * as Form from '$src/lib/components/ui/form';
  import { onMount } from 'svelte';

  export let form: any; // SuperForms form object
  export let name: string;
  export let mode: 'form' | 'navigate' = 'form';
  export let label: string = 'Choose Resort';
  export let id: string = name;

  type Resort = {
    id: number;
    name: string;
    slug: string;
    region: string;
    country: string;
  };

  let query = '';
  let suggestions: Resort[] = [];
  let isOpen = false;
  let highlightedIndex = -1;

  let abortController: AbortController | null = null;
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Get form data store
  const { form: formData } = form;

  // Initialize the form field with proper default value
  onMount(() => {
    // Ensure the field starts with a proper default value
    if ($formData[name] === undefined || $formData[name] === null) {
      $formData[name] = mode === 'form' ? 0 : '';
    }
  });

  // Fetch suggestions
  async function fetchSuggestions(q: string) {
    abortController?.abort();
    abortController = new AbortController();

    try {
      const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(q)}`, {
        signal: abortController.signal
      });
      if (res.ok) {
        const data: Resort[] = await res.json();
        suggestions = data;
        isOpen = data.length > 0;
        highlightedIndex = -1;
      } else {
        suggestions = [];
        isOpen = false;
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error(e);
      suggestions = [];
      isOpen = false;
    }
  }

  function onInput(event: Event) {
    query = (event.target as HTMLInputElement).value;
    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (query.length >= 2) {
      debounceTimeout = setTimeout(() => fetchSuggestions(query), 200);
    } else {
      suggestions = [];
      isOpen = false;
    }
  }

  function selectResort(resort: Resort) {
    query = resort.name;
    isOpen = false;
    suggestions = [];
    
    // Ensure proper type conversion for form mode
    if (mode === 'form') {
      // Explicitly convert to number and ensure it's valid
      const resortId = Number(resort.id);
      if (!isNaN(resortId)) {
        $formData[name] = resortId;
      } else {
        console.error('Invalid resort ID:', resort.id);
        $formData[name] = 0;
      }
    } else {
      $formData[name] = resort.slug;
    }
    
    console.log('Selected resort:', resort, 'Form value:', $formData[name]);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!isOpen) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightedIndex = (highlightedIndex - 1 + suggestions.length) % suggestions.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        selectResort(suggestions[highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  // Close dropdown if clicked outside
  let container: HTMLDivElement;
  function onClickOutside(event: MouseEvent) {
    if (!container.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  });
</script>

<Form.Field {form} {name} class="w-full">
  <Form.Control>
    {#snippet children({ props })}
      <div class="relative mx-auto w-full max-w-md" bind:this={container}>
        <Form.Label class="mb-1 block text-sm font-medium text-gray-700">{label}</Form.Label>
        
        <!-- Hidden field for SuperForms -->
        <input
          {...props}
          type="hidden"
          bind:value={$formData[name]}
        />
        
        <!-- Visible search input -->
        <input
          {id}
          type="text"
          class="h-12 w-full rounded-md border border-gray-300 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-foreground"
          placeholder="Type to search resorts..."
          bind:value={query}
          on:input={onInput}
          on:keydown={onKeyDown}
          autocomplete="off"
          aria-autocomplete="list"
          aria-controls="resort-listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `resort-item-${highlightedIndex}` : undefined}
        />

        {#if isOpen}
          <ul
            id="resort-listbox"
            role="listbox"
            class="absolute top-full z-50 max-h-64 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-md"
          >
            {#each suggestions as resort, i (resort.id)}
              <li
                id={"resort-item-" + i}
                role="option"
                aria-selected={highlightedIndex === i}
                class="cursor-pointer px-4 py-2 hover:bg-blue-100"
                class:selected={highlightedIndex === i}
                on:mousedown|preventDefault={() => selectResort(resort)}
                on:mouseenter={() => (highlightedIndex = i)}
              >
                <div class="flex flex-col text-left">
                  <span class="text-foreground font-medium">{resort.name}</span>
                  <span class="text-muted-foreground text-sm">{resort.region}, {resort.country}</span>
                </div>
              </li>
            {/each}

            {#if suggestions.length === 0}
              <li class="px-4 py-2 text-muted-foreground text-sm">No resorts found.</li>
            {/if}
          </ul>
        {/if}
      </div>
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>

<style>
  li.selected,
  li[aria-selected='true'] {
    background-color: #bfdbfe; /* Tailwind blue-300 */
  }
</style>