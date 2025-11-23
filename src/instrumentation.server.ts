import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://0e0dd1f08fb0eb3b21e97f1667d1ed1d@o4510409040199680.ingest.de.sentry.io/4510409050685520',

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
