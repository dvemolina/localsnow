<script lang="ts">
	import UserSignupForm from '$src/features/Users/components/UserSignupForm.svelte';
	import GoogleBtn from '$src/lib/components/shared/GoogleBtn.svelte';
	import { Separator } from '$src/lib/components/ui/separator/index.js';
	import { t } from '$lib/i18n/i18n';
	let { data } = $props();
</script>

<section class="grey-section px-2 border border-border flex flex-col items-center justify-center w-full bg-card">
	<p class="title3 mb-8 text-center">{$t('auth_join_network')}</p>
	<GoogleBtn>{$t('auth_signup_google')}</GoogleBtn>
	<div class="flex flex-col">
		<Separator class="mt-6 w-fit" decorative={true} orientation="horizontal"/>
		<p class="text-xs mb-6 text-muted-foreground">{$t('auth_or_create_account')}</p>
	</div>
	<UserSignupForm {data} />
</section>
