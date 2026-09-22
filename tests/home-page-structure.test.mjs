import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
	new URL('../src/pages/index.astro', import.meta.url),
	'utf8',
);

test('homepage presents a concise content directory', () => {
	assert.match(source, /const latestPosts = posts\.slice\(0, 5\);/);
	assert.match(source, /<h1 class=\{homeIntroTextClass\}>你好，我是 Lynk。<\/h1>/);
	assert.doesNotMatch(source, /写代码，也记录生活里那些值得留下的片段。/);
	assert.match(source, /href="\/blog"[^>]*aria-label="查看全部文章"[^>]*>全部<\/a>/);
	assert.match(source, /href="\/shuoshuo"[^>]*aria-label="查看全部碎语"[^>]*>全部<\/a>/);
});

test('homepage uses the approved reading rhythm without card or grid chrome', () => {
	assert.match(source, /homeIntroClass = '[^']*mb-\[var\(--r-space-2xl\)\]/);
	assert.match(source, /homeIntroTextClass = '[^']*!\[font-size:var\(--r-text-page\)\]/);
	assert.match(source, /\.r-post-list\s*\{\s*gap:\s*var\(--r-space-sm\);/);
	assert.match(source, /\.r-section \+ \.r-section\s*\{\s*margin-top:\s*var\(--r-space-2xl\);/);
	assert.match(source, /@media \(max-width: 640px\)[\s\S]*?\.r-post-list__item[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/);
	assert.match(source, /@media \(max-width: 640px\)[\s\S]*?\.r-note-list__date[\s\S]*?grid-row:\s*2;/);
	assert.doesNotMatch(source, /card|content-grid|grid-template-columns:\s*repeat\(/);
});
