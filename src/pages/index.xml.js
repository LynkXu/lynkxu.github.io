import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_AUTHOR } from '../consts';

export async function GET(context) {
	const posts = (await getCollection('blog')).filter((post) => !post.data.draft);
	posts.sort((a, b) => b.data.pubDate - a.data.pubDate);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			author: SITE_AUTHOR,
			link: `/blog/${post.id}.html`,
			pubDate: post.data.pubDate,
			description: post.summary,
			content: post.body,
		})),
	});
}
