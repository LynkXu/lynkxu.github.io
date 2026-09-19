import assert from 'node:assert/strict';
import test from 'node:test';

test('groups published travel articles by place and sorts newest first', async () => {
	let groupTravelArticlesByPlace: undefined | ((articles: any[]) => Record<string, any[]>);
	try {
		({ groupTravelArticlesByPlace } = await import('../src/lib/travel-articles.ts'));
	} catch {
		assert.fail('travel article grouping must be implemented');
	}

	const older = {
		id: 'older.md',
		data: {
			title: '旧游记',
			pubDate: new Date('2025-02-08'),
			places: ['us-houston'],
		},
	};
	const newer = {
		id: 'newer.md',
		data: {
			title: '新游记',
			pubDate: new Date('2026-09-16'),
			places: ['cn-chengdu', 'cn-chongqing'],
		},
	};
	const unrelated = {
		id: 'unrelated.md',
		data: {
			title: '普通文章',
			pubDate: new Date('2026-10-01'),
		},
	};

	const grouped = groupTravelArticlesByPlace!([older, unrelated, newer]);

	assert.deepEqual(grouped['cn-chengdu'], [newer]);
	assert.deepEqual(grouped['cn-chongqing'], [newer]);
	assert.deepEqual(grouped['us-houston'], [older]);
	assert.equal(grouped['cn-shanghai'], undefined);
});

test('builds article links from explicit slugs and collection ids', async () => {
	let getTravelArticleHref: undefined | ((article: any) => string);
	try {
		({ getTravelArticleHref } = await import('../src/lib/travel-articles.ts'));
	} catch {
		assert.fail('travel article links must be implemented');
	}

	assert.equal(
		getTravelArticleHref!({ id: 'fallback-entry.md', data: { slug: 'chosen-slug' } }),
		'/blog/chosen-slug.html',
	);
	assert.equal(
		getTravelArticleHref!({ id: 'fallback-entry.md', data: {} }),
		'/blog/fallback-entry.md.html',
	);
});
