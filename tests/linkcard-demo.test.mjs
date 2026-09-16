import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { marked } from 'marked';

test('combined style demo renders both location notes with the compact authoring shape', async () => {
	const markdown = await readFile(
		new URL('../src/content/blog/linkcard-demo/index.md', import.meta.url),
		'utf8',
	);
	const html = marked.parse(markdown);

	assert.equal(html.match(/<aside class="location-note" aria-label="地点">/g)?.length, 2);
	assert.match(html, /<strong>梯坎豆花饭<\/strong>\s*<small>重庆市渝中区中兴路 73 号<\/small>/);
	assert.match(
		html,
		/<strong>李子坝梁山鸡<\/strong>\s*<small>\s*重庆市渝中区李子坝正街 113 号 · <a href="https:\/\/surl\.amap\.com\/e8A7tJA1w6u7" target="_blank" rel="noopener noreferrer">地图 ↗<\/a>\s*<\/small>/,
	);
});
