<script lang="ts">
	import UserLoginForm from '$src/features/Users/components/UserLoginForm.svelte';
	import GoogleBtn from '$src/lib/components/shared/GoogleBtn.svelte';
	import { Separator } from '$src/lib/components/ui/separator/index.js';


	let { data } = $props();
</script>

<section class="grey-section px-2 border border-border flex w-full flex-col items-center justify-center bg-card">
	<UserLoginForm {data} />
	<div class="flex flex-col">
		<Separator class="mt-6 w-fit" decorative={true} orientation="horizontal" color="black"/>
		<p class="text-xs mb-6 text-muted-foreground">or </p>
	</div>
	<GoogleBtn>Access With Google Account</GoogleBtn>
</section>
