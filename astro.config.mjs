// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
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
		assetsInclude: ['**/*.HEIC', '**/*.heic'],
		build: {
			cssCodeSplit: true,
		},
	},
});
