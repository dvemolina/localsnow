<script>
    let { data } = $props();
	let user = $state(data.user);

	import { buttonVariants } from "$src/lib/components/ui/button";
	import { useIntlayer } from 'svelte-intlayer';
	import { route } from '$lib/i18n/routeHelpers';

	const role = useIntlayer('role');

</script>

	<!-- Role Selection Screen -->
			<div class="mb-6 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
				<h1 class="title2 mb-2">{m["dashboard.choose-role.choose_role_welcome"]({ name: user.name })}</h1>
				<p class="text-muted-foreground">
					{m["dashboard.choose-role.choose_role_subtitle"]()}
				</p>
			</div>

			<div class="space-y-4">
                <div class="flex flex-col gap-2 items-center justify-center">
                    <a href={route('/dashboard/choose-role/default-user')} class=" w-full {buttonVariants({ variant: "default" })}" >{m["dashboard.choose-role.role_student"]()}</a>
                    <a href={route('/dashboard/choose-role/instructor')} class="w-full {buttonVariants({ variant: "default" })}">{m["dashboard.choose-role.role_instructor"]()}</a>
                    <a href={route('/dashboard/choose-role/school-admin')} class="w-full {buttonVariants({ variant: "default" })}"> {$role.school_admin.value}</a>
            </div>
			</div>

			<div class="mt-6 rounded-md  p-4 ">
				<div class="flex gap-3">
					<svg class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
					<p class="text-sm text-blue-800 dark:text-blue-200">
						<strong>{m["dashboard.choose-role.choose_role_note_heading"]()}</strong> {m["dashboard.choose-role.choose_role_note_text"]()}
					</p>
				</div>
			</div>
