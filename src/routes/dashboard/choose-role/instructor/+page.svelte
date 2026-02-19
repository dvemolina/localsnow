<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { instructorQuickSignupSchema } from '$src/features/Instructors/lib/instructorSchemas';
	import Button from '$src/lib/components/ui/button/button.svelte';
	import { route } from '$lib/i18n/routeHelpers';

	let { data } = $props();

	// Independent form
	const independentForm = superForm(data.form, {
		validators: zodClient(instructorQuickSignupSchema),
		id: 'independent'
	});
	const { enhance: enhanceIndependent, submitting: submittingIndependent } = independentForm;

	// School form (shares same schema / endpoint, different hidden value)
	const schoolForm = superForm(data.form, {
		validators: zodClient(instructorQuickSignupSchema),
		id: 'school'
	});
	const { enhance: enhanceSchool, submitting: submittingSchool } = schoolForm;
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="text-center">
		<div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
			<svg class="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
			</svg>
		</div>
		<h1 class="title3 mb-1">Join as an Instructor</h1>
		<p class="text-sm text-muted-foreground">
			Choose how you teach. You can update this later.
		</p>
	</div>

	<!-- Type cards -->
	<div class="grid gap-4 sm:grid-cols-2">
		<!-- Independent -->
		<form method="POST" use:enhanceIndependent class="contents">
			<input type="hidden" name="instructorType" value="instructor-independent" />
			<button
				type="submit"
				disabled={$submittingIndependent || $submittingSchool}
				class="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-60"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
				<div>
					<p class="font-semibold">Independent Instructor</p>
					<p class="mt-0.5 text-sm text-muted-foreground">
						Set your own schedule and rates. Work directly with clients on your own terms.
					</p>
				</div>
				<span class="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
					{#if $submittingIndependent}
						<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
						</svg>
						Setting up…
					{:else}
						Join as Independent
						<svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					{/if}
				</span>
			</button>
		</form>

		<!-- School -->
		<form method="POST" use:enhanceSchool class="contents">
			<input type="hidden" name="instructorType" value="instructor-school" />
			<button
				type="submit"
				disabled={$submittingIndependent || $submittingSchool}
				class="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-60"
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
					</svg>
				</div>
				<div>
					<p class="font-semibold">School Instructor</p>
					<p class="mt-0.5 text-sm text-muted-foreground">
						Teach through a certified ski school. Access school resources and a managed schedule.
					</p>
				</div>
				<span class="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
					{#if $submittingSchool}
						<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
						</svg>
						Setting up…
					{:else}
						Join as School Instructor
						<svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					{/if}
				</span>
			</button>
		</form>
	</div>

	<!-- Info note -->
	<div class="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
		<svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
			<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
		</svg>
		<p class="text-xs text-blue-800 dark:text-blue-200">
			After choosing your type you'll complete your profile from the dashboard — including your qualification document, which we need to verify your account.
		</p>
	</div>

	<a href={route('/dashboard/choose-role')} class="text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
		← Back to role selection
	</a>
</div>
