<script lang="ts">
	import { page } from "$app/state";
	import { items, isCurrentPath } from "$src/lib/utils/generics";
    
</script>

<footer class="w-full flex justify-center items-center ">
    <div class="flex w-full max-w-4xl flex-row p-6 bg-card border border-border my-12 rounded-md justify-around items-center shadow-md">
        <img src="/local-snow.png" alt="Local Snow Ski Instructor Logo" class="size-48">
        <nav class="flex flex-col items-center justify-center">
            <ul class="flex flex-col items-center gap-1">
                {#each items as { href, label }}
                    <li>
                        <a
                            {href}
                            class="text-sm opacity-75 hover:opacity-100 {isCurrentPath(
                                href,
                                page.url.pathname
                            )
                                ? 'font-semibold text-foreground opacity-100'
                                : ''}"
                        >
                            {label}
                        </a>
                    </li>
                {/each}
            </ul>
        </nav>
    </div>
    
</footer>