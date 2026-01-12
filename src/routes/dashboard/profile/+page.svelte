<!-- src/routes/dashboard/profile/+page.svelte -->
<script lang="ts">
	import UserProfileForm from '$src/features/Users/components/UserProfileForm.svelte';
	import InstructorProfileForm from '$src/features/Instructors/components/InstructorProfileForm.svelte';
	import SchoolProfileForm from '$src/features/Schools/components/SchoolProfileForm.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();

	const isInstructor = data.user.role === 'instructor-independent' || data.user.role === 'instructor-school';
	const isSchoolAdmin = data.user.role === 'school-admin';
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">{$t('profile_profile_page_title')}</h1>
		<p class="text-muted-foreground">
			{$t('profile_profile_page_subtitle')}
		</p>
		<div class="mt-3 flex items-center gap-2">
			<Badge variant="secondary">
				{#if isInstructor}
					{$t('profile_role_instructor_account')}
				{:else if isSchoolAdmin}
					{$t('profile_role_school_admin_account')}
				{:else}
					{$t('profile_role_client_account')}
				{/if}
			</Badge>
			{#if data.user.isVerified}
				<Badge variant="default" class="bg-green-600">
					✓ {$t('instructors_status_verified')}
				</Badge>
			{:else}
				<Badge variant="outline">
					{$t('status_pending_verification')}
				</Badge>
			{/if}
		</div>
	</div>

	<!-- Tabs for different profile sections -->
	<Tabs.Root value="personal" class="w-full">
		<Tabs.List class="grid w-full {isInstructor || isSchoolAdmin ? 'grid-cols-2' : 'grid-cols-1'}">
			<Tabs.Trigger value="personal">{$t('profile_profile_tab_personal')}</Tabs.Trigger>
			{#if isInstructor}
				<Tabs.Trigger value="professional">{$t('profile_profile_tab_professional')}</Tabs.Trigger>
			{:else if isSchoolAdmin}
				<Tabs.Trigger value="school">{$t('profile_profile_tab_school')}</Tabs.Trigger>
			{/if}
		</Tabs.List>

		<!-- Personal Information Tab -->
		<Tabs.Content value="personal" class="mt-6">
			<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
				<div class="mb-4">
					<h2 class="title4 mb-1">{$t('profile_profile_section_personal')}</h2>
					<p class="text-sm text-muted-foreground">
						{$t('profile_profile_section_personal_desc')}
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
							{data.user.role === 'instructor-independent' ? $t('profile_profile_section_instructor') : $t('profile_profile_section_school_instructor')}
						</h2>
						<p class="text-sm text-muted-foreground">
							{$t('profile_profile_section_instructor_desc')}
						</p>
						{#if !data.user.isVerified}
							<div class="mt-3 rounded-md bg-yellow-50 p-3">
								<p class="text-sm text-yellow-800">
									⚠️ {$t('profile_profile_verification_pending_notice')}
								</p>
							</div>
						{/if}
					</div>
					<InstructorProfileForm
	instructorForm={data.instructorForm}
	currentProfileImageUrl={data.user.profileImageUrl}
/>
				</div>
			</Tabs.Content>
		{/if}

		<!-- School Details Tab (for school admins) -->
		{#if isSchoolAdmin}
			<Tabs.Content value="school" class="mt-6">
				<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
					<div class="mb-4">
						<h2 class="title4 mb-1">{$t('profile_profile_section_school')}</h2>
						<p class="text-sm text-muted-foreground">
							{$t('profile_profile_section_school_desc')}
						</p>
						{#if !data.user.isVerified}
							<div class="mt-3 rounded-md bg-yellow-50 p-3">
								<p class="text-sm text-yellow-800">
									⚠️ {$t('profile_profile_verification_pending_notice_school')}
								</p>
							</div>
						{/if}
					</div>
					{#if data.schoolForm}
						<SchoolProfileForm
							schoolForm={data.schoolForm}
							currentLogoUrl={null}
						/>
					{:else}
						<p class="text-muted-foreground">{$t('profile_profile_school_coming_soon')}</p>
					{/if}
				</div>
			</Tabs.Content>
		{/if}
	</Tabs.Root>
</div>
