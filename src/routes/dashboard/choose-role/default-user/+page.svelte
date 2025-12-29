<script>
	import { buttonVariants } from "$src/lib/components/ui/button";
	import * as m from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let submitting = $state(false);
</script>

<div class="mx-auto max-w-md">
	<div class="mb-6 text-center">
		<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
			<svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
			</svg>
		</div>
		<h1 class="title2 mb-2">{m.choose_role_student_title ? m["dashboard.choose-role.default-user.choose_role_student_title"]() : 'Student / Client'}</h1>
		<p class="text-muted-foreground">
			{m.choose_role_student_description ? m["dashboard.choose-role.default-user.choose_role_student_description"]() : 'Find and book instructors for your snow sports lessons'}
		</p>
	</div>

	<form method="POST" use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}>
		<div class="space-y-4">
			<div class="rounded-lg border p-4">
				<h3 class="font-semibold mb-2">{m.choose_role_student_features_title ? m["dashboard.choose-role.default-user.choose_role_student_features_title"]() : 'What you can do:'}</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li class="flex items-start gap-2">
						<svg class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span>{m.choose_role_student_feature_1 ? m["dashboard.choose-role.default-user.choose_role_student_feature_1"]() : 'Browse and search for certified instructors'}</span>
					</li>
					<li class="flex items-start gap-2">
						<svg class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span>{m.choose_role_student_feature_2 ? m["dashboard.choose-role.default-user.choose_role_student_feature_2"]() : 'Send booking requests and manage your lessons'}</span>
					</li>
					<li class="flex items-start gap-2">
						<svg class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span>{m.choose_role_student_feature_3 ? m["dashboard.choose-role.default-user.choose_role_student_feature_3"]() : 'Leave reviews and track your booking history'}</span>
					</li>
				</ul>
			</div>

			<button
				type="submit"
				class="w-full {buttonVariants({ variant: 'default' })}"
				disabled={submitting}
			>
				{submitting ? (m.choose_role_confirming ? m["dashboard.choose-role.default-user.choose_role_confirming"]() : 'Confirming...') : (m.choose_role_confirm ? m["dashboard.choose-role.default-user.choose_role_confirm"]() : 'Confirm Role')}
			</button>
		</div>
	</form>
</div>
