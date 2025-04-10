<script lang="ts">
	import UserSignupForm from '$src/features/Users/components/UserSignupForm.svelte';
	import GoogleBtn from '$src/lib/components/shared/GoogleBtn.svelte';
	import { Separator } from '$src/lib/components/ui/separator/index.js';

	let { data } = $props();

</script>


<section class="grey-section px-2 border border-border flex flex-col items-center justify-center w-full bg-card">
	<p class="title3 mb-8 text-center">Join Local Snow International Network</p>
	<GoogleBtn>Signup With Google Account</GoogleBtn>
	<div class="flex flex-col">
		<Separator class="mt-6 w-fit" decorative={true} orientation="horizontal"/>
		<p class="text-xs mb-6 text-muted-foreground">or create an account</p>
	</div>
	<UserSignupForm {data} />
</section>
