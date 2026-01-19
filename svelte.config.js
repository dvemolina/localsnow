import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// Trust proxy headers from Traefik
			// This is required when running behind a reverse proxy
			out: 'build',
			precompress: false,
			envPrefix: '',
			// Allow large file uploads (20MB) for instructor signup forms
			// Profile images (max 5MB) + qualification PDFs (max 10MB)
			bodySize: 20 * 1024 * 1024 // 20MB in bytes
		}),

		alias: {
			$src: 'src/*'
		},

		experimental: {
			tracing: {
				server: true
			},

			instrumentation: {
				server: true
			}
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
