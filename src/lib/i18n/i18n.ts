import { dev } from '$app/environment';
import i18n from 'sveltekit-i18n';
import type { Config } from 'sveltekit-i18n';
import type { Locale } from './routes';

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

export const { t, locale, locales, loading, setLocale, setRoute, translations } = new i18n(config);

export default i18n;
