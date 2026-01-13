<!-- src/routes/dashboard/profile/+page.svelte -->
<script lang="ts">
	import UserProfileForm from '$src/features/Users/components/UserProfileForm.svelte';
	import InstructorProfileForm from '$src/features/Instructors/components/InstructorProfileForm.svelte';
	import SchoolProfileForm from '$src/features/Schools/components/SchoolProfileForm.svelte';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Switch } from '$src/lib/components/ui/switch';
	import * as Tabs from '$lib/components/ui/tabs';
	import { t } from '$lib/i18n/i18n';
	import { toast } from 'svelte-sonner';
	let { data } = $props();

	const isInstructor = data.user.role === 'instructor-independent' || data.user.role === 'instructor-school';
	const isSchoolAdmin = data.user.role === 'school-admin';

	// Publishing toggle state
	let isPublished = $state(data.user.isPublished ?? false);
	let isUpdatingPublishStatus = $state(false);

	async function togglePublishStatus() {
		isUpdatingPublishStatus = true;
		const newStatus = !isPublished;

		try {
			const response = await fetch(`/api/instructors/${data.user.id}/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isPublished: newStatus })
			});

			if (!response.ok) {
				throw new Error('Failed to update publish status');
			}

			const result = await response.json();
			isPublished = result.isPublished;

			toast.success(
				isPublished
					? 'Profile published! Your profile is now visible in the directory.'
					: 'Profile unpublished. Your profile is now hidden from the directory.'
			);
		} catch (error) {
			console.error('Error updating publish status:', error);
			toast.error('Failed to update publish status. Please try again.');
		} finally {
			isUpdatingPublishStatus = false;
		}
	}
</script>

<div class="container mx-auto max-w-4xl py-6">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="title2 mb-2">{$t('profile_page_title')}</h1>
		<p class="text-muted-foreground">
			{$t('profile_page_subtitle')}
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
			<Tabs.Trigger value="personal">{$t('profile_tab_personal')}</Tabs.Trigger>
			{#if isInstructor}
				<Tabs.Trigger value="professional">{$t('profile_tab_professional')}</Tabs.Trigger>
			{:else if isSchoolAdmin}
				<Tabs.Trigger value="school">{$t('profile_tab_school')}</Tabs.Trigger>
			{/if}
		</Tabs.List>

		<!-- Personal Information Tab -->
		<Tabs.Content value="personal" class="mt-6">
			<div class="rounded-lg border border-border bg-card p-6 shadow-sm">
				<div class="mb-4">
					<h2 class="title4 mb-1">{$t('profile_section_personal')}</h2>
					<p class="text-sm text-muted-foreground">
						{$t('profile_section_personal_desc')}
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
							{data.user.role === 'instructor-independent' ? $t('profile_section_instructor') : $t('profile_section_school_instructor')}
						</h2>
						<p class="text-sm text-muted-foreground">
							{$t('profile_section_instructor_desc')}
						</p>

						<!-- Profile Publishing Toggle -->
						<div class="mt-4 rounded-lg border border-border bg-background p-4">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<h3 class="font-medium">
											{isPublished ? 'Profile Published' : 'Profile Draft'}
										</h3>
										{#if isPublished}
											<Badge variant="default" class="bg-green-600">Live</Badge>
										{:else}
											<Badge variant="secondary">Draft</Badge>
										{/if}
									</div>
									<p class="mt-1 text-sm text-muted-foreground">
										{isPublished
											? 'Your profile is visible in the public directory and accessible to clients.'
											: 'Your profile is hidden from the public directory. Only you and admins can see it.'}
									</p>
								</div>
								<Switch
									checked={isPublished}
									onCheckedChange={togglePublishStatus}
									disabled={isUpdatingPublishStatus}
								/>
							</div>
						</div>

						{#if !isPublished}
							<div class="mt-3 rounded-md bg-yellow-50 p-3">
								<p class="text-sm text-yellow-800">
									⚠️ Your profile is currently in draft mode and not visible to clients. Toggle the switch above to publish your profile.
								</p>
							</div>
						{/if}

						{#if !data.user.isVerified}
							<div class="mt-3 rounded-md bg-blue-50 p-3">
								<p class="text-sm text-blue-800">
									ℹ️ {$t('profile_verification_pending_notice')}
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
						<h2 class="title4 mb-1">{$t('profile_section_school')}</h2>
						<p class="text-sm text-muted-foreground">
							{$t('profile_section_school_desc')}
						</p>
						{#if !data.user.isVerified}
							<div class="mt-3 rounded-md bg-yellow-50 p-3">
								<p class="text-sm text-yellow-800">
									⚠️ {$t('profile_verification_pending_notice_school')}
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
						<p class="text-muted-foreground">{$t('profile_school_coming_soon')}</p>
					{/if}
				</div>
			</Tabs.Content>
		{/if}
	</Tabs.Root>
</div>
