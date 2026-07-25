import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { filterDrafts } from '../utils/drafts';

export const GET: APIRoute = async () => {
	const allPosts = filterDrafts(await getCollection('blog'));
	const posts = allPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const searchData = posts.map((post) => ({
		id: post.id,
		slug: post.data.slug ?? post.id,
		title: post.data.title,
		description: post.data.description || '',
		pubDate: post.data.pubDate.toISOString(),
		tags: post.data.tags || [],
		categories: post.data.categories || [],
		draft: Boolean(post.data.draft),
	}));

	return new Response(JSON.stringify(searchData), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
