import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(
	new URL('../src/layouts/About.astro', import.meta.url),
	'utf8',
);
const content = readFileSync(
	new URL('../src/content/page/about.mdx', import.meta.url),
	'utf8',
);

test('about page is a concise reading-first personal note', () => {
	assert.match(layout, /<h1 id="about-title" class=\{pageTitleClass\}>关于我<\/h1>/);
	assert.match(content, /### 生平/);
	assert.match(content, /### 最近/);
	assert.match(content, /### 联系/);
	assert.match(content, /import AboutTraits from ['"]\.\.\/\.\.\/components\/AboutTraits\.astro['"]/);
	assert.match(content, /import AboutTraits from ['"]\.\.\/\.\.\/components\/AboutTraits\.astro['"];\s*<AboutTraits \/>\s*以前叫 Link/);
	assert.match(content, /初中开始接触智能手机/);
	assert.match(content, /最近比较感兴趣的是「马拉松」和 「AI」/);
	assert.doesNotMatch(content, /寻找真正喜欢并愿意长期做的事/);
});

test('about page keeps contact, blog history and sponsor details', () => {
	assert.match(content, /\[Email\]\(mailto:xulinxiao@live\.com\)/);
	assert.match(layout, /import SponsorAbout from ['"]\.\.\/components\/SponsorAbout\.astro['"]/);
	assert.match(layout, /const blogHistory = \[/);
	assert.match(layout, /购买 lynkxu\.com/);
	assert.match(layout, /<h2 id="about-more-title" class=\{extrasTitleClass\}>附记<\/h2>/);
	assert.match(layout, /<summary class=\{historySummaryClass\}>博客历史<\/summary>/);
	assert.doesNotMatch(layout, /const traits = \[|r-about__traits/);
	assert.match(layout, /<summary class=\{sponsorSummaryClass\}>赞助<\/summary>/);
	assert.match(layout, /<SponsorAbout \/>/);
	assert.doesNotMatch(layout, /AVATAR_IMAGE/);
	assert.doesNotMatch(content, /\n---\n\n<p class="r-about__closing">/);
});

test('about page uses the shared reading shell without profile cards', () => {
	assert.match(layout, /<ReadingShell title=\{title\} description=\{title\}>/);
	assert.match(layout, /const proseClass = 'r-about__prose r-prose /);
	assert.match(layout, /headerClass = 'r-about__header mb-\[var\(--r-space-md\)\]/);
	assert.match(layout, /\[&_h3\]:!mt-\[var\(--r-space-lg\)\]/);
	assert.match(layout, /\[&_h3\]:!mb-\[var\(--r-space-sm\)\]/);
	assert.match(layout, /\[&_p\]:!mb-\[0\.65em\]/);
	assert.doesNotMatch(layout, /\[&_h3\]:!mt-\[var\(--r-space-xl\)\]/);
	assert.doesNotMatch(layout, /rounded-full|metaBlockClass|r-about__avatar/);
	assert.match(layout, /<\/article>\s*<aside class=\{extrasClass\}/);
});
