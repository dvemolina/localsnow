import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' }),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url','preferredLanguage', 'cookie', 'baseLocale'],
		})
	]
});
