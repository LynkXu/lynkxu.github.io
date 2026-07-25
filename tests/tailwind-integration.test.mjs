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
