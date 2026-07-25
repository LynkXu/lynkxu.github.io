import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const exists = (file) => existsSync(new URL(`../${file}`, import.meta.url));

test('Tailwind is integrated without the global preflight reset', () => {
  const tailwind = read('src/styles/tailwind.css');

  assert.match(tailwind, /@import\s+["']tailwindcss\/theme\.css["']/);
  assert.match(tailwind, /@import\s+["']tailwindcss\/utilities\.css["']/);
  assert.doesNotMatch(tailwind, /@import\s+["']tailwindcss\/preflight\.css["']/);
  assert.doesNotMatch(tailwind, /@import\s+["']tailwindcss["']/);
});

test('site header chrome is composed with Tailwind utilities', () => {
  const header = read('src/components/Header.astro');
  const headerLink = read('src/components/HeaderLink.astro');
  const style = read('src/styles/style.scss');

  assert.match(header, /md:grid-cols-\[auto_minmax\(0,1fr\)\]/);
  assert.match(header, /\[font-family:var\(--brand-font\)\]/);
  assert.match(headerLink, /\[font-family:var\(--ui-font\)\]/);
  assert.doesNotMatch(style, /^header nav\s*\{/m);
  assert.doesNotMatch(style, /^\.global-layout-card > header\s*\{/m);
  assert.doesNotMatch(style, /^\.site-name\s*\{/m);
});

test('reading list patterns live in the Tailwind component layer', () => {
  const tailwind = read('src/styles/tailwind.css');
  const blogIndex = read('src/pages/blog/index.astro');
  const tagPage = read('src/pages/tags/[tag].astro');

  assert.match(tailwind, /@layer components\s*\{/);
  for (const selector of ['r-section', 'r-post-list', 'r-note-list', 'r-year-block', 'r-draft']) {
    assert.match(tailwind, new RegExp(`\\.${selector}(?![\\w-])`));
  }
  assert.doesNotMatch(blogIndex, /\.r-draft\s*\{/);
  assert.doesNotMatch(tagPage, /\.r-draft\s*\{/);
});

test('reading surface root typography is isolated from global body styles', () => {
  const tailwind = read('src/styles/tailwind.css');

  assert.match(tailwind, /body\.reading-surface\s*\{[\s\S]*font-family:\s*var\(--r-font-body\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface\s*\{[\s\S]*font-size:\s*var\(--r-text\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface\s*\{[\s\S]*line-height:\s*var\(--r-lh-body\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface\s*\{[\s\S]*-webkit-font-smoothing:\s*auto\s*!important;/);
});

test('reading surface dividers share a quiet hairline style', () => {
  const tailwind = read('src/styles/tailwind.css');

  assert.match(tailwind, /--r-divider:\s*rgba\(0,\s*0,\s*0,\s*0\.05\);/);
  assert.match(tailwind, /body\.reading-surface \.reading-shell__footer\s*\{[\s\S]*margin-top:\s*var\(--r-space-xl\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.reading-shell__footer\s*\{[\s\S]*padding-top:\s*var\(--r-space-md\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.reading-shell__footer\s*\{[\s\S]*border-top-color:\s*var\(--r-divider\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.r-article__tail\s*\{[\s\S]*border-top:\s*0\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.reading-shell__header,[\s\S]*body\.reading-surface \.r-section__head,[\s\S]*body\.reading-surface \.r-year-block__label\s*\{[\s\S]*border-bottom-color:\s*var\(--r-divider\)\s*!important;/);
});

test('archive year labels stay in the meta text scale', () => {
  const tailwind = read('src/styles/tailwind.css');
  const archive = read('src/pages/blog/index.astro');

  assert.match(tailwind, /\.r-year-block__label\s*\{[\s\S]*font-size:\s*var\(--r-text-xs\);/);
  assert.match(tailwind, /body\.reading-surface \.r-year-block__label\s*\{[\s\S]*font-family:\s*var\(--r-font-ui\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.r-year-block__label\s*\{[\s\S]*font-size:\s*var\(--r-text-xs\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.r-year-block__label\s*\{[\s\S]*line-height:\s*1\.35\s*!important;/);
  assert.match(tailwind, /body\.reading-surface h2:not\(\.r-section__title\):not\(\.r-year-block__label\),/);
  assert.doesNotMatch(tailwind, /\.r-year-block__label\s*\{[\s\S]*font-size:\s*0\.9rem;/);
  assert.doesNotMatch(tailwind, /r-year-block__count/);
  assert.doesNotMatch(archive, /r-year-block__count/);
});

test('reading section titles use explicit Tailwind utilities', () => {
  const files = ['src/pages/index.astro', 'src/layouts/About.astro', 'src/pages/copyright.astro'];

  for (const file of files) {
    const source = read(file);
    assert.match(source, /sectionTitleClass/);
    assert.match(source, /!\[font-size:var\(--r-text-sm\)\]/);
    assert.match(source, /!\[font-family:var\(--r-font-ui\)\]/);
    assert.doesNotMatch(source, /!text-\[var\(--r-text-sm\)\]/);
  }
  assert.doesNotMatch(read('src/styles/tailwind.css'), /^  \.r-section__title\s*\{/m);
});

test('reading shell chrome is Tailwind-composed without the old SCSS entry', () => {
  const shell = read('src/layouts/ReadingShell.astro');

  for (const token of ['shellClass', 'headerClass', 'brandClass', 'navClass', 'footerClass']) {
    assert.match(shell, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(shell, /reading\.scss/);
  assert.equal(exists('src/styles/reading.scss'), false);
});

test('reading page titles are explicit Tailwind utilities', () => {
  const tailwind = read('src/styles/tailwind.css');

  assert.doesNotMatch(tailwind, /^\.r-page-title\s*\{/m);
  assert.doesNotMatch(tailwind, /^\.r-home-intro\s*\{/m);
  assert.doesNotMatch(tailwind, /^\.r-home-intro__text\s*\{/m);
  assert.doesNotMatch(tailwind, /^body\.reading-surface \.r-article \.r-page-title\s*\{/m);

  for (const file of [
    'src/pages/index.astro',
    'src/pages/blog/index.astro',
    'src/pages/tags/index.astro',
    'src/pages/tags/[tag].astro',
    'src/pages/works.astro',
    'src/pages/copyright.astro',
    'src/layouts/About.astro',
    'src/layouts/BlogPost.astro',
    'src/layouts/Message.astro',
    'src/layouts/Shuoshuo.astro',
  ]) {
    const source = read(file);
    assert.match(source, /r-page-title|r-home-intro/);
    assert.match(source, /!\[font-size:var\(--r-text-(page|display)\)\]|\[font-size:var\(--r-text-lg\)\]/);
  }
});

test('works listing styles are Tailwind-composed', () => {
  const works = read('src/pages/works.astro');

  for (const token of ['workHeadClass', 'workListClass', 'workCardClass', 'workMetaClass', 'workTitleClass', 'workDescClass']) {
    assert.match(works, new RegExp(`const ${token} =`));
  }
});

test('tag page chrome uses Tailwind utilities without duplicate CSS', () => {
  const tagsIndex = read('src/pages/tags/index.astro');
  const tagPage = read('src/pages/tags/[tag].astro');
  const tailwind = read('src/styles/tailwind.css');

  for (const token of ['tagCloudClass', 'tagLinkClass', 'tagCountClass']) {
    assert.match(tagsIndex, new RegExp(`const ${token} =`));
  }
  for (const token of ['tagMetaClass', 'tagMetaLinkClass']) {
    assert.match(tagPage, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(tagPage, /<style>/);
  for (const selector of ['r-tag-cloud', 'r-tag-cloud__count']) {
    assert.doesNotMatch(tailwind, new RegExp(`\\.${selector}(?![\\w-])`));
  }
});

test('about and sponsor chrome are Tailwind-composed', () => {
  const about = read('src/layouts/About.astro');
  const sponsor = read('src/components/SponsorAbout.astro');
  const tailwind = read('src/styles/tailwind.css');

  for (const token of ['aboutHeadClass', 'aboutIntroClass', 'traitsClass', 'aboutHistoryClass']) {
    assert.match(about, new RegExp(`const ${token} =`));
  }
  for (const token of ['sponsorRootClass', 'foldClass', 'summaryClass', 'cryptoItemClass', 'copyButtonClass']) {
    assert.match(sponsor, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(about, /<style/);
  assert.doesNotMatch(sponsor, /<style/);
  assert.match(about, /r-about__history-summary/);
  assert.match(sponsor, /sponsor-fold__summary/);
  assert.match(tailwind, /body\.reading-surface \.sponsor-fold__summary::before,/);
  assert.match(tailwind, /body\.reading-surface \.r-toc__summary::before\s*\{[\s\S]*content:\s*"▸";[\s\S]*margin-right:\s*0\.35rem;/);
  assert.match(tailwind, /body\.reading-surface \.sponsor-fold\[open\] > \.sponsor-fold__summary::before,/);
  assert.match(tailwind, /body\.reading-surface \.r-toc\[open\] > \.r-toc__summary::before\s*\{[\s\S]*content:\s*"▾";/);
  assert.doesNotMatch(about, /before:content-\[/);
  assert.doesNotMatch(sponsor, /before:content-\[/);
});

test('copyright chrome uses Tailwind utilities without duplicate CSS', () => {
  const copyright = read('src/pages/copyright.astro');
  const tailwind = read('src/styles/tailwind.css');

  for (const token of ['rightsListClass', 'rightsItemClass', 'copyrightNoteClass', 'copyrightNoteLinkClass']) {
    assert.match(copyright, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(copyright, /<style/);
  assert.doesNotMatch(tailwind, /r-copyright__note a/);
});

test('message page chrome is Tailwind-composed', () => {
  const message = read('src/layouts/Message.astro');

  for (const token of ['messageIntroClass', 'messageCommentsClass']) {
    assert.match(message, new RegExp(`const ${token} =`));
  }
  assert.match(message, /\[&_\.twikoo-shell\]:/);
  assert.match(message, /\[&_textarea\]:!bg-transparent/);
  assert.doesNotMatch(message, /<style/);
});

test('blog post header and toc chrome are Tailwind-composed', () => {
  const blogPost = read('src/layouts/BlogPost.astro');
  const tailwind = read('src/styles/tailwind.css');

  for (const token of ['articleClass', 'articleHeaderClass', 'metaClass', 'metaLinkClass', 'tocClass', 'tocSummaryClass', 'articleTailClass']) {
    assert.match(blogPost, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(blogPost, /<style/);
  assert.match(blogPost, /r-toc__summary/);
  assert.match(blogPost, /const tocClass = \[/);
  assert.match(blogPost, /r-toc group mt-\[0\.2rem\] mb-\[var\(--r-space-md\)\]/);
  assert.match(blogPost, /\[&_\.toc-container\]:mt-\[0\.5rem\]/);
  assert.match(blogPost, /\[&_\.toc-container\]:pl-\[1\.05rem\]/);
  assert.match(blogPost, /const tocSummaryClass = 'r-toc__summary inline-flex cursor-pointer list-none items-center border-l border-l-\[var\(--r-rule\)\] bg-\[color-mix\(in_oklab,var\(--r-rule-soft\)_34%,transparent\)\]/);
  assert.match(tailwind, /body\.reading-surface \.r-toc \.toc-link\s*\{[\s\S]*font-size:\s*var\(--r-text-xs\)\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.r-toc \.toc-link\s*\{[\s\S]*font-weight:\s*400\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.r-toc \.toc-container\s*\{[\s\S]*padding-left:\s*1\.05rem\s*!important;/);
  assert.match(tailwind, /body\.reading-surface \.r-toc \.toc-link:hover,[\s\S]*body\.reading-surface \.r-toc \.toc-link\.active\s*\{[\s\S]*font-weight:\s*400\s*!important;/);
  assert.match(blogPost, /\[&_\.link-card__image-wrapper\]:flex-\[0_0_140px\]/);
  assert.match(blogPost, /\[&_\.link-card__image-wrapper_img\]:object-cover/);
  assert.match(blogPost, /max-\[640px\]:\[&_\.link-card__content\]:flex-col/);
  assert.doesNotMatch(blogPost, /before:content-\[/);
  assert.doesNotMatch(tailwind, /^\.r-meta\s*\{/m);
  assert.doesNotMatch(tailwind, /r-meta a/);
});

test('shuoshuo stream chrome lives in the Tailwind component layer', () => {
  const shuoshuo = read('src/layouts/Shuoshuo.astro');
  const tailwind = read('src/styles/tailwind.css');

  assert.doesNotMatch(shuoshuo, /<style/);
  for (const selector of ['r-memos__list', 'r-memo', 'r-memo__body', 'media-grid', 'r-memos__pagination']) {
    assert.match(tailwind, new RegExp(`\\.${selector}(?![\\w-])`));
  }
});

test('reading interaction components are Tailwind-composed', () => {
  const likeButton = read('src/components/LikeButton.astro');
  const changelog = read('src/components/Changelog.astro');

  for (const token of ['baseClass', 'typeClass', 'iconClass']) {
    assert.match(likeButton, new RegExp(`const ${token} =`));
  }
  for (const token of ['changelogClass', 'summaryClass', 'labelClass', 'listClass']) {
    assert.match(changelog, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(likeButton, /<style/);
  assert.doesNotMatch(changelog, /<style/);
});
