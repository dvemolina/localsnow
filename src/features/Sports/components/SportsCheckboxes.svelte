<script>
	import GroupCheckboxes from "$src/lib/components/shared/GroupCheckboxes.svelte";
    
    //Hardcoded for Proto/Fast dev. 
    //Change to DB call for consistency and adapt interface structure/types to match schema.
    const sports = [
        { id: 1, label: 'Ski' },
        { id: 2, label: 'Snowboard' },
        { id: 3, label: 'Telemark' }
    ]
    
    let { form, name } = $props();
</script>

<GroupCheckboxes {form} {name} options={sports} legend='Choose Sports' />