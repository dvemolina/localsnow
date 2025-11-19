<script>
	import GroupCheckboxes from "$src/lib/components/shared/GroupCheckboxes.svelte";
	import * as m from '$lib/paraglide/messages';

    // Common languages spoken in ski resorts across Europe and worldwide
    const languages = $derived([
        { id: 'English', label: m.lang_english() },
        { id: 'French', label: m.lang_french() },
        { id: 'German', label: m.lang_german() },
        { id: 'Italian', label: m.lang_italian() },
        { id: 'Spanish', label: m.lang_spanish() },
        { id: 'Portuguese', label: m.lang_portuguese() },
        { id: 'Dutch', label: m.lang_dutch() },
        { id: 'Russian', label: m.lang_russian() },
        { id: 'Polish', label: m.lang_polish() },
        { id: 'Czech', label: m.lang_czech() },
        { id: 'Swedish', label: m.lang_swedish() },
        { id: 'Norwegian', label: m.lang_norwegian() },
        { id: 'Danish', label: m.lang_danish() },
        { id: 'Finnish', label: m.lang_finnish() },
        { id: 'Japanese', label: m.lang_japanese() },
        { id: 'Chinese', label: m.lang_chinese() },
        { id: 'Korean', label: m.lang_korean() },
        { id: 'Arabic', label: m.lang_arabic() }
    ]);

    let { form, name } = $props();
</script>

<GroupCheckboxes {form} {name} options={languages} legend={m.languages_spoken()} />
