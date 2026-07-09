import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('../src/layouts/MagazineShell.astro', import.meta.url),
  'utf8',
);

test('primary navigation exposes a five-item editorial index', () => {
  const expectedItems = [
    ["'/'", "'首页'", "'01'"],
    ["'/blog'", "'归档'", "'02'"],
    ["'/shuoshuo'", "'碎语'", "'03'"],
    ["'/message'", "'留言'", "'04'"],
    ["'/about'", "'关于'", "'05'"],
  ];

  for (const [href, label, index] of expectedItems) {
    assert.match(
      source,
      new RegExp(`\\{ href: ${href}, label: ${label}, index: ${index} \\}`),
    );
  }

  assert.match(source, /class="ledger-nav__index"/);
  assert.match(source, /class="ledger-nav__text"/);
});

test('active topic destinations keep their disclosure open', () => {
  assert.match(source, /const secondaryActiveItem = secondaryNavItems\.find/);
  assert.match(
    source,
    /<details[\s\S]*class="ledger-collections"[\s\S]*open=\{Boolean\(secondaryActiveItem\)\}/,
  );
});

test('search follows primary navigation instead of being pinned to the viewport bottom', () => {
  const searchPosition = source.indexOf('class="ledger-search"');
  const topicsPosition = source.indexOf('<details class="ledger-collections"');

  assert.notEqual(searchPosition, -1);
  assert.notEqual(topicsPosition, -1);
  assert.ok(searchPosition < topicsPosition);
  assert.doesNotMatch(source, /\.ledger-sidebar__bottom\s*\{/);
});

test('current and hover states do not move layout or use a detached dot', () => {
  assert.doesNotMatch(source, /\.ledger-nav__link\.active::after/);
  assert.doesNotMatch(source, /transition:[^;]*padding-left/);
  assert.doesNotMatch(source, /\.ledger-nav__link:hover\s*\{[^}]*padding-left/s);
  assert.match(source, /\.ledger-nav__marker/);
});

test('narrow-screen primary links preserve a 44px touch target', () => {
  assert.match(
    source,
    /@media \(max-width: 640px\)[\s\S]*\.ledger-nav--primary \.ledger-nav__link\s*\{[\s\S]*min-height:\s*2\.75rem/,
  );
});
