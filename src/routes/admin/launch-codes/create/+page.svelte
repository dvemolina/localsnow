<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { useIntlayer } from 'svelte-intlayer';
	import { enhance } from '$app/forms';

	const admin = useIntlayer('admin');
	const formContent = useIntlayer('form');
	const button = useIntlayer('button');

	let { form } = $props();

	// Default to one year from now
	const defaultDate = new Date();
	defaultDate.setFullYear(defaultDate.getFullYear() + 1);
	const defaultDateString = defaultDate.toISOString().slice(0, 16);
</script>

<div class="container mx-auto max-w-3xl space-y-6">
	<!-- Page Header -->
	<div class="mb-8">
		<a href="/admin/launch-codes" class="text-sm text-muted-foreground hover:text-foreground">
			← {$admin.back_to_launch_codes.value}
		</a>
		<h1 class="title2 mb-2 mt-4">{$admin.create_launch_code.value}</h1>
		<p class="text-muted-foreground">{m["admin.launch-codes.create.admin_create_launch_code_desc"]()}</p>
	</div>

	<!-- Error Message -->
	{#if form?.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
			{form.error}
		</div>
	{/if}

	<!-- Create Form -->
	<form method="POST" use:enhance>
		<Card>
			<CardHeader>
				<CardTitle>{$admin.code_details.value}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<!-- Code -->
				<div class="space-y-2">
					<Label for="code">{$formContent.label_code.value} *</Label>
					<Input
						type="text"
						id="code"
						name="code"
						value={form?.code || ''}
						placeholder="BETA2026"
						required
						class="font-mono uppercase"
						maxlength="50"
					/>
					<p class="text-xs text-muted-foreground">
						{$admin.code_help.value}
					</p>
				</div>

				<!-- Description -->
				<div class="space-y-2">
					<Label for="description">{$formContent.label_description.value}</Label>
					<Textarea
						id="description"
						name="description"
						value={form?.description || ''}
						placeholder={$admin.description_placeholder.value}
						rows="3"
					/>
				</div>

				<!-- Valid Until -->
				<div class="space-y-2">
					<Label for="validUntil">{$formContent.label_valid_until.value} *</Label>
					<Input
						type="datetime-local"
						id="validUntil"
						name="validUntil"
						value={defaultDateString}
						required
					/>
					<p class="text-xs text-muted-foreground">
						{$admin.valid_until_help.value}
					</p>
				</div>

				<!-- Max Uses -->
				<div class="space-y-2">
					<Label for="maxUses">{$formContent.label_max_uses.value}</Label>
					<Input
						type="number"
						id="maxUses"
						name="maxUses"
						placeholder={$admin.unlimited.value}
						min="1"
					/>
					<p class="text-xs text-muted-foreground">
						{$admin.max_uses_help.value}
					</p>
				</div>

				<!-- Is Active -->
				<div class="flex items-center space-x-2">
					<Checkbox id="isActive" name="isActive" checked={true} />
					<Label for="isActive" class="font-normal">
						{m["admin.launch-codes.create.admin_activate_immediately"]()}
					</Label>
				</div>
			</CardContent>
		</Card>

		<!-- Actions -->
		<div class="mt-6 flex items-center gap-4">
			<Button type="submit" class="bg-primary text-white">
				{m["admin.launch-codes.create.admin_create_code"]()}
			</Button>
			<Button type="button" variant="outline" href="/admin/launch-codes">
				{$button.cancel.value}
			</Button>
		</div>
	</form>
</div>
