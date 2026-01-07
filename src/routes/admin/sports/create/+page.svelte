<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { useIntlayer } from 'svelte-intlayer';
	import { enhance } from '$app/forms';

	const admin = useIntlayer('admin');
	const label = useIntlayer('label');
	const button = useIntlayer('button');

	let { form } = $props();

	let submitting = $state(false);
</script>

<div class="container mx-auto max-w-2xl space-y-6">
	<div class="mb-8">
		<div class="mb-4">
			<Button href="/admin/sports" variant="outline" size="sm">
				← {$admin.back_to_sports.value}
			</Button>
		</div>
		<h1 class="title2 mb-2">{$admin.create_sport.value}</h1>
		<p class="text-muted-foreground">{m["admin.sports.create.admin_create_sport_desc"]()}</p>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
	>
		<Card>
			<CardHeader>
				<CardTitle>{$admin.sport_details.value}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				{#if form?.error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{form.error}
					</div>
				{/if}

				<div class="space-y-4">
					<!-- Sport Name -->
					<div class="space-y-2">
						<Label for="sport">{$label.sport_name.value} *</Label>
						<Input id="sport" name="sport" required placeholder="Snowboard" />
					</div>

					<!-- Slug -->
					<div class="space-y-2">
						<Label for="sportSlug">{$label.slug.value} *</Label>
						<Input
							id="sportSlug"
							name="sportSlug"
							required
							placeholder="snowboard"
							pattern="[a-z0-9-]+"
						/>
						<p class="text-xs text-muted-foreground">
							{$label.slug_hint.value}
						</p>
					</div>
				</div>

				<div class="flex gap-2 pt-4">
					<Button type="submit" disabled={submitting}>
						{#if submitting}
							{$button.creating.value}
						{:else}
							{$button.create.value}
						{/if}
					</Button>
					<Button href="/admin/sports" variant="outline" type="button">
						{$button.cancel.value}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>
</div>
