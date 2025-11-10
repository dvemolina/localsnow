<script>
	import GroupCheckboxes from "$src/lib/components/shared/GroupCheckboxes.svelte";

    // Common languages spoken in ski resorts across Europe and worldwide
    const languages = [
        { id: 'English', label: 'English' },
        { id: 'French', label: 'French' },
        { id: 'German', label: 'German' },
        { id: 'Italian', label: 'Italian' },
        { id: 'Spanish', label: 'Spanish' },
        { id: 'Portuguese', label: 'Portuguese' },
        { id: 'Dutch', label: 'Dutch' },
        { id: 'Russian', label: 'Russian' },
        { id: 'Polish', label: 'Polish' },
        { id: 'Czech', label: 'Czech' },
        { id: 'Swedish', label: 'Swedish' },
        { id: 'Norwegian', label: 'Norwegian' },
        { id: 'Danish', label: 'Danish' },
        { id: 'Finnish', label: 'Finnish' },
        { id: 'Japanese', label: 'Japanese' },
        { id: 'Chinese', label: 'Chinese' },
        { id: 'Korean', label: 'Korean' },
        { id: 'Arabic', label: 'Arabic' }
    ]

    let { form, name } = $props();
</script>

<GroupCheckboxes {form} {name} options={languages} legend='Languages Spoken' />
