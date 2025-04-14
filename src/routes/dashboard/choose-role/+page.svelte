<script>

	import { buttonVariants } from "$src/lib/components/ui/button";

</script>

        <p class="title3">Choose Role</p>
        <p class="text-muted-foreground hyphens-auto">You won't be able to change it later unless you send us an email. For Instructor and School Admin account, you will have to provide specific information required for verifying your account.</p>
        <div class="flex flex-col gap-2 items-center justify-center">
            <a href="/dashboard/choose-role/default-user" class=" w-full {buttonVariants({ variant: "default" })}" >Student</a>
            <a href="/dashboard/choose-role/instructor" class="w-full {buttonVariants({ variant: "default" })}">Instructor</a>
            <a href="/dashboard/choose-role/school-admin" class="w-full {buttonVariants({ variant: "default" })}"> School Admin</a>
        </div>
        <p class="text-xs text-muted-foreground italic">If you are both Instructor and School Admin, choose School Admin</p>
   