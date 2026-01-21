<script lang="ts">
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import { route } from '$lib/i18n/routeHelpers';
	import { t } from '$lib/i18n/i18n';

	let { schools } = $props<{
		schools: Array<{
			id: number;
			name: string;
			slug: string;
			bio: string | null;
			logo: string | null;
			isVerified: boolean;
			resortName: string;
			resortSlug: string;
			regionName: string | null;
			countryName: string;
			instructorCount?: number;
		}>;
	}>();
</script>

<section class="section" itemscope itemtype="https://schema.org/ItemList">
	<meta itemprop="name" content="Featured Ski Schools" />
	<meta itemprop="description" content="Top ski and snowboard schools in Spain" />

	<h2 class="mb-2 text-center text-3xl font-bold" itemprop="headline">
		{$t('home_featured_schools_title')}
	</h2>
	<p class="mb-8 text-center text-gray-600">{$t('home_featured_schools_subtitle')}</p>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each schools as school, index}
			<a
				href={route(`/schools/${school.slug}`)}
				class="school-card group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-lg"
				itemprop="itemListElement"
				itemscope
				itemtype="https://schema.org/ListItem"
			>
				<meta itemprop="position" content="{index + 1}" />
				<div itemprop="item" itemscope itemtype="https://schema.org/Organization">
					<meta itemprop="name" content={school.name} />
					<meta itemprop="url" content={`https://localsnow.org/schools/${school.slug}`} />
					{#if school.logo}
						<meta itemprop="logo" content={school.logo} />
					{/if}

					<!-- School Logo/Avatar -->
					<div class="flex justify-center border-b border-border bg-muted/30 p-6">
						<Avatar.Root class="size-24 border-2 border-border">
							<Avatar.Image src={school.logo || '/icons/home.svg'} alt={school.name} />
							<Avatar.Fallback>{school.name.substring(0, 2).toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
					</div>

					<!-- School Info -->
					<div class="flex flex-col gap-3 p-4">
						<div class="flex items-center justify-between gap-2">
							<h3 class="title4 line-clamp-1">{school.name}</h3>
							{#if school.isVerified}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="size-5 flex-shrink-0 text-blue-500"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-label="Verified school"
								>
									<path
										fill-rule="evenodd"
										d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</div>

						<!-- Location -->
						<div
							class="flex flex-row items-center gap-2"
							itemprop="address"
							itemscope
							itemtype="https://schema.org/PostalAddress"
						>
							<img
								src="/icons/ski-resort.svg"
								alt="{school.resortName} ski resort"
								class="size-4"
							/>
							<span class="text-xs text-muted-foreground line-clamp-1">
								<span itemprop="addressLocality">{school.resortName}</span>{#if school.regionName},
									<span itemprop="addressRegion">{school.regionName}</span>{/if}
							</span>
						</div>

						<!-- Instructor Count (if available) -->
						{#if school.instructorCount && school.instructorCount > 0}
							<div class="flex flex-row items-center gap-2">
								<img src="/icons/service.svg" alt="Instructors" class="size-4" />
								<Badge variant="secondary" class="text-xs">
									{school.instructorCount}
									{school.instructorCount === 1 ? 'Instructor' : 'Instructors'}
								</Badge>
							</div>
						{/if}

						<!-- Bio Preview -->
						{#if school.bio}
							<p class="text-sm text-muted-foreground line-clamp-2 hyphens-auto" itemprop="description">
								{school.bio}
							</p>
						{:else}
							<p class="text-sm italic text-muted-foreground">
								Professional ski and snowboard instruction
							</p>
						{/if}

						<Button
							variant="outline"
							class="mt-2 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
						>
							{$t('home_featured_schools_view_profile')} →
						</Button>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- View All Schools CTA -->
	<div class="mt-8 text-center">
		<a
			href={route('/schools')}
			class="bg-primary inline-block rounded-md px-6 py-3 font-medium text-white transition-all hover:shadow-md"
		>
			{$t('nav_schools')} →
		</a>
	</div>
</section>

<style>
	.school-card {
		transition: transform 0.2s ease-in-out;
	}

	.school-card:hover {
		transform: translateY(-4px);
	}
</style>
