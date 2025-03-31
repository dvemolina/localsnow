<script>
	import StarScore from '$src/lib/components/shared/StarScore.svelte';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge, badgeVariants } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	let { instructorData } = $props();
	let type = false;
</script>

<div class="card relative flex flex-col gap-3 bg-card rounded-md border border-border p-2 w-full min-w-[265px] sm:max-w-[717px] md:max-w-[435px] shadow-sm">
	<div class="flex flex-row gap-3 w-full">

		<Avatar.Root class="size-24 sm:size-32 border border-border">
			<Avatar.Image src="/local-snow-head.png" alt="@localsnow" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
		
		<div class="flex flex-col gap-1">
			<p class="title4">Emiliano</p>
			<div class="flex flex-row items-center gap-1">
				<Badge class="opacity-60">Ski</Badge>
				<Badge class="opacity-60">Snowboard</Badge>
			</div>
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/ski-resort.svg" alt="[resortName] ski resort" class="size-4" />
				<a href="/dashboard" class={badgeVariants({ variant: 'secondary' })}
				>Resort Name, Location</a
				>
			</div>
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/service.svg" alt="Instructor Type" class="size-4" />
				{#if type}
				<Badge variant="secondary">Independent</Badge>
				{:else if !type}
				<a href="/dashboard" class="cursor- {badgeVariants({ variant: 'secondary' })}"
				>School Full Name at Resort</a
				>
				{/if}
			</div>
			<div class="flex flex-row items-center gap-2">
				<img src="/icons/certificate.svg" alt="Qualification-Association" class="size-4" />
				<a href="/dashboard" class={badgeVariants({ variant: 'secondary' })}
				>Level X - Association</a
				>
			</div>
			
		</div>
	</div>
	<div class="flex flex-col pl-2 w-full">
		<p class="text-sm hyphens-auto">Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis ipsa iste hic vero quos tempora libero cupiditate voluptas enim similique mollitia, eos doloremque voluptates. Aspernatur illum corrupti officia voluptatum soluta.</p>
	</div>
	<Button variant="outline">View Profile</Button>
		
	<div class="absolute right-2 top-2">
		<StarScore score={4.9} />
	</div>
</div>
