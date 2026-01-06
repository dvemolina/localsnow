<script lang="ts">
	import UserLoginForm from '$src/features/Users/components/UserLoginForm.svelte';
	import GoogleBtn from '$src/lib/components/shared/GoogleBtn.svelte';
	import { Separator } from '$src/lib/components/ui/separator/index.js';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<section
	class="grey-section flex w-full flex-col items-center justify-center border border-border bg-card px-2 pb-16"
>
	{#if data.redirectMessage}
		<p class="title3 mb-8 text-center">{data.redirectMessage}</p>
	{/if}
	<UserLoginForm {data} />
	<div class="flex flex-col">
		<Separator class="mt-6 w-fit" decorative={true} orientation="horizontal" color="black" />
		<p class="mb-6 text-xs text-muted-foreground">{m["login.auth_or"]()}</p>
	</div>
	<GoogleBtn>{m["login.auth_access_google"]()}</GoogleBtn>
</section>
