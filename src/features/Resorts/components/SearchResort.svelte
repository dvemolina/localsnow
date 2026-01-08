<script lang="ts">
  import { Label } from '$src/lib/components/ui/label';
  import * as Form from '$src/lib/components/ui/form';
  import { onMount } from 'svelte';
  import { t } from '$lib/i18n/i18n';
  let {
    form,
    name,
    mode = 'form',
    label,
    id = name,
    countryId
  }: {
    form: any;
    name: string;
    mode?: 'form' | 'navigate';
    label?: string;
    id?: string;
    countryId?: number;
  } = $props();

  // Use translated label if not provided
  const displayLabel = $derived(label ?? $t('filter_choose_resort'));
  const placeholder = $derived($t('filter_search_resorts_placeholder'));

  type Resort = {
    id: number;
    name: string;
    slug: string;
    region: string;
    country: string;
  };

  let query = $state('');
  let suggestions: Resort[] = $state([]);
  let isOpen = $state(false);
  let highlightedIndex = $state(-1);
  let selectedResort: Resort | null = $state(null);

  let abortController: AbortController | null = null;
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  const { form: formData } = form;

  // Fetch resort by ID when form loads with existing value
  async function fetchResortById(resortId: number) {
    try {
      const res = await fetch(`/api/resorts/${resortId}`);
      if (res.ok) {
        const resort: Resort = await res.json();
        selectedResort = resort;
        query = resort.name;
      }
    } catch (e) {
      console.error('Failed to fetch resort:', e);
    }
  }

  onMount(() => {
    // Load existing resort if form has a value
    const resortId = formData ? $formData[name] : null;
    if (mode === 'form' && resortId && resortId > 0) {
      fetchResortById(resortId);
    }
  });

  async function fetchSuggestions(q: string) {
    abortController?.abort();
    abortController = new AbortController();

    try {
      // Build query params
      let queryParams = `q=${encodeURIComponent(q)}`;
      if (countryId !== undefined) {
        queryParams += `&countryId=${countryId}`;
      }

      const res = await fetch(`/api/search-suggestions?${queryParams}`, {
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
    selectedResort = null; // Clear selection when typing
    
    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (query.length >= 2) {
      debounceTimeout = setTimeout(() => fetchSuggestions(query), 200);
    } else {
      suggestions = [];
      isOpen = false;
    }
  }

  function selectResort(resort: Resort) {
    selectedResort = resort;
    query = resort.name;
    isOpen = false;
    suggestions = [];
    
    if (mode === 'form') {
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
  }

  function handleResortMouseDown(event: MouseEvent, resort: Resort) {
    event.preventDefault();
    selectResort(resort);
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
      <div class="relative mx-auto w-full" bind:this={container}>
        <Form.Label class="mb-1 block text-sm font-medium text-foreground">{displayLabel}</Form.Label>
        
        <input
          {...props}
          type="hidden"
          bind:value={$formData[name]}
        />
        
        <input
          {id}
          type="text"
          class="h-12 w-full rounded-md border border-gray-300 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-foreground"
          placeholder={placeholder}
          bind:value={query}
          oninput={onInput}
          onkeydown={onKeyDown}
          autocomplete="off"
          aria-autocomplete="list"
          aria-controls="resort-listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `resort-item-${highlightedIndex}` : undefined}
        />

        {#if isOpen}
          <ul
            id="resort-listbox"
            role="listbox"
            class="absolute top-full z-[9999] max-h-64 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-md"
          >
            {#each suggestions as resort, i (resort.id)}
              <li
                id={"resort-item-" + i}
                role="option"
                aria-selected={highlightedIndex === i}
                class="cursor-pointer px-4 py-2 hover:bg-blue-100"
                class:selected={highlightedIndex === i}
                onmousedown={(e) => handleResortMouseDown(e, resort)}
                onmouseenter={() => (highlightedIndex = i)}
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
    background-color: #bfdbfe;
  }
</style>