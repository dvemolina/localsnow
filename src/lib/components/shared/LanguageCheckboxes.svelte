<script>
	import GroupCheckboxes from "$src/lib/components/shared/GroupCheckboxes.svelte";
	import { t } from '$lib/i18n/i18n';
    // Common languages spoken in ski resorts across Europe and worldwide
    const languages = $derived([
        { id: 'English', label: $t('lang_english') },
        { id: 'French', label: $t('lang_french') },
        { id: 'German', label: $t('lang_german') },
        { id: 'Italian', label: $t('lang_italian') },
        { id: 'Spanish', label: $t('lang_spanish') },
        { id: 'Portuguese', label: $t('lang_portuguese') },
        { id: 'Dutch', label: $t('lang_dutch') },
        { id: 'Russian', label: $t('lang_russian') },
        { id: 'Polish', label: $t('lang_polish') },
        { id: 'Czech', label: $t('lang_czech') },
        { id: 'Swedish', label: $t('lang_swedish') },
        { id: 'Norwegian', label: $t('lang_norwegian') },
        { id: 'Danish', label: $t('lang_danish') },
        { id: 'Finnish', label: $t('lang_finnish') },
        { id: 'Japanese', label: $t('lang_japanese') },
        { id: 'Chinese', label: $t('lang_chinese') },
        { id: 'Korean', label: $t('lang_korean') },
        { id: 'Arabic', label: $t('lang_arabic') }
    ]);

    let { form, name } = $props();
</script>

<GroupCheckboxes {form} {name} options={languages} legend={$languages.spoken.value} />
