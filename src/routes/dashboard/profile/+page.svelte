<!-- src/routes/dashboard/profile/+page.svelte -->
<script lang="ts">
	import UserProfileForm from '$src/features/Users/components/UserProfileForm.svelte';
	import InstructorProfileForm from '$src/features/Instructors/components/InstructorProfileForm.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';

	let { data } = $props();
	
	const isInstructor = data.user.role === 'instructor-independent' || data.user.role === 'instructor-school';
	const isSchoolAdmin = data.user.role === 'school-admin';
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">Profile Settings</h1>
		<p class="text-muted-foreground">
			Manage your account information and preferences
		</p>
		<div class="mt-3 flex items-center gap-2">
			<Badge variant="secondary">
				{#if isInstructor}
					Instructor Account
				{:else if isSchoolAdmin}
					School Admin Account
				{:else}
					Client Account
				{/if}
			</Badge>
			{#if data.user.isVerified}
				<Badge variant="default" class="bg-green-600">
					✓ Verified
				</Badge>
			{:else}
				<Badge variant="outline">
					Pending Verification
				</Badge>
			{/if}
		</div>
	</div>

	<!-- Tabs for different profile sections -->
	<Tabs.Root value="personal" class="w-full">
		<Tabs.List class="grid w-full {isInstructor || isSchoolAdmin ? 'grid-cols-2' : 'grid-cols-1'}">
			<Tabs.Trigger value="personal">Personal Information</Tabs.Trigger>
			{#if isInstructor}
				<Tabs.Trigger value="professional">Professional Details</Tabs.Trigger>
			{:else if isSchoolAdmin}
				<Tabs.Trigger value="school">School Details</Tabs.Trigger>
			{/if}
		</Tabs.List>

		<!-- Personal Information Tab -->
		<Tabs.Content value="personal" class="mt-6">
			<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
				<div class="mb-4">
					<h2 class="title4 mb-1">Personal Information</h2>
					<p class="text-sm text-muted-foreground">
						Update your basic account information and contact details
					</p>
				</div>
				<UserProfileForm userForm={data.userForm} />
			</div>
		</Tabs.Content>

		<!-- Professional Details Tab (for instructors) -->
		{#if isInstructor}
			<Tabs.Content value="professional" class="mt-6">
				<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
					<div class="mb-4">
						<h2 class="title4 mb-1">
							{data.user.role === 'instructor-independent' ? 'Independent ' : 'School '}Instructor Profile
						</h2>
						<p class="text-sm text-muted-foreground">
							Manage your professional credentials, certifications, and teaching information
						</p>
						{#if !data.user.isVerified}
							<div class="mt-3 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
								<p class="text-sm text-yellow-800 dark:text-yellow-200">
									⚠️ Your instructor profile is pending verification. We'll review your credentials within 24-48 hours.
								</p>
							</div>
						{/if}
					</div>
					<InstructorProfileForm instructorForm={data.instructorForm} />
				</div>
			</Tabs.Content>
		{/if}

		<!-- School Details Tab (for school admins) -->
		{#if isSchoolAdmin}
			<Tabs.Content value="school" class="mt-6">
				<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
					<div class="mb-4">
						<h2 class="title4 mb-1">School Profile</h2>
						<p class="text-sm text-muted-foreground">
							Manage your school's information, contact details, and instructors
						</p>
						{#if !data.user.isVerified}
							<div class="mt-3 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
								<p class="text-sm text-yellow-800 dark:text-yellow-200">
									⚠️ Your school profile is pending verification. We'll review your credentials within 24-48 hours.
								</p>
							</div>
						{/if}
					</div>
					<!-- School form would go here -->
					<p class="text-muted-foreground">School profile management coming soon...</p>
				</div>
			</Tabs.Content>
		{/if}
	</Tabs.Root>
</div>