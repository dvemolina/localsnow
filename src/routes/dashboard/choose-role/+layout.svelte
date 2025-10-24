<script lang='ts'>
    let { children } = $props()
</script>

<div class="flex min-h-dvh w-full flex-col items-center justify-center bg-gray-50  p-4">
		<div class="w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-lg">
            {@render children?.()}
        </div>
</div>