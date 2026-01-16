<script lang="ts">
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge, badgeVariants } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import { route } from '$lib/i18n/routeHelpers';

	let { schoolData } = $props<{
		schoolData: {
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
		};
	}>();
</script>

<div class="card relative flex flex-col gap-3 bg-card justify-between rounded-md border border-border p-2 w-full min-w-[265px] sm:max-w-[717px] md:max-w-[435px] shadow-xs">
	<div class="flex flex-row gap-3 w-full">
		<Avatar.Root class="size-24 sm:size-32 border border-border mt-2">
			<Avatar.Image src={schoolData.logo || '/icons/home.svg'} alt={schoolData.name} />
			<Avatar.Fallback>{schoolData.name.substring(0, 2).toUpperCase()}</Avatar.Fallback>
		</Avatar.Root>

		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<p class="title4 pr-1 py-1">{schoolData.name}</p>
				{#if schoolData.isVerified}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-5 text-blue-500"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
			</div>

			<div class="flex flex-row items-center gap-2">
				<img src="/icons/ski-resort.svg" alt="{schoolData.resortName} ski resort" class="size-4" />
				<span class="text-[0.65rem] sm:text-xs {badgeVariants({ variant: 'secondary' })}">
					{schoolData.resortName}{#if schoolData.regionName}, {schoolData.regionName}{/if}
				</span>
			</div>

			<div class="flex flex-row items-center gap-2">
				<img src="/icons/service.svg" alt="Ski School" class="size-4" />
				<Badge variant="secondary" class="text-[0.65rem] sm:text-xs">Ski School</Badge>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-2 w-full">
		{#if schoolData.bio}
			<p class="text-sm hyphens-auto px-2 line-clamp-3">{schoolData.bio}</p>
		{:else}
			<p class="text-sm hyphens-auto px-2 text-muted-foreground italic">
				Professional ski and snowboard instruction
			</p>
		{/if}
		<a href={route(`/schools/${schoolData.slug}`)}>
			<Button variant="outline" class="w-full">View Profile</Button>
		</a>
	</div>
</div>
