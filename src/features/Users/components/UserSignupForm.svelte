<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { userSignupSchema, type UserSignupSchema } from '../lib/validations/userSchemas';
	import * as Form from '$src/lib/components/ui/form';
	import { Input } from '$src/lib/components/ui/input';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Checkbox } from '$src/lib/components/ui/checkbox';
	import { Label } from '$src/lib/components/ui/label';
	import { t } from '$lib/i18n/i18n';
	import { route } from '$lib/i18n/routeHelpers';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { onMount } from 'svelte';

	let { data }: { data: { form: SuperValidated<Infer<UserSignupSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(userSignupSchema)
	});

	const { form: formData, enhance } = form;

	let turnstileToken = $state('');
	let turnstileWidgetId: string | null = null;

	onMount(() => {
		// Load Turnstile script if not already loaded
		if (!document.getElementById('cf-turnstile-script')) {
			const script = document.createElement('script');
			script.id = 'cf-turnstile-script';
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}

		// Define callback for when Turnstile is ready
		(window as any).onTurnstileLoad = () => {
			if ((window as any).turnstile && PUBLIC_TURNSTILE_SITE_KEY) {
				turnstileWidgetId = (window as any).turnstile.render('#turnstile-widget', {
					sitekey: PUBLIC_TURNSTILE_SITE_KEY,
					callback: (token: string) => {
						turnstileToken = token;
					}
				});
			}
		};

		// If Turnstile is already loaded, render immediately
		if ((window as any).turnstile && PUBLIC_TURNSTILE_SITE_KEY) {
			turnstileWidgetId = (window as any).turnstile.render('#turnstile-widget', {
				sitekey: PUBLIC_TURNSTILE_SITE_KEY,
				callback: (token: string) => {
					turnstileToken = token;
				}
			});
		}

		return () => {
			// Cleanup widget on unmount
			if (turnstileWidgetId && (window as any).turnstile) {
				(window as any).turnstile.remove(turnstileWidgetId);
			}
		};
	});
</script>



<form method="POST" use:enhance>
	<div class="flex flex-col sm:flex-row gap-2 w-full">
		<Form.Field {form} name="name" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('form_label_name')}</Form.Label>
					<Input {...props} bind:value={$formData.name} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="lastName" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('form_label_last_name')}</Form.Label>
					<Input {...props} bind:value={$formData.lastName} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<div class="flex flex-col sm:flex-row gap-2 w-full">
		<Form.Field {form} name="phone" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
				<Form.Label>{$t('form_label_phone_optional')}</Form.Label>
				<Input {...props} value={$formData.phone} />
				{/snippet}
			</Form.Control>
			<Form.Description class="text-xs"
			>E.g: (+44)6870979153.</Form.Description
			>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('form_label_email')}</Form.Label>
					<Input {...props} bind:value={$formData.email} type="email" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>
	<Form.Field {form} name="password" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{$t('form_label_password')}</Form.Label>
				<Input {...props} bind:value={$formData.password} type="password" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="acceptedTerms" class="w-full mt-6">
		<Form.Control>
			{#snippet children({ props })}
				<div class="items-top flex space-x-2">
					<Checkbox {...props} bind:checked={$formData.acceptedTerms} required={true}/>
					<div class="grid gap-1.5 leading-none">
					  <Label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					  >
						Accept terms and conditions
					  </Label>
					  <p class="text-muted-foreground text-sm">
						You agree to our <a href="/terms-conditions">Terms of Service</a> and <a href="/privay-policy">Privacy Policy</a>.
					  </p>
					</div>
				  </div>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

	<!-- Cloudflare Turnstile Widget -->
	<div id="turnstile-widget" class="mt-4"></div>
	<input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

    <div class="flex flex-row gap-2 items-center justify-center w-full mt-6">
        <Form.Button disabled={!turnstileToken}>{$t('common_submit')}</Form.Button>
        <a href={route('/login')} class="text-sm {buttonVariants({ variant: "outline-solid" })}">{$t('login_already_have_account')}</a>
    </div>
</form>
