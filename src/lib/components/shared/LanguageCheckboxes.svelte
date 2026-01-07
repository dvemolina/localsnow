<script>
	import GroupCheckboxes from "$src/lib/components/shared/GroupCheckboxes.svelte";
	import { useIntlayer } from 'svelte-intlayer';

	const lang = useIntlayer('lang');
	const languages = useIntlayer('languages');

    // Common languages spoken in ski resorts across Europe and worldwide
    const languages = $derived([
        { id: 'English', label: $lang.english.value },
        { id: 'French', label: $lang.french.value },
        { id: 'German', label: $lang.german.value },
        { id: 'Italian', label: $lang.italian.value },
        { id: 'Spanish', label: $lang.spanish.value },
        { id: 'Portuguese', label: $lang.portuguese.value },
        { id: 'Dutch', label: $lang.dutch.value },
        { id: 'Russian', label: $lang.russian.value },
        { id: 'Polish', label: $lang.polish.value },
        { id: 'Czech', label: $lang.czech.value },
        { id: 'Swedish', label: $lang.swedish.value },
        { id: 'Norwegian', label: $lang.norwegian.value },
        { id: 'Danish', label: $lang.danish.value },
        { id: 'Finnish', label: $lang.finnish.value },
        { id: 'Japanese', label: $lang.japanese.value },
        { id: 'Chinese', label: $lang.chinese.value },
        { id: 'Korean', label: $lang.korean.value },
        { id: 'Arabic', label: $lang.arabic.value }
    ]);

    let { form, name } = $props();
</script>

<GroupCheckboxes {form} {name} options={languages} legend={$languages.spoken.value} />
