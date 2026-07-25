import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_AUTHOR } from '../consts';
import { filterDrafts } from '../utils/drafts';

export async function GET(context) {
	const posts = filterDrafts(await getCollection('blog'));
	posts.sort((a, b) => b.data.pubDate - a.data.pubDate);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			author: SITE_AUTHOR,
			link: `/blog/${post.data.slug ?? post.id}.html`,
			pubDate: post.data.pubDate,
			description: post.summary,
			content: post.body,
		})),
	});
}
