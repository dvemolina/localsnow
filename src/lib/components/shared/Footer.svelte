<script lang="ts">
	import { page } from "$app/state";
	import { items, isCurrentPath } from "$src/lib/utils/generics";
    
</script>

<footer class="w-full flex justify-center items-center">
    <div class="flex w-full max-w-4xl flex-col gap-8 sm:flex-row p-6 sm:p-12 bg-card my-4 rounded-md justify-between items-center shadow-md mx-4">
        <div class="flex flex-col items-center gap-2 justify-center max-w-64 text-center">
            <img src="/local-snow.png" alt="Local Snow Ski Instructor Logo" class="w-36">
            <h3 class="title4">The free worldwide directory of snow sports professionals</h3>
        </div>
        <nav class="flex flex-col items-center justify-center">
            <ul class="flex flex-col items-start gap-1">
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