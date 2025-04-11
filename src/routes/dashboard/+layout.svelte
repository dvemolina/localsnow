<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$src/features/Dashboard/components/AppSidebar.svelte";
    
    let { data, children } = $props();
    let user = $state(data.user.user)
   </script>
    
        <Sidebar.Provider>
        <AppSidebar />
        <main>
        <Sidebar.Trigger/>
        {@render children?.()}
        </main>
    </Sidebar.Provider>


   