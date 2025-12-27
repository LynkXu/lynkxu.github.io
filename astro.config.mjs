// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://zishu.me',
	integrations: [mdx(), sitemap()],
	devToolbar: {
		enabled: false, // 是否开启开发工具栏
	},
	compressHTML: false, // 是否压缩 HTML 源代码

	markdown: {
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'material-theme-darker',
			},
			wrap: true, // 强制换行
		},
	},
});
