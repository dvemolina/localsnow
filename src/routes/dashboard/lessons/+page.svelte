<script lang="ts">
	import LessonForm from '$src/features/Lessons/components/LessonForm.svelte';

    let { data } = $props();
</script>

<section
	class="grey-section flex w-full flex-col items-center justify-center border border-border bg-card px-4 py-4 mb-4"
>
	<p class="title4 mb-8 text-center">Base Lesson Data</p>
    <LessonForm lessonForm={data.lessonForm}/>
	
</section>