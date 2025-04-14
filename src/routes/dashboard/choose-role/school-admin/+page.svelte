<script>
	import SchoolSignupForm from '$src/features/Schools/components/SchoolSignupForm.svelte';

	let { data } = $props();
</script>

<p class="title3">Enter School Details</p>
<p class="text-muted-foreground hyphens-auto">School data is going to be verified. We may contact you asking to provide more detailed info in order to validate it</p>
<SchoolSignupForm {data} />
