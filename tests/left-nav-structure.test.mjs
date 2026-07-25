import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('../src/layouts/MagazineShell.astro', import.meta.url),
  'utf8',
);
const styleSource = source.slice(source.indexOf('<style is:global>'));

function extractBlock(text, selector) {
  const selectorStart = text.indexOf(selector);
  if (selectorStart === -1) return '';

  const blockStart = text.indexOf('{', selectorStart);
  let depth = 0;

  for (let index = blockStart; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    if (text[index] === '}') depth -= 1;
    if (depth === 0) return text.slice(blockStart + 1, index);
  }

  return '';
}

test('primary navigation lists five labels without editorial index numbers', () => {
  const expectedItems = [
    ["'/'", "'首页'"],
    ["'/blog'", "'归档'"],
    ["'/shuoshuo'", "'碎语'"],
    ["'/message'", "'留言'"],
    ["'/about'", "'关于'"],
  ];

  for (const [href, label] of expectedItems) {
    assert.match(
      source,
      new RegExp(`\\{ href: ${href}, label: ${label} \\}`),
    );
  }

  assert.doesNotMatch(source, /ledger-nav__index/);
  assert.doesNotMatch(source, /index: '0[1-5]'/);
  assert.match(source, /class="ledger-nav__text"/);
});

test('topics stay collapsed by default and search is removed from the left rail', () => {
  assert.match(source, /<details class="ledger-collections">/);
  assert.doesNotMatch(source, /<details class="ledger-collections"[^>]*\sopen/);
  assert.doesNotMatch(source, /class="ledger-search"/);
  assert.doesNotMatch(source, /\.ledger-sidebar__bottom\s*\{/);
});

test('meta footer keeps social and subscribe as a two-column ledger table', () => {
  const metaRule = extractBlock(styleSource, '.ledger-meta {');
  const socialRule = extractBlock(styleSource, '.ledger-social {');

  assert.match(metaRule, /--meta-label-col/);
  assert.match(socialRule, /display:\s*grid/);
  assert.match(source, /ledger-meta__label/);
  assert.match(source, /ledger-meta__value/);
});

test('current and hover states do not move layout or use a detached dot', () => {
  assert.doesNotMatch(source, /\.ledger-nav__link\.active::after/);
  assert.doesNotMatch(source, /transition:[^;]*padding-left/);
  assert.doesNotMatch(source, /\.ledger-nav__link:hover\s*\{[^}]*padding-left/s);
  assert.match(source, /\.ledger-nav__marker/);
});

test('responsive navigation keeps its marker and 44px touch targets', () => {
  const tabletRules = extractBlock(styleSource, '@media (max-width: 1100px)');
  const mobileRules = extractBlock(styleSource, '@media (max-width: 640px)');
  const primaryRule = extractBlock(mobileRules, '.ledger-nav--primary .ledger-nav__link {');
  const secondaryRule = extractBlock(mobileRules, '.ledger-nav--secondary .ledger-nav__link {');
  const brandRule = extractBlock(mobileRules, '.ledger-brand {');
  const socialRule = extractBlock(mobileRules, '.ledger-social a {');

  assert.doesNotMatch(tabletRules, /ledger-nav__marker[\s\S]{0,100}display:\s*none/);
  assert.match(primaryRule, /min-height:\s*2\.75rem/);
  assert.match(secondaryRule, /min-height:\s*2\.75rem/);
  assert.match(secondaryRule, /min-width:\s*2\.75rem/);
  assert.match(brandRule, /min-height:\s*2\.75rem/);
  assert.match(socialRule, /min-height:\s*2\.75rem/);
  assert.match(socialRule, /min-width:\s*2\.75rem/);
});

test('left-nav changes preserve the main and context layout contract', () => {
  const shellRule = extractBlock(styleSource, '.ledger-shell {');
  const layoutStyles = styleSource.slice(styleSource.indexOf('\n\t.ledger-main {'));
  const mainRule = extractBlock(layoutStyles, '.ledger-main {');
  const contextRule = extractBlock(layoutStyles, '.ledger-context {');

  assert.match(
    shellRule,
    /grid-template-columns:\s*var\(--blog-sidebar-width\)\s*minmax\(0, var\(--blog-content-max\)\)\s*var\(--blog-context-width\)/,
  );
  assert.match(shellRule, /width:\s*min\(var\(--blog-shell-width\)/);
  assert.match(mainRule, /min-width:\s*0/);
  assert.match(contextRule, /position:\s*sticky/);
  assert.match(contextRule, /padding-left:\s*clamp\(0\.75rem, 1\.6vw, 1\.1rem\)/);
});

test('RSS is announced with the social and subscription links', () => {
  assert.match(source, /<nav class="ledger-social" aria-label="社交与订阅链接">/);
});
