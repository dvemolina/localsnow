<script>
	import InstructorCard from "$src/features/Instructors/components/InstructorCard.svelte";
    
    let instructorData = {};
</script>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
    <InstructorCard {instructorData} />
    <InstructorCard {instructorData} />
    <InstructorCard {instructorData} />
    <InstructorCard {instructorData} />
</div>