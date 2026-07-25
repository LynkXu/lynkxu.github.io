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
    assert.match(source, /!text-\[var\(--r-text-sm\)\]/);
    assert.match(source, /!\[font-family:var\(--r-font-ui\)\]/);
  }
  assert.doesNotMatch(read('src/styles/tailwind.css'), /^  \.r-section__title\s*\{/m);
  assert.doesNotMatch(read('src/styles/reading.scss'), /^body\.reading-surface \.r-section__title\s*\{/m);
});
