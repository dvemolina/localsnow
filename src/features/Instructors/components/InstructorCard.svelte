<script>
	import StarScore from '$src/lib/components/shared/StarScore.svelte';
	import * as Avatar from '$src/lib/components/ui/avatar';
	import { Badge } from '$src/lib/components/ui/badge';
	let { instructorData } = $props();
</script>

<div class="card relative flex flex-row gap-3 rounded-md border border-border p-2">
	<Avatar.Root class="size-32 border border-border">
		<Avatar.Image src="/local-snow-head.png" alt="@localsnow" />
		<Avatar.Fallback>CN</Avatar.Fallback>
	</Avatar.Root>

	<div class="flex flex-col">
		<p class="title4">Emiliano</p>
		<div class="flex flex-row gap-1 items-center">
			<Badge class="opacity-80">Ski</Badge>
			<Badge class="opacity-80">Snowboard</Badge>
		</div>
		<div class="flex flex-row items-center gap-2">
			<img src="/icons/ski-resort.svg" alt="[resortName] ski resort" class="size-5">
			<p>Cerro Catedral</p>
		</div>
	</div>

	<div class="absolute right-2 top-2">
		<StarScore score={4.9}/>
	</div>
</div>
