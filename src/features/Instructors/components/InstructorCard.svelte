<script>
	import * as Avatar from '$src/lib/components/ui/avatar';
	let { instructorData } = $props();
</script>

<div class="card flex flex-row gap-3 rounded-md border border-border p-2">
	<Avatar.Root class="size-16 border border-border">
		<Avatar.Image src="/local-snow-head.png" alt="@localsnow" />
		<Avatar.Fallback>CN</Avatar.Fallback>
	</Avatar.Root>

	<div class="flex flex-col">
		<p class="title4">Emiliano</p>
	</div>
</div>
