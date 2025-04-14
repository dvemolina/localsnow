<script lang="ts">
  import { onMount } from 'svelte';
  import * as Select from "$src/components/ui/select";
  
  // Use props instead of createEventDispatcher
  let { 
    value = null, 
    onChange = undefined,
    onBreakSelected = undefined
  } = $props();
  
  // State for selections
  let selectedCountry = $state(null);
  let selectedRegion = $state(null);
  let selectedBreak = $state(value);  // Initialize with passed value if available
  
  // Data containers
  let countries = $state([]);
  let regions = $state([]);
  let breaks = $state([]);
  let allBreaks = $state({});  // Store all breaks for lookup by ID
  
  // Load data
  async function loadSurfBreaks() {
    try {
      const response = await fetch('/api/breaks');
      const data = await response.json();
      console.log('Breaks Data: ', data)
      countries = data.countries;
      
      // Build a lookup object for all breaks by ID
      const breaksLookup = {};
      data.countries.forEach(country => {
        country.regions.forEach(region => {
          region.breaks.forEach(breakSpot => { //Not "breake" because it is a javascript reserved word
            breaksLookup[breakSpot.id] = {
              ...breakSpot,
              country: country.name,
              region: region.name
            };
          });
        });
      });
      allBreaks = breaksLookup;
      
      // If we have an initial value, set the appropriate selections
      if (selectedBreak && allBreaks[selectedBreak]) {
        const countryId = selectedBreak.split('-')[0];
        const regionId = `${countryId}-${selectedBreak.split('-')[1]}`;
        
        selectedCountry = countryId;
        const country = countries.find(c => c.id === selectedCountry);
        regions = country ? country.regions : [];
        
        selectedRegion = regionId;
        const region = regions.find(r => r.id === selectedRegion);
        breaks = region ? region.breaks : [];
      }
    } catch (error) {
      console.error('Failed to load surf data:', error);
    }
  }
  
  // Update regions when country changes
  function handleCountryChange(value) {
    selectedCountry = value;
    selectedRegion = null;
    selectedBreak = null;
    
    // Find the selected country and get its regions
    const country = countries.find(c => c.id === selectedCountry);
    regions = country ? country.regions : [];
    breaks = [];
    
    // Notify parent form that value has changed
    if (onChange) onChange(null);
  }
  
  // Update breaks when region changes
  function handleRegionChange(value) {
    selectedRegion = value;
    selectedBreak = null;
    
    // Find the selected region and get its breaks
    const country = countries.find(c => c.id === selectedCountry);
    if (country) {
      const region = country.regions.find(r => r.id === selectedRegion);
      breaks = region ? region.breaks : [];
    } else {
      breaks = [];
    }
    
    // Notify parent form that value has changed
    if (onChange) onChange(null);
  }
  
  // Handle break selection
  function handleBreakChange(value) {
    selectedBreak = value;
    
    // Find the full break data
    const breakData = breaks.find(b => b.id === selectedBreak);
    
    // Call callback props for form and map integration
    if (onChange) onChange(selectedBreak);
    if (onBreakSelected && breakData) onBreakSelected(breakData);
  }
  
  onMount(loadSurfBreaks);
</script>

<div class="flex flex-row gap-2">
  <Select.Root onValueChange={(v) => handleCountryChange(v)} type="single" >
    <Select.Trigger class="min-w-[150px]">
      <span>{selectedCountry ? countries.find(c => c.id === selectedCountry)?.name : 'Country'}</span>
    </Select.Trigger>
    <Select.Content>
      {#each countries as country}
        <Select.Item value={country.id}>{country.name}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
  
  <Select.Root onValueChange={(v) => handleRegionChange(v)} disabled={!selectedCountry} type="single">
    <Select.Trigger class="min-w-[150px]">
      <span>{selectedRegion ? regions.find(r => r.id === selectedRegion)?.name : 'Region'}</span>
    </Select.Trigger>
    <Select.Content>
      {#each regions as region}
        <Select.Item value={region.id}>{region.name}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
  
  <Select.Root onValueChange={(v) => handleBreakChange(v)} disabled={!selectedRegion} type="single">
    <Select.Trigger class="min-w-[150px]">
      <span>{selectedBreak ? breaks.find(b => b.id === selectedBreak)?.name : 'Break'}</span>
    </Select.Trigger>
    <Select.Content>
      {#each breaks as breakSpot}
        <Select.Item value={breakSpot.id}>{breakSpot.name}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
</div>