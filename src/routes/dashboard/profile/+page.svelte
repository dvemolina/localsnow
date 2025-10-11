<script>
	import InstructorProfileForm from '$src/features/Instructors/components/InstructorProfileForm.svelte';
	import UserProfileForm from '$src/features/Users/components/UserProfileForm.svelte';

	let { data } = $props();

</script>

<!-- Always show this section -->
<section
	class="grey-section flex w-full flex-col items-center justify-center border border-border bg-card px-4 py-4 mb-4"
>
	<p class="title4 mb-8 text-center">User Profile Data</p>
	<UserProfileForm userForm={data.userForm}/>
</section>

<!-- Conditionally show a second section based on role -->
{#if data.user.role === "instructor-independent"}
	<section
		class="grey-section flex w-full flex-col items-center justify-center border border-border bg-card px-4 py-4"
	>
		<p class="title4 mb-8 text-center">Independent Instructor Profile Data</p>
		<InstructorProfileForm instructorForm={data.instructorForm}/>
	</section>
{:else if data.user.role === "instructor-school"}
	<section
		class="grey-section flex w-full flex-col items-center justify-center border border-border bg-card px-4 py-4"
	>
		<p class="title4 mb-8 text-center">School Instructor Profile Data</p>
		<InstructorProfileForm instructorForm={data.instructorForm} />
	</section>
{:else if data.user.role === "school-admin"}
	<section
		class="grey-section flex w-full flex-col items-center justify-center border border-border bg-card px-4 py-4"
	>
		<p class="title4 mb-8 text-center">School Profile Data</p>
		<InstructorProfileForm instructorForm={data.instructorForm} />
	</section>
{/if}

