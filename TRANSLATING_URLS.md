# Translating URLs - Complete Guide

This guide explains how to add, manage, and maintain translated URLs in the Local Snow application.

## 📚 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Adding New Routes](#adding-new-routes)
4. [Using Route Helpers](#using-route-helpers)
5. [SEO Best Practices](#seo-best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Local Snow uses **translated URL paths** for SEO optimization in Spain. This means:

- **English:** `/en/about`, `/en/instructors`
- **Spanish:** `/es/acerca-de`, `/es/instructores`

### Why Translated URLs?

✅ **Better SEO** - Spanish keywords rank higher in Spain
✅ **User Trust** - Spanish users see familiar URLs
✅ **Proper hreflang** - Google indexes language variants correctly
✅ **Higher CTR** - Spanish URLs get more clicks in Spanish search results

---

## How It Works

### Architecture

```
src/
├── lib/
│   └── i18n/
│       ├── routes.ts          # Route translation mappings
│       └── routeHelpers.ts    # Helper functions for URLs
├── params/
│   └── lang.ts                # SvelteKit param matcher
└── hooks.server.ts            # Language detection & redirects
```

### Automatic Language Detection

When a user visits your site, the system:

1. **Checks URL** for language prefix (`/es/` or `/en/`)
2. **Falls back to cookie** if no prefix found
3. **Falls back to browser language** (Accept-Language header)
4. **Redirects to localized URL** automatically

---

## Adding New Routes

### Step 1: Add Route to Configuration

Open `src/lib/i18n/routes.ts` and add your route:

```typescript
export const routeTranslations = {
	// ... existing routes ...

	// Your new route
	'/my-new-page': {
		en: '/my-new-page',
		es: '/mi-nueva-pagina'  // Spanish translation
	},

	// Dynamic routes also supported
	'/instructors/[id]': {
		en: '/instructors',      // Base path only
		es: '/instructores'
	}
} as const;
```

### Step 2: Create Your SvelteKit Route

Create your page as normal in `src/routes/`:

```
src/routes/my-new-page/+page.svelte
```

**That's it!** The system automatically handles:
- ✅ Language detection
- ✅ Redirects to localized URLs
- ✅ Canonical tags
- ✅ Hreflang tags
- ✅ Language switcher

---

## Using Route Helpers

### In Links (`<a>` tags)

**❌ Don't do this:**
```svelte
<a href="/about">About</a>
```

**✅ Do this:**
```svelte
<script>
	import { route } from '$lib/i18n/routeHelpers';
</script>

<a href={route('/about')}>About</a>
```

**Result:**
- English: `/en/about`
- Spanish: `/es/acerca-de`

### In Navigation Functions

```typescript
import { route } from '$lib/i18n/routeHelpers';
import { goto } from '$app/navigation';

// Navigate to localized URL
goto(route('/dashboard'));

// Force specific language
goto(route('/about', 'es')); // Always Spanish
```

### With Query Parameters

```typescript
import { route } from '$lib/i18n/routeHelpers';

// Add query params
const url = route('/instructors', undefined, { sport: 'ski', resort: 'baqueira' });
// Result: /es/instructores?sport=ski&resort=baqueira
```

### Dynamic Routes (with IDs)

```svelte
<script>
	import { route } from '$lib/i18n/routeHelpers';

	const instructorId = 123;
</script>

<a href={route(`/instructors/${instructorId}`)}>
	View Instructor
</a>
```

**Result:**
- English: `/en/instructors/123`
- Spanish: `/es/instructores/123`

---

## SEO Best Practices

### Use SEO Component

Add this to every page for proper SEO:

```svelte
<script>
	import SEOTags from '$lib/components/shared/SEOTags.svelte';
</script>

<SEOTags
	title="About Us"
	description="Learn about Local Snow - connecting ski instructors with students in Spain"
	keywords="ski instructors, Spain, Baqueira, snowboard lessons"
/>

<!-- Your page content -->
```

This automatically generates:
- ✅ Title tags
- ✅ Meta descriptions
- ✅ Canonical URLs
- ✅ Hreflang tags (en, es, x-default)
- ✅ Open Graph tags (Facebook/LinkedIn)
- ✅ Twitter Card tags
- ✅ Geographic targeting for Spain

### Canonical URLs

The system automatically sets canonical URLs:

```html
<!-- English version -->
<link rel="canonical" href="https://localsnow.org/en/about" />

<!-- Spanish version -->
<link rel="canonical" href="https://localsnow.org/es/acerca-de" />
```

### Hreflang Tags

Automatically generated for every page:

```html
<link rel="alternate" hreflang="en" href="https://localsnow.org/en/about" />
<link rel="alternate" hreflang="es" href="https://localsnow.org/es/acerca-de" />
<link rel="alternate" hreflang="x-default" href="https://localsnow.org/en/about" />
```

This tells Google:
- These pages are translations of each other
- Don't treat them as duplicate content
- Show the right version in search results

---

## Route Categories

### Translated Routes
These get full translation treatment:

- Main pages: `/about`, `/how-it-works`, `/contact`
- Instructors: `/instructors`, `/resorts`
- Auth: `/login`, `/signup`
- Dashboard: `/dashboard/*`
- Legal: `/legal/*`

### Non-Translated Routes
These stay in English:

- **API routes:** `/api/*` (never translated)
- **Admin panel:** `/admin/*` (internal tool, English only)
- **Static files:** Images, CSS, JS, etc.

---

## Language Switcher

The language switcher is already set up in your header. It automatically:

1. **Detects current page**
2. **Generates equivalent URL in other language**
3. **Preserves query parameters**
4. **Redirects user smoothly**

No configuration needed! It uses the route translation system automatically.

---

## Advanced Usage

### Checking Current Route

```typescript
import { isRoute } from '$lib/i18n/routeHelpers';
import { page } from '$app/stores';

// Check if we're on the about page (any language)
if (isRoute($page.url.pathname, '/about')) {
	// Do something
}
```

### Get Base URL (without language)

```typescript
import { getBaseUrl } from '$lib/i18n/routeHelpers';

const base = getBaseUrl('/es/acerca-de'); // Returns: '/acerca-de'
```

### Get All Alternate URLs

```typescript
import { getAlternateUrls } from '$lib/i18n/routeHelpers';

const alternates = getAlternateUrls('/about');
// Returns:
// [
//   { locale: 'en', url: '/en/about' },
//   { locale: 'es', url: '/es/acerca-de' }
// ]
```

---

## Troubleshooting

### URLs Not Redirecting

**Problem:** Visiting `/about` doesn't redirect to `/es/acerca-de`

**Solution:** Check:
1. Route is added to `routeTranslations` in `routes.ts`
2. `hooks.server.ts` includes `languageHandle`
3. Clear browser cache and cookies

### Links Not Translating

**Problem:** Links show English URLs even in Spanish

**Solution:**
```svelte
<!-- Bad -->
<a href="/about">About</a>

<!-- Good -->
<script>
	import { route } from '$lib/i18n/routeHelpers';
</script>
<a href={route('/about')}>About</a>
```

### SEO Tags Not Showing

**Problem:** No hreflang tags in HTML

**Solution:** Add `SEOTags` component to your page:

```svelte
<script>
	import SEOTags from '$lib/components/shared/SEOTags.svelte';
</script>

<SEOTags title="Page Title" description="Page description" />
```

### 404 on Translated URL

**Problem:** `/es/acerca-de` returns 404

**Solution:**
1. Verify route exists in `routeTranslations`
2. Check SvelteKit route file exists: `src/routes/about/+page.svelte`
3. Restart dev server: `npm run dev`

---

## Quick Reference

### Common Routes

| English URL | Spanish URL | Route Key |
|------------|-------------|-----------|
| `/en/about` | `/es/acerca-de` | `/about` |
| `/en/how-it-works` | `/es/como-funciona` | `/how-it-works` |
| `/en/instructors` | `/es/instructores` | `/instructors` |
| `/en/resorts` | `/es/estaciones` | `/resorts` |
| `/en/login` | `/es/iniciar-sesion` | `/login` |
| `/en/signup` | `/es/registrarse` | `/signup` |
| `/en/dashboard` | `/es/panel` | `/dashboard` |

### Helper Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `route(path, locale?)` | Generate localized URL | `route('/about')` → `/es/acerca-de` |
| `getAlternateUrls(path)` | Get all language versions | For hreflang tags |
| `getCanonicalUrl(url, locale)` | Get canonical URL | For SEO |
| `isRoute(pathname, routeKey)` | Check current route | Navigation highlighting |
| `getLocalizedRedirect(path, locale)` | Get redirect URL | Language switcher |

---

## Testing Your Routes

### 1. Test Language Detection

Visit homepage without language prefix:
```
http://localhost:5173/
```

Should redirect to:
- `/en/` (if browser language is English)
- `/es/` (if browser language is Spanish)

### 2. Test Language Switcher

1. Visit any page (e.g., `/en/about`)
2. Click language switcher
3. Should navigate to `/es/acerca-de`
4. Content should be in Spanish

### 3. Test SEO Tags

1. View page source (right-click → View Page Source)
2. Look for:
   ```html
   <link rel="canonical" href="..." />
   <link rel="alternate" hreflang="es" href="..." />
   <link rel="alternate" hreflang="en" href="..." />
   ```

### 4. Test Direct URL Access

Try accessing Spanish URLs directly:
```
http://localhost:5173/es/acerca-de
http://localhost:5173/es/instructores
```

Should work without redirecting.

---

## Best Practices

### ✅ DO:

- Use `route()` helper for all internal links
- Add new routes to `routes.ts` immediately
- Use `SEOTags` component on every page
- Test both languages when adding routes
- Keep API routes unlocalized (`/api/*`)

### ❌ DON'T:

- Hardcode URLs like `/about` or `/es/about`
- Forget to add Spanish translation to `routes.ts`
- Skip SEO tags on new pages
- Translate admin routes (keep in English)
- Translate API endpoints

---

## Support

If you need help with route translation:

1. Check this documentation
2. Look at existing route examples in `routes.ts`
3. Test with `route()` helper in browser console
4. Check browser network tab for redirects

**Remember:** The system is designed to be automatic. Once a route is added to `routes.ts`, everything else works automatically!
