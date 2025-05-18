<script>
	import InstructorSignupForm from '$src/features/Instructors/components/InstructorSignupForm.svelte';

	let { data } = $props();
</script>

<p class="title3">Enter Profesional Details</p>
<p class="hyphens-auto text-muted-foreground">
	You'll be able to change this details in your Profile tab once you account type is enabled. Your
	qualification is going to be verified. We may contact you asking to provide more detailed info.
</p>
<InstructorSignupForm {data} />
