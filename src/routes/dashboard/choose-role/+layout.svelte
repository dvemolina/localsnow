<script lang="ts">

    let { children } = $props()
</script>

<div class="flex flex-col h-dvh w-full items-center justify-center">
    <div class="flex px-6 py-8 flex-col border border-border/50 rounded-md bg-card text-center max-w-2xl gap-2 shadow-sm">
        {@render children()}
    </div>
</div>