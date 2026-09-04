import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
	new URL('../src/layouts/ReadingShell.astro', import.meta.url),
	'utf8',
);

test('reading shell exposes the current primary navigation', () => {
	for (const [href, label] of [
		['/blog', '归档'],
		['/shuoshuo', '碎语'],
		['/message', '留言'],
		['/about', '关于'],
	]) {
		assert.match(source, new RegExp(`\{ href: '${href}', label: '${label}' \}`));
	}

	assert.match(source, /SHOW_WORKS_NAV \? \[\{ href: '\/works', label: '作品' \}\] : \[\]/);
	assert.match(source, /<nav class=\{navClass\} aria-label="主导航">/);
});

test('brand links home and navigation marks nested routes active', () => {
	assert.match(source, /<a href="\/" class=\{brandClass\} aria-label=\{`\$\{SITE_TITLE\} 首页`\}>/);
	assert.match(source, /function normalizePath\(path: string\)/);
	assert.match(source, /return current === target \|\| current\.startsWith\(`\$\{target\}\/`\);/);
	assert.match(source, /active: isActive\(item\.href\)/);
});

test('header remains responsive and keeps accessible utility controls', () => {
	assert.match(source, /const headerClass = [^;]*max-\[640px\]:grid/);
	assert.match(source, /const navClass = [^;]*max-\[640px\]:col-span-2/);
	assert.match(source, /id="search-fab"[\s\S]*aria-label="搜索文章"/);
	assert.match(source, /id="theme-toggle-fab"[\s\S]*aria-label="切换深色模式"/);
});

test('reading measure and footer links preserve the current shell contract', () => {
	assert.match(source, /w-\[min\(calc\(100%_-_var\(--r-page-inline\)_\*_2\),var\(--r-measure\)\)\]/);
	assert.match(source, /<main class="reading-shell__main min-w-0 flex-1">/);
	for (const [href, label] of [
		['/photography', '摄影'],
		['/media', '书影音'],
		['/travel', '旅行'],
		['/sports', '运动'],
		['/tools', '工具'],
		['/index.xml', 'RSS'],
	]) {
		assert.match(source, new RegExp(`\{ href: '${href}', label: '${label}' \}`));
	}
	assert.match(source, /aria-label="专题与订阅"/);
});
