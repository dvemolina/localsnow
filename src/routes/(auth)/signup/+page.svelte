<script lang="ts">
	import UserSignupForm from '$src/features/Users/components/UserSignupForm.svelte';
	import GoogleBtn from '$src/lib/components/shared/GoogleBtn.svelte';
	import { Separator } from '$src/lib/components/ui/separator/index.js';
	import { useIntlayer } from 'svelte-intlayer';

	const auth = useIntlayer('auth');

	let { data } = $props();
</script>

<section class="grey-section px-2 border border-border flex flex-col items-center justify-center w-full bg-card">
	<p class="title3 mb-8 text-center">{$auth.join_network.value}</p>
	<GoogleBtn>{$auth.signup_google.value}</GoogleBtn>
	<div class="flex flex-col">
		<Separator class="mt-6 w-fit" decorative={true} orientation="horizontal"/>
		<p class="text-xs mb-6 text-muted-foreground">{$auth.or_create_account.value}</p>
	</div>
	<UserSignupForm {data} />
</section>
