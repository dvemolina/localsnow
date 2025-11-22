/**
 * SvelteKit param matcher for language codes
 *
 * Matches valid locale codes in URL parameters
 * Usage in routes: /[lang=lang]/about/+page.svelte
 */

import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return param === 'en' || param === 'es';
};
