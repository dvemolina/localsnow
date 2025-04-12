<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$src/features/Dashboard/components/AppSidebar.svelte";
	import { buttonVariants } from "$src/lib/components/ui/button/index.js";
    
    let { data, children } = $props();
    let user = $state(data.user.user)
   </script>
    
    {#if !user.role}
        <div class="flex flex-col h-dvh w-full items-center justify-center">
            <div class="flex p-8 flex-col border border-border/50 rounded-md bg-card max-w-lg gap-6 shadow-md">
                <p class="title3">Hey {user.name}, Choose Your Account Type</p>
                <p class="text-muted-foreground hyphens-auto">You won't be able to change it later unless you send us an email. For Instructor and School Admin account, you will have to provide specific information required for verifying your account.</p>
                <div class="flex flex-col gap-2 items-center justify-center">
                    <a href="/dashboard/choose-role/default-user" class=" w-full {buttonVariants({ variant: "default" })}" >Student</a>
                    <a href="/dashboard/choose-role/instructor" class="w-full {buttonVariants({ variant: "default" })}">Instructor</a>
                    <a href="/dashboard/choose-role/school-admin" class="w-full {buttonVariants({ variant: "default" })}"> School Admin</a>
                </div>
                <p class="text-xs text-muted-foreground italic">If you are both Instructor and School Admin, choose School Admin</p>
            </div>

        </div>
    {:else if user.role}
        <Sidebar.Provider>
        <AppSidebar />
        <main>
        <Sidebar.Trigger/>
        {@render children?.()}
        </main>
    </Sidebar.Provider>
    {/if}

   