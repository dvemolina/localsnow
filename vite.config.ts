import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { intlayer } from 'vite-intlayer';

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'local-snow',
				project: 'javascript-sveltekit'
			}
		}),
		tailwindcss(),
		intlayer(),
		sveltekit()
	]
});
