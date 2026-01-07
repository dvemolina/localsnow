<script lang="ts">
	import { useIntlayer } from 'svelte-intlayer';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import SchoolProfileForm from '$src/features/Schools/components/SchoolProfileForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { form, school } = $derived(data);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">School Profile</h1>
			<p class="text-muted-foreground mt-1">
				Manage your school's information and settings
			</p>
		</div>
		<div class="flex items-center gap-2">
			{#if school.isVerified}
				<Badge variant="default" class="bg-green-600">
					✓ Verified
				</Badge>
			{:else}
				<Badge variant="outline">
					Pending Verification
				</Badge>
			{/if}
			{#if school.isPublished}
				<Badge variant="default">
					Published
				</Badge>
			{:else}
				<Badge variant="secondary">
					Unpublished
				</Badge>
			{/if}
		</div>
	</div>

	<!-- Info Card for Unverified Schools -->
	{#if !school.isVerified}
		<Card.Root class="border-yellow-200 bg-yellow-50">
			<Card.Header>
				<Card.Title class="text-yellow-900">Verification Pending</Card.Title>
				<Card.Description class="text-yellow-700">
					Your school profile is currently under review. Once verified, you'll be able to appear in the school directory and receive booking requests. Ensure all information is accurate and complete.
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{/if}

	<!-- Profile Form -->
	<Card.Root>
		<Card.Header>
			<Card.Title>School Information</Card.Title>
			<Card.Description>
				Update your school's profile information. Changes will be reviewed if they affect verification status.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<SchoolProfileForm schoolForm={form} currentLogoUrl={school.logo} />
		</Card.Content>
	</Card.Root>

	<!-- Quick Info -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Profile Guidelines</Card.Title>
		</Card.Header>
		<Card.Content>
			<ul class="space-y-2 text-sm">
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Use a clear, professional school logo</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Write a compelling bio highlighting your school's strengths</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Ensure contact information is up-to-date for booking inquiries</span>
				</li>
				<li class="flex gap-2">
					<span class="text-green-600">✓</span>
					<span>Select the correct resort where your school operates</span>
				</li>
				<li class="flex gap-2">
					<span class="text-blue-600">→</span>
					<span>Changes to verified schools may require re-verification</span>
				</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>
