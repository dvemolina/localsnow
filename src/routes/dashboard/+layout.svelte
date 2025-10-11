<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$src/features/Dashboard/components/AppSidebar.svelte";
    
    let { data, children } = $props();
    let user = $state(data.user)
   </script>
    
    {#if !user.role}
        <div class="flex flex-col min-h-dvh w-full items-center justify-center">
            <div class="flex p-8 my-8 flex-col border border-border/50 rounded-md bg-card max-w-lg gap-6 shadow-md">
                {@render children?.()}
            </div>

        </div>
    {:else if user.role}
        <Sidebar.Provider>
        <AppSidebar />
        <main class="w-full">
        <Sidebar.Trigger />
        <div class="p-4 w-full">
            {@render children?.()}
        </div>
        </main>
    </Sidebar.Provider>
    {/if}

   