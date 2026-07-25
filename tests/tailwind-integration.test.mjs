import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

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
  const reading = read('src/styles/reading.scss');
  const blogIndex = read('src/pages/blog/index.astro');
  const tagPage = read('src/pages/tags/[tag].astro');

  assert.match(tailwind, /@layer components\s*\{/);
  for (const selector of ['r-section', 'r-post-list', 'r-note-list', 'r-year-block', 'r-draft']) {
    assert.match(tailwind, new RegExp(`\\.${selector}(?![\\w-])`));
    assert.doesNotMatch(reading, new RegExp(`^\\.${selector}(?![\\w-])`, 'm'));
  }
  assert.doesNotMatch(blogIndex, /\.r-draft\s*\{/);
  assert.doesNotMatch(tagPage, /\.r-draft\s*\{/);
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
  assert.doesNotMatch(read('src/styles/reading.scss'), /^body\.reading-surface \.r-section__title\s*\{/m);
});

test('reading shell chrome is not duplicated in SCSS', () => {
  const shell = read('src/layouts/ReadingShell.astro');
  const reading = read('src/styles/reading.scss');

  for (const token of ['shellClass', 'headerClass', 'brandClass', 'navClass', 'footerClass']) {
    assert.match(shell, new RegExp(`const ${token} =`));
  }
  for (const selector of [
    '.reading-shell',
    '.reading-shell__header',
    '.reading-shell__brand',
    '.reading-shell__nav',
    '.reading-shell__ctrl',
    '.reading-shell__tools',
    '.reading-shell__main',
    '.reading-shell__footer',
    '.reading-shell__footer-links',
    '.reading-shell__copy',
  ]) {
    assert.doesNotMatch(reading, new RegExp(`^${selector.replace('.', '\\.')}\\s*\\{`, 'm'));
  }
});

test('reading page titles are explicit Tailwind utilities', () => {
  const reading = read('src/styles/reading.scss');

  assert.doesNotMatch(reading, /^\.r-page-title\s*\{/m);
  assert.doesNotMatch(reading, /^\.r-home-intro\s*\{/m);
  assert.doesNotMatch(reading, /^\.r-home-intro__text\s*\{/m);
  assert.doesNotMatch(reading, /^body\.reading-surface \.r-article \.r-page-title\s*\{/m);

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

test('works listing styles are migrated out of reading SCSS', () => {
  const works = read('src/pages/works.astro');
  const reading = read('src/styles/reading.scss');

  for (const token of ['workHeadClass', 'workListClass', 'workCardClass', 'workMetaClass', 'workTitleClass', 'workDescClass']) {
    assert.match(works, new RegExp(`const ${token} =`));
  }
  for (const selector of ['r-works__head', 'r-works__empty', 'r-work-list', 'r-work', 'r-work__meta', 'r-work__title', 'r-work__desc']) {
    assert.doesNotMatch(reading, new RegExp(`\\.${selector}(?![\\w-])`));
  }
});

test('tag page chrome uses Tailwind utilities without duplicate CSS', () => {
  const tagsIndex = read('src/pages/tags/index.astro');
  const tagPage = read('src/pages/tags/[tag].astro');
  const reading = read('src/styles/reading.scss');

  for (const token of ['tagCloudClass', 'tagLinkClass', 'tagCountClass']) {
    assert.match(tagsIndex, new RegExp(`const ${token} =`));
  }
  for (const token of ['tagMetaClass', 'tagMetaLinkClass']) {
    assert.match(tagPage, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(tagPage, /<style>/);
  for (const selector of ['r-tag-cloud', 'r-tag-cloud__count']) {
    assert.doesNotMatch(reading, new RegExp(`\\.${selector}(?![\\w-])`));
  }
});

test('about and sponsor chrome are Tailwind-composed', () => {
  const about = read('src/layouts/About.astro');
  const sponsor = read('src/components/SponsorAbout.astro');

  for (const token of ['aboutHeadClass', 'aboutIntroClass', 'traitsClass', 'aboutHistoryClass']) {
    assert.match(about, new RegExp(`const ${token} =`));
  }
  for (const token of ['sponsorRootClass', 'foldClass', 'summaryClass', 'cryptoItemClass', 'copyButtonClass']) {
    assert.match(sponsor, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(about, /<style/);
  assert.doesNotMatch(sponsor, /<style/);
});

test('copyright chrome uses Tailwind utilities without duplicate CSS', () => {
  const copyright = read('src/pages/copyright.astro');
  const reading = read('src/styles/reading.scss');

  for (const token of ['rightsListClass', 'rightsItemClass', 'copyrightNoteClass', 'copyrightNoteLinkClass']) {
    assert.match(copyright, new RegExp(`const ${token} =`));
  }
  assert.doesNotMatch(copyright, /<style/);
  assert.doesNotMatch(reading, /r-copyright__note a/);
});
