import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({
		base: './src/content/blog',
		pattern: '**/*.{md,mdx}',
		generateId: ({ entry, data }) => {
			// 确保 ID 始终是字符串
			return String(data.slug || entry);
		},
	}),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			slug: z.coerce.string().optional(), // 强制转换为字符串，支持数字输入
			title: z.string(),
			description: z.string().optional(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			categories: z.array(z.string()).optional(),
			tags: z.array(z.string()).optional(),
			draft: z.boolean().default(false),
		}),
});

const page = defineCollection({
	// Load Markdown files in the `src/content/page/` directory.
	loader: glob({ base: './src/content/page', pattern: '**/*.md' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		slug: z.coerce.string(), // 强制转换为字符串，支持数字输入
		title: z.string(),
		layout: z.string().optional(),
		aliases: z.array(z.string()).optional(), // 支持多个别名
	}),
});

const gossips = defineCollection({
	loader: glob({ base: './src/content/gossips', pattern: '**/*.md' }),
	schema: () =>
		z.object({
			slug: z.coerce.string().optional(),
			tag: z.string().optional(),
			pubDate: z.coerce.date(),
			image: z.string().optional(),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog, page, gossips };
