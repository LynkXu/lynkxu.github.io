import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url);
const srcRoot = new URL('../src/', import.meta.url);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(item) : [item];
  });
}

test('every Astro component is imported by reachable source', () => {
  const sourceFiles = walk(srcRoot.pathname).filter((file) => /\.(astro|mdx?|[cm]?[jt]s)$/.test(file));
  const source = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
  const components = sourceFiles.filter((file) => file.includes(`${path.sep}components${path.sep}`) && file.endsWith('.astro'));
  const orphaned = components
    .filter((file) => !new RegExp(`from\\s+['\"][^'\"]*${path.basename(file).replace('.', '\\.')}['\"]`).test(source))
    .map((file) => path.relative(root.pathname, file));
  assert.deepEqual(orphaned, []);
});

test('retired modules and maintenance artifacts stay removed', () => {
  const retired = [
    'src/plugins/remark-link-card.js',
    'scripts/compress-images.mjs',
    'src/styles/ZhuqueFangsong-v0_min.woff',
    '.npm-cache',
  ];
  assert.deepEqual(retired.filter((item) => existsSync(new URL(`../${item}`, import.meta.url))), []);
});
