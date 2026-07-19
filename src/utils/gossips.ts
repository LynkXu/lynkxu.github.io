import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';
import { filterDrafts } from './drafts';

export type GossipItem = {
	data: {
		pubDate: Date;
		slug?: string;
		draft?: boolean;
		tag?: string;
		image?: string;
	};
	body: string;
	_raw?: {
		id?: string;
		media_attachments?: unknown[];
		content_markdown?: string;
	};
};

function loadMastodonGossips(): GossipItem[] {
	try {
		const mastodonDataPath = path.join(process.cwd(), 'src/data/mastodon.json');
		if (!fs.existsSync(mastodonDataPath)) return [];

		const mastodonData = JSON.parse(fs.readFileSync(mastodonDataPath, 'utf-8')) as Array<{
			id: string;
			created_at: string;
			content_markdown?: string;
			media_attachments?: unknown[];
		}>;

		return mastodonData.map((status) => ({
			data: {
				pubDate: new Date(status.created_at),
				slug: `mastodon-${status.id}`,
				draft: false,
				tag: 'mastodon',
			},
			body: status.content_markdown || '',
			_raw: status,
		}));
	} catch (error) {
		console.warn('Failed to load Mastodon data:', error);
		return [];
	}
}

export async function getAllGossips(): Promise<GossipItem[]> {
	const fileGossips = filterDrafts(await getCollection('gossips')) as GossipItem[];
	const mastodonGossips = loadMastodonGossips();

	return [...fileGossips, ...mastodonGossips].sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}
