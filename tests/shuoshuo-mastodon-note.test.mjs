import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
	new URL('../src/layouts/Shuoshuo.astro', import.meta.url),
	'utf8',
);

test('shuoshuo identifies Mastodon as its source with a safe external profile link', () => {
	const header = source.match(/<header class="r-memos__head">([\s\S]*?)<\/header>/)?.[1] || '';

	assert.match(
		header,
		/<p class=\{pageNoteClass\}>(?:(?!<\/p>)[\s\S])*偶尔记录一些不值得写成长文的瞬间（内容同步自(?:(?!<\/p>)[\s\S])*<\/p>/,
	);
	assert.doesNotMatch(header, /ml-auto/);
	assert.doesNotMatch(header, /前往主页|aria-hidden="true">·/);
	assert.match(header, /href="https:\/\/mastodon\.social\/@lynkxu"/);
	assert.match(header, /target="_blank"/);
	assert.match(header, /rel="noopener noreferrer"/);
});
