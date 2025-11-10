<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, Mountain } from 'lucide-svelte';

	let { data } = $props();
	const { resortsByCountry, totalResorts, seo } = data;

	let searchQuery = $state('');

	// Filter resorts based on search
	const filteredResorts = $derived(
		searchQuery.trim() === ''
			? resortsByCountry
			: resortsByCountry
					.map((country) => ({
						...country,
						resorts: country.resorts.filter((resort) =>
							resort.name.toLowerCase().includes(searchQuery.toLowerCase())
						)
					}))
					.filter((country) => country.resorts.length > 0)
	);
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonicalUrl} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Hero Section -->
	<div class="bg-gradient-to-b from-blue-600 to-blue-800 text-white">
		<div class="container mx-auto max-w-7xl px-4 py-16">
			<div class="mx-auto max-w-3xl text-center">
				<h1 class="mb-4 text-4xl font-bold md:text-5xl">Ski Resorts Directory</h1>
				<p class="mb-8 text-xl text-blue-100">
					Browse {totalResorts} resorts worldwide and find professional instructors
				</p>

				<!-- Search -->
				<div class="relative mx-auto max-w-md">
					<Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
					<Input
						type="text"
						placeholder="Search resorts..."
						bind:value={searchQuery}
						class="pl-10 bg-white"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Resorts List -->
	<div class="container mx-auto max-w-7xl px-4 py-12">
		{#if filteredResorts.length === 0}
			<div class="text-center py-12">
				<p class="text-muted-foreground">No resorts found matching "{searchQuery}"</p>
			</div>
		{:else}
			{#each filteredResorts as country}
				<div class="mb-12">
					<h2 class="mb-6 text-2xl font-bold">
						{country.country}
						<Badge variant="secondary" class="ml-2">{country.resorts.length} resorts</Badge>
					</h2>

					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each country.resorts as resort}
							<a
								href="/resorts/{country.countrySlug}/{resort.regionSlug}/{resort.slug}"
								class="group"
							>
								<Card class="h-full transition-shadow hover:shadow-lg">
									<div class="p-4">
										<div class="mb-2 flex items-start justify-between">
											<h3 class="font-semibold group-hover:text-blue-600">
												{resort.name}
											</h3>
											<Mountain class="h-4 w-4 text-muted-foreground" />
										</div>

										{#if resort.regionName}
											<p class="mb-2 text-sm text-muted-foreground">
												{resort.regionName}
											</p>
										{/if}

										{#if resort.minElevation && resort.maxElevation}
											<p class="text-xs text-muted-foreground">
												{resort.minElevation}m - {resort.maxElevation}m
											</p>
										{/if}
									</div>
								</Card>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
