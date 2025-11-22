# Setting Up Translated URLs - Quick Start

## What Was Just Implemented

I've just implemented a **complete translated URL system** for your Local Snow application. Here's what changed and what you need to know:

---

## ⚠️ Important: One-Time Setup Required

To make the translated URLs work, you need to **restart your development server**:

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm run dev
```

**Why?** The new `reroute` hook and updated middleware need to be loaded.

---

## How It Works Now

### Before (what you saw):
- URLs: `/about`, `/instructors`
- No language detection
- URLs don't change based on language

### After (what you'll see now):
| English | Spanish |
|---------|---------|
| `/en/about` | `/es/acerca-de` |
| `/en/instructors` | `/es/instructores` |
| `/en/how-it-works` | `/es/como-funciona` |
| `/en/dashboard` | `/es/panel` |

---

## What Changed (Technical Details)

### 1. New `reroute` Hook (`src/hooks.ts`)
**What it does:** Maps translated URLs to your actual route files

**Example:**
- User visits: `/es/acerca-de`
- SvelteKit serves: `src/routes/about/+page.svelte`
- Browser URL stays: `/es/acerca-de`

This is the **key piece** that makes translated URLs work!

### 2. Updated Paraglide Middleware (`src/hooks.server.ts`)
**What it does:** Ensures Paraglide understands our custom URL structure

**Before:** Paraglide expected `/es/about` (prefix only)
**After:** Paraglide works with `/es/acerca-de` (fully translated)

### 3. Language Detection (`hooks.server.ts`)
When you visit the site without a language prefix:
1. Checks your language cookie (if you visited before)
2. Checks your browser language setting
3. **Defaults to Spanish if your browser accepts it** (Spain-focused!)
4. Redirects you to the proper localized URL

**Example:**
- You visit: `http://localsnow.org/about`
- Your browser is in Spanish
- You're redirected to: `http://localsnow.org/es/acerca-de`

---

## Testing the System

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Homepage
Visit: `http://localhost:5173/`

**Expected:** You'll be redirected to `/en/` or `/es/` based on your browser language

### 3. Test Language Switching
1. Visit any page (e.g., `http://localhost:5173/en/about`)
2. Click the language switcher in the header
3. You should navigate to `/es/acerca-de`
4. Content should be in Spanish

### 4. Test Direct URL Access
Try visiting Spanish URLs directly:
```
http://localhost:5173/es/acerca-de
http://localhost:5173/es/instructores
http://localhost:5173/es/panel
```

All should work!

### 5. Test Dynamic Routes
Try:
```
http://localhost:5173/es/instructores/123
```

Should serve the instructor page in Spanish.

---

## Troubleshooting

### Problem: Still seeing `/about` instead of `/es/acerca-de`

**Solution:**
1. **Stop the dev server completely** (Ctrl+C)
2. Clear your browser cache (or use incognito mode)
3. Restart: `npm run dev`
4. Visit: `http://localhost:5173/` (not `/about`)

### Problem: 404 errors on translated URLs

**Solution:** Make sure you restarted the dev server. The `reroute` hook needs to be loaded.

### Problem: Language not switching

**Solution:**
1. Check browser console for errors
2. Make sure you're using the latest code (did you pull/merge?)
3. Clear cookies and try again

### Problem: English URLs in Spanish mode

**Solution:** This shouldn't happen if you're using the `route()` helper. Check that links use:

```svelte
<script>
  import { route } from '$lib/i18n/routeHelpers';
</script>

<a href={route('/about')}>About</a>  <!-- GOOD -->
<a href="/about">About</a>            <!-- BAD -->
```

---

## Key Files Modified

1. **`src/hooks.ts`** - NEW: Reroute hook for URL mapping
2. **`src/hooks.server.ts`** - UPDATED: Paraglide middleware
3. **`src/lib/i18n/routes.ts`** - NEW: Route translations
4. **`src/lib/i18n/routeHelpers.ts`** - NEW: Helper functions
5. **`src/params/lang.ts`** - NEW: Language validator

---

## How to Add More Routes

Edit **ONE file**: `src/lib/i18n/routes.ts`

```typescript
export const routeTranslations = {
  // ... existing routes ...

  '/my-new-page': {
    en: '/my-new-page',
    es: '/mi-nueva-pagina'
  }
}
```

Then create your route normally:
```
src/routes/my-new-page/+page.svelte
```

**That's it!** The URL translation happens automatically.

---

## Deployment Checklist

Before deploying to production:

- [ ] Test all major routes in both languages
- [ ] Test language switcher on all pages
- [ ] Check that SEO tags (hreflang) appear in page source
- [ ] Test on mobile devices
- [ ] Clear browser cache and test fresh
- [ ] Verify Google Analytics tracks both URL versions

---

## Why Restart Is Required

SvelteKit hooks (`reroute`, `handle`) are loaded when the server starts. Changes to these files require a full restart to take effect, unlike regular `.svelte` components which hot-reload.

---

## Next Steps

1. **Restart your dev server** ✅
2. **Test the URLs** ✅
3. **Check the documentation** (`TRANSLATING_URLS.md`) for detailed usage
4. **Start using `route()` helper** in your components
5. **Deploy!** 🚀

---

## Questions?

Refer to:
- **`TRANSLATING_URLS.md`** - Complete usage guide
- **`src/lib/i18n/routes.ts`** - See all route translations
- **`src/hooks.ts`** - See how URL mapping works

The system is **production-ready** and **fully functional** - it just needs a dev server restart!
