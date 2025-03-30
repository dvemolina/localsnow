<script lang="ts">
    import { page } from '$app/state';
    import { locales, getLocale } from '$lib/paraglide/runtime';
    import { localizeHref } from '$lib/paraglide/runtime';
    
    const currentLocale = getLocale();
  </script>
  
  <div class="language-switcher">
    {#each locales as locale}
      <a 
        href={localizeHref(page.url.pathname, { locale })}
        class:active={locale === currentLocale}
        hreflang={locale}
        aria-label={`Switch to ${locale} language`}
      >
        {locale.toUpperCase()}
      </a>
    {/each}
  </div>
  
  <style>
    .language-switcher {
      display: flex;
      gap: 0.5rem;
    }
    
    .active {
      font-weight: bold;
      text-decoration: underline;
    }
  </style>