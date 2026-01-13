// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$src/lib/server/session').SessionValidationResult['user'];
			session: import('$src/lib/server/session').SessionValidationResult['session'];
			locale: import('$lib/i18n/routes').Locale;
		}
	}
}

export {};
