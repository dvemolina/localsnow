# Migration from Intlayer to sveltekit-i18n

## ✅ What's Done

- ✅ Removed Intlayer (had content file detection bugs)
- ✅ Installed `sveltekit-i18n`
- ✅ Restored all 1200+ translations from git history
- ✅ Set up i18n configuration in `src/lib/i18n/i18n.ts`
- ✅ Updated layout files to initialize locale
- ✅ Updated `Header.svelte` as working example
- ✅ All routing/locale detection still works

## 📝 How to Update Your Components

### Before (Intlayer):
```svelte
<script>
  import { useIntlayer } from 'svelte-intlayer';

  const nav = useIntlayer('nav');
  const home = useIntlayer('home');
</script>

<h1>{$nav.title.value}</h1>
<p>{$home.description.value}</p>
```

### After (sveltekit-i18n):
```svelte
<script>
  import { t } from '$lib/i18n/i18n';
</script>

<h1>{$t('nav_title')}</h1>
<p>{$t('home_description')}</p>
```

## 🔑 Translation Key Format

All translation keys use **underscore notation**:
- `nav_home` instead of `nav.home.value`
- `common_search` instead of `common.search.value`
- `home_hero_title` instead of `home.hero_title.value`

## 📚 Examples

### Simple Text
```svelte
<!-- Before -->
{$nav.home.value}

<!-- After -->
{$t('nav_home')}
```

### In Derived Values
```svelte
<!-- Before -->
const items = $derived([
  { label: $nav.home.value },
  { label: $nav.about.value }
]);

<!-- After -->
const items = $derived([
  { label: $t('nav_home') },
  { label: $t('nav_about') }
]);
```

### With Parameters (Interpolation)
If you need to interpolate values (like names, counts):

```svelte
<!-- Translation in en.json -->
"welcome_message": "Welcome, {name}!"

<!-- Usage -->
{$t('welcome_message', { values: { name: user.name } })}
```

## 🗂️ Translation Files Location

- English: `src/lib/i18n/translations/en.json`
- Spanish: `src/lib/i18n/translations/es.json`

## 🔍 Finding Translation Keys

All your old translations are in these JSON files with keys like:
- `nav_*` - Navigation
- `common_*` - Common UI elements
- `home_*` - Home page
- `auth_*` - Authentication
- `dashboard_*` - Dashboard
- `admin_*` - Admin pages
- etc.

Just search the JSON file for the text you need!

## ⚠️ Files That Need Updating

You'll need to update any component that currently uses:
- `import { useIntlayer } from 'svelte-intlayer'`
- `const something = useIntlayer('...')`
- `$something.key.value`

## 🚀 Quick Migration Script

For bulk updates, you can use this pattern:

1. **Find**: `import { useIntlayer } from 'svelte-intlayer';`
   **Replace**: `import { t } from '$lib/i18n/i18n';`

2. **Find**: `const (\w+) = useIntlayer\('(\w+)'\);`
   **Replace**: (remove these lines)

3. **Find**: `\$(\w+)\.(\w+)\.value`
   **Replace**: `$t('$1_$2')` (but check the actual key name in JSON!)

## 📖 sveltekit-i18n Documentation

Full docs: https://github.com/sveltekit-i18n/lib

## ✨ Benefits Over Intlayer

1. **Actually works** (no content detection bugs)
2. **Simpler API** - just `$t('key')`
3. **Stable & mature** - widely used in production
4. **Better TypeScript support** (can add later)
5. **Same routing** - your localized URLs still work

## 🆘 Need Help?

Check `src/lib/components/shared/Header.svelte` for a working example of the migration.
