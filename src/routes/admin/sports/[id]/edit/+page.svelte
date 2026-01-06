<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as m from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';

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
				← {m.admin_back_to_sports()}
			</Button>
		</div>
		<h1 class="title2 mb-2">{m["admin.sports.edit.admin_edit_sport"]()}: {sport.sport}</h1>
		<p class="text-muted-foreground">{m["admin.sports.edit.admin_edit_sport_desc"]()}</p>
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
				<CardTitle>{m.admin_sport_details()}</CardTitle>
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
						<Label>{m.label_id()}</Label>
						<p class="text-muted-foreground">#{sport.id}</p>
					</div>

					<!-- Sport Name -->
					<div class="space-y-2">
						<Label for="sport">{m.label_sport_name()} *</Label>
						<Input id="sport" name="sport" required value={sport.sport} />
					</div>

					<!-- Slug -->
					<div class="space-y-2">
						<Label for="sportSlug">{m.label_slug()} *</Label>
						<Input
							id="sportSlug"
							name="sportSlug"
							required
							value={sport.sportSlug}
							pattern="[a-z0-9-]+"
						/>
						<p class="text-xs text-muted-foreground">
							{m.label_slug_hint()}
						</p>
					</div>
				</div>

				<div class="flex gap-2 pt-4">
					<Button type="submit" disabled={submitting}>
						{#if submitting}
							{m.button_updating()}
						{:else}
							{m.button_update()}
						{/if}
					</Button>
				</div>
			</CardContent>
		</Card>
	</form>

	<!-- Danger Zone -->
	<Card class="border-destructive">
		<CardHeader>
			<CardTitle class="text-destructive">{m.admin_danger_zone()}</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4 text-sm text-muted-foreground">
				{m["admin.sports.edit.admin_delete_sport_warning"]()}
			</p>
			<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>
				{m["admin.sports.edit.button_delete_sport"]()}
			</Button>
		</CardContent>
	</Card>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m["admin.sports.edit.admin_confirm_delete_sport"]()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m["admin.sports.edit.admin_delete_sport_confirmation"]({ name: sport.sport })}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.button_cancel()}</AlertDialog.Cancel>
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
							{m.button_deleting()}
						{:else}
							{m.button_delete()}
						{/if}
					</Button>
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
