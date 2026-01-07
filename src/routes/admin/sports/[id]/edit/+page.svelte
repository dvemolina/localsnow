<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { useIntlayer } from 'svelte-intlayer';
	import { enhance } from '$app/forms';

	const admin = useIntlayer('admin');
	const label = useIntlayer('label');
	const button = useIntlayer('button');

	let { data, form } = $props();
	const { sport } = data;

	let submitting = $state(false);
	let deleting = $state(false);
	let showDeleteDialog = $state(false);
</script>

<div class="container mx-auto max-w-2xl space-y-6">
	<div class="mb-8">
		<div class="mb-4">
			<Button href="/admin/sports" variant="outline" size="sm">
				← {$admin.back_to_sports.value}
			</Button>
		</div>
		<h1 class="title2 mb-2">{$edit.admin_edit_sport.value}: {sport.sport}</h1>
		<p class="text-muted-foreground">{$edit.admin_edit_sport_desc.value}</p>
	</div>

	<!-- Edit Form -->
	<form
		method="POST"
		action="?/update"
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

				{#if form?.success && form?.message}
					<div class="rounded-md bg-green-100 p-3 text-sm text-green-800">
						{form.message}
					</div>
				{/if}

				<div class="space-y-4">
					<!-- ID -->
					<div class="space-y-2">
						<Label>{$label.id.value}</Label>
						<p class="text-muted-foreground">#{sport.id}</p>
					</div>

					<!-- Sport Name -->
					<div class="space-y-2">
						<Label for="sport">{$label.sport_name.value} *</Label>
						<Input id="sport" name="sport" required value={sport.sport} />
					</div>

					<!-- Slug -->
					<div class="space-y-2">
						<Label for="sportSlug">{$label.slug.value} *</Label>
						<Input
							id="sportSlug"
							name="sportSlug"
							required
							value={sport.sportSlug}
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
							{$button.updating.value}
						{:else}
							{$button.update.value}
						{/if}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>

	<!-- Danger Zone -->
	<Card class="border-destructive">
		<CardHeader>
			<CardTitle class="text-destructive">{$admin.danger_zone.value}</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-muted-foreground">
				{$edit.admin_delete_sport_warning.value}
			</p>
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>
				{$edit.button_delete_sport.value}
			</Button>
		</CardContent>
	</Card>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{$edit.admin_confirm_delete_sport.value}</AlertDialog.Title>
			<AlertDialog.Description>
				{m["admin.sports.edit.admin_delete_sport_confirmation"]({ name: sport.sport })}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{$button.cancel.value}</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					deleting = true;
					return async ({ update }) => {
						deleting = false;
						await update();
					};
				}}
			>
				<AlertDialog.Action asChild let:builder>
					<Button
						{...builder}
						type="submit"
						variant="destructive"
						disabled={deleting}
					>
						{#if deleting}
							{$button.deleting.value}
						{:else}
							{$button.delete.value}
						{/if}
					</Button>
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
