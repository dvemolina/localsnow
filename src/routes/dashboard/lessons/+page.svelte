<script lang="ts">
	import LessonForm from '$src/features/Lessons/components/LessonForm.svelte';

    let { data } = $props();
</script>

<LessonForm {lessonForm}/>