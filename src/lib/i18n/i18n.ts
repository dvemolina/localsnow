import { dev } from '$app/environment';
import i18n from 'sveltekit-i18n';
import type { Config } from 'sveltekit-i18n';
import type { Locale } from './routes';
import { derived } from 'svelte/store';
import { formatMessage } from './format';

export const defaultLocale: Locale = 'en';

export const config: Config = {
	initLocale: defaultLocale,
	fallbackLocale: defaultLocale,
	loaders: [
		{
			locale: 'en',
			key: '',
			loader: async () => (await import('./translations/en.json')).default
		},
		{
			locale: 'es',
			key: '',
			loader: async () => (await import('./translations/es.json')).default
		}
	],
	log: {
		level: dev ? 'warn' : 'error'
	}
};

const i18nInstance = new i18n(config);
const { t: baseT, locale, locales, loading, setLocale, setRoute, translations } = i18nInstance;

export const t = derived(baseT, (translate) => {
	return (key: string, options?: { values?: Record<string, string | number> } | Record<string, string | number>) => {
		const result = translate(key, options as Record<string, unknown>);
		if (options && typeof options === 'object') {
			const values = 'values' in options ? options.values : options;
			if (values && typeof values === 'object') {
				return formatMessage(result, values as Record<string, string | number>);
			}
		}
		return result;
	};
});

export { locale, locales, loading, setLocale, setRoute, translations };

export default i18nInstance;
