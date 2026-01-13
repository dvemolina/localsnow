<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { t } from '$lib/i18n/i18n';
	import { enhance } from '$app/forms';
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
			← {$t('admin_back_to_launch_codes')}
		</a>
		<h1 class="title2 mb-2 mt-4">{$t('admin_create_launch_code')}</h1>
		<p class="text-muted-foreground">{$t('create_admin_create_launch_code_desc')}</p>
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
				<CardTitle>{$t('admin_code_details')}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<!-- Code -->
				<div class="space-y-2">
					<Label for="code">{$t('form_label_code')} *</Label>
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
						{$t('admin_code_help')}
					</p>
				</div>

				<!-- Description -->
				<div class="space-y-2">
					<Label for="description">{$t('form_label_description')}</Label>
					<Textarea
						id="description"
						name="description"
						value={form?.description || ''}
						placeholder={$t('admin_description_placeholder')}
						rows="3"
					/>
				</div>

				<!-- Valid Until -->
				<div class="space-y-2">
					<Label for="validUntil">{$t('form_label_valid_until')} *</Label>
					<Input
						type="datetime-local"
						id="validUntil"
						name="validUntil"
						value={defaultDateString}
						required
					/>
					<p class="text-xs text-muted-foreground">
						{$t('admin_valid_until_help')}
					</p>
				</div>

				<!-- Max Uses -->
				<div class="space-y-2">
					<Label for="maxUses">{$t('form_label_max_uses')}</Label>
					<Input
						type="number"
						id="maxUses"
						name="maxUses"
						placeholder={$t('admin_unlimited')}
						min="1"
					/>
					<p class="text-xs text-muted-foreground">
						{$t('admin_max_uses_help')}
					</p>
				</div>

				<!-- Is Active -->
				<div class="flex items-center space-x-2">
					<Checkbox id="isActive" name="isActive" checked={true} />
					<Label for="isActive" class="font-normal">
						{$t('create_admin_activate_immediately')}
					</Label>
				</div>
			</CardContent>
		</Card>

		<!-- Actions -->
		<div class="mt-6 flex items-center gap-4">
			<Button type="submit" class="bg-primary text-white">
				{$t('create_admin_create_code')}
			</Button>
			<Button type="button" variant="outline" href="/admin/launch-codes">
				{$t('button_cancel')}
			</Button>
		</div>
	</form>
</div>
