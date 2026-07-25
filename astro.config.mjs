// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, sharpImageService } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://lynkxu.com',
	integrations: [mdx(), sitemap()],
	devToolbar: {
		enabled: false,
	},
	compressHTML: true,

	image: {
		service: sharpImageService(),
	},

	markdown: {
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'material-theme-darker',
			},
			wrap: true,
		},
	},
	vite: {
		plugins: [tailwindcss()],
		assetsInclude: ['**/*.HEIC', '**/*.heic'],
		build: {
			cssCodeSplit: true,
		},
	},
});
