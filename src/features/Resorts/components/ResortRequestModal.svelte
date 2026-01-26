<script lang="ts">
	import * as Dialog from '$src/lib/components/ui/dialog';
	import ResortRequestForm from './ResortRequestForm.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { resortRequestSchema } from '../lib/resortSchemas';
	import { t } from '$lib/i18n/i18n';
	import type { Country, Region } from '$lib/server/db/schema';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		countries,
		regions
	}: {
		open?: boolean;
		countries: Country[];
		regions: Region[];
	} = $props();

	let isSubmitting = $state(false);

	// Initialize form
	const form = superForm(
		{
			resortName: '',
			countryId: 0,
			regionId: null,
			website: '',
			additionalInfo: ''
		},
		{
			validators: zodClient(resortRequestSchema),
			onSubmit: async ({ formData }) => {
				isSubmitting = true;
			},
			onResult: async ({ result }) => {
				isSubmitting = false;

				if (result.type === 'success') {
					toast.success($t('resort_request_success_title'), {
						description: $t('resort_request_success_message')
					});
					open = false;
					// Reset form
					form.reset();
				} else if (result.type === 'failure') {
					toast.error($t('resort_request_error'));
				}
			},
			onError: () => {
				isSubmitting = false;
				toast.error($t('resort_request_error'));
			}
		}
	);

	const { enhance } = form;

	async function handleSubmit() {
		isSubmitting = true;

		try {
			const response = await fetch('/api/resorts/request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($form.form)
			});

			if (response.ok) {
				toast.success($t('resort_request_success_title'), {
					description: $t('resort_request_success_message')
				});
				open = false;
				// Reset form
				form.reset();
			} else {
				const error = await response.json();
				toast.error($t('resort_request_error'));
				console.error('Resort request failed:', error);
			}
		} catch (error) {
			toast.error($t('resort_request_error'));
			console.error('Resort request error:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{$t('resort_request_modal_title')}</Dialog.Title>
			<Dialog.Description>
				{$t('resort_request_modal_description')}
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<ResortRequestForm
				{form}
				{countries}
				{regions}
				{isSubmitting}
				onCancel={() => (open = false)}
			/>
		</form>
	</Dialog.Content>
</Dialog.Root>
