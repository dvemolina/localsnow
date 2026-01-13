<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { t } from '$lib/i18n/i18n';
	import { enhance } from '$app/forms';
	let { form } = $props();

	let submitting = $state(false);
</script>

<div class="container mx-auto max-w-2xl space-y-6">
	<div class="mb-8">
		<div class="mb-4">
			<Button href="/admin/sports" variant="outline" size="sm">
				← {$t('admin_back_to_sports')}
			</Button>
		</div>
		<h1 class="title2 mb-2">{$t('admin_create_sport')}</h1>
		<p class="text-muted-foreground">{$t('create_admin_create_sport_desc')}</p>
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
				<CardTitle>{$t('admin_sport_details')}</CardTitle>
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
						<Label for="sport">{$t('label_sport_name')} *</Label>
						<Input id="sport" name="sport" required placeholder="Snowboard" />
					</div>

					<!-- Slug -->
					<div class="space-y-2">
						<Label for="sportSlug">{$t('label_slug')} *</Label>
						<Input
							id="sportSlug"
							name="sportSlug"
							required
							placeholder="snowboard"
							pattern="[a-z0-9-]+"
						/>
						<p class="text-xs text-muted-foreground">
							{$t('label_slug_hint')}
						</p>
					</div>
				</div>

				<div class="flex gap-2 pt-4">
					<Button type="submit" disabled={submitting}>
						{#if submitting}
							{$t('button_creating')}
						{:else}
							{$t('button_create')}
						{/if}
					</Button>
					<Button href="/admin/sports" variant="outline" type="button">
						{$t('button_cancel')}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>
</div>
