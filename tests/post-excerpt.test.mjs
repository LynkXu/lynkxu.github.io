import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const { toArticleExcerpt } = await import('../src/utils/plain-text.ts');
const blogPage = readFileSync(
	new URL('../src/pages/blog/[...slug].astro', import.meta.url),
	'utf8',
);
const searchIndex = readFileSync(
	new URL('../src/pages/search-index.json.ts', import.meta.url),
	'utf8',
);
const feed = readFileSync(new URL('../src/pages/index.xml.js', import.meta.url), 'utf8');

test('article excerpt selects the first meaningful paragraph', () => {
	const body = [
		'## 标题',
		'',
		'<img src="/cover.jpg" alt="封面" />',
		'',
		'> 这是一段引用，不应作为摘要。',
		'',
		'```ts',
		'const ignored = true;',
		'```',
		'',
		'第一段正文，包含 [链接](https://example.com)。',
		'',
		'第二段正文。',
	].join('\n');

	assert.equal(toArticleExcerpt(body, 120), '第一段正文，包含 链接。');
});

test('article excerpt truncates long prose at the requested length', () => {
	assert.equal(toArticleExcerpt('这是一段足够长的正文内容。', 8), '这是一段足够长的...');
});

test('manual descriptions take priority and generated excerpts backfill every metadata surface', () => {
	assert.match(blogPage, /const excerpt = toArticleExcerpt\(post\.body, 110\);/);
	assert.match(searchIndex, /post\.data\.description \|\| toArticleExcerpt\(post\.body, 110\)/);
	assert.match(feed, /post\.data\.description \|\| toArticleExcerpt\(post\.body, 110\)/);
});
