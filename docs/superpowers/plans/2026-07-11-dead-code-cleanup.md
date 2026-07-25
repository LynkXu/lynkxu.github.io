# Dead Code Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every repository artifact that is provably unreachable while preserving generated-content hooks, deployed features, historical documentation, and editor configuration.

**Architecture:** Treat Astro routes/content and known runtime-generated selectors as roots, then remove only modules, symbols, styles, dependencies, assets, and cache files with no reachable consumer. Add a reachability regression test so future orphan components fail CI instead of accumulating silently.

**Tech Stack:** Astro 5, Node.js test runner, TypeScript, Sass, npm.

## Global Constraints

- Node.js remains compatible with `>= 20`; CI continues to use Node 20.
- Preserve all current routes, content, syncing workflows, LightGallery/Twikoo/Leaflet runtime hooks, link-card behavior, and visual output.
- Preserve `docs/**`, `.obsidian/**`, `.claude/**`, and `.codebuddy/**`.
- Remove tracked `.npm-cache/**` and add `.npm-cache/` to `.gitignore`.
- Keep Astro-generated classes `.astro-code`, `.footnotes`, `.footnote-ref`, `.contains-task-list`, `.toc-level-2`, `.toc-level-3`, and `.toc-level-4`.
- Verify production with `npx --no-install astro build`; do not use `npm run build`, which performs network syncs and rewrites data.

---

### Task 1: Enforce component reachability and remove orphan modules

**Files:**
- Create: `tests/dead-code.test.mjs`
- Delete: `src/components/LeftSidebar.astro`
- Delete: `src/components/Loading.astro`
- Delete: `src/components/Sponsor.astro`
- Delete: `src/components/TaxonomyHero.astro`
- Delete: `src/components/LinkCard.astro`
- Delete: `src/plugins/remark-link-card.js`
- Delete: `scripts/compress-images.mjs`
- Delete: `src/styles/ZhuqueFangsong-v0_min.woff`
- Delete: `.npm-cache/**`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Astro/MDX static imports under `src/**`.
- Produces: a test that reports every `.astro` component without an import edge.

- [ ] **Step 1: Write the failing reachability test**

```js
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
  const sourceFiles = walk(srcRoot).filter((file) => /\.(astro|mdx?|[cm]?[jt]s)$/.test(file));
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
```

- [ ] **Step 2: Run the new test and verify RED**

Run: `node --test tests/dead-code.test.mjs`

Expected: FAIL listing `LeftSidebar.astro`, `Loading.astro`, `Sponsor.astro`, `TaxonomyHero.astro`, and `LinkCard.astro`, plus the retired plugin/script/font/cache paths.

- [ ] **Step 3: Delete the exact unreachable files and ignore the local npm cache**

```gitignore
# local npm cache
.npm-cache/
```

Delete the files listed in this task. Do not delete `sponsorConfig.ts`, `SponsorAbout.astro`, `.link-card` styles, the BlogPost link-card runtime, or any `public/lightgallery/**` file.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/dead-code.test.mjs`

Expected: PASS, 2 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add .gitignore tests/dead-code.test.mjs src/components src/plugins scripts src/styles .npm-cache
git commit -m "refactor: remove unreachable modules and cache artifacts"
```

### Task 2: Remove unused symbols and redundant dependency metadata

**Files:**
- Modify: `tests/dead-code.test.mjs`
- Modify: `src/utils/drafts.ts`
- Modify: `src/content/page/sports.mdx`
- Modify: `src/layouts/Shuoshuo.astro`
- Modify: `src/components/Comments.astro`
- Modify: `src/components/sponsorConfig.ts`
- Modify: `src/components/SportsBarChart.astro`
- Modify: `src/components/SportsLineChart.astro`
- Modify: `src/layouts/BlogPost.astro`
- Modify: `scripts/generate-poster.mjs`
- Modify: `scripts/strava-sync.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: current public outputs from the data-sync scripts and Astro components.
- Produces: the same JSON/SVG/site behavior without unused calculations, exports, parameters, or type stubs.

- [ ] **Step 1: Add a failing source contract test**

```js
test('known unused symbols and redundant type stubs stay removed', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const source = [
    'src/utils/drafts.ts',
    'src/layouts/Shuoshuo.astro',
    'scripts/generate-poster.mjs',
    'scripts/strava-sync.mjs',
  ].map((file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')).join('\n');
  assert.equal(packageJson.devDependencies?.['@types/marked'], undefined);
  for (const symbol of ['isDraft', 'formatMemoDate', 'latestMemo', 'earliestMemo', 'rideCalories', 'farthestValue', 'formatTimeMinTextFromSec', 'parseBaselineTimeToSec', 'formatPaceSecPerKm']) {
    assert.doesNotMatch(source, new RegExp(`\\b${symbol}\\b`));
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/dead-code.test.mjs`

Expected: FAIL because `@types/marked` and the named symbols are still present.

- [ ] **Step 3: Remove the unused code without changing output schemas**

```ts
type SponsorItem = {
	id: string;
	name: string;
	image: string;
	color: string;
	desc?: string;
	address?: string;
};

type SponsorGroup = {
	name: 'CNY' | 'Crypto';
	items: SponsorItem[];
};

export const SPONSOR_GROUPS: SponsorGroup[] = [
	// Keep the current CNY and Crypto group objects byte-for-byte unchanged.
];
```

Keep the current `SPONSOR_GROUPS` data literal unchanged and apply these exact removals:

- Delete `isDraft` from `drafts.ts`.
- Delete the unused `currentYear` export from `sports.mdx`.
- Delete `formatMemoDate`, `latestMemo`, `earliestMemo`, `latestMemoLabel`, and `earliestMemoLabel` from `Shuoshuo.astro`.
- Remove the unused `index` callback parameter in `Comments.astro`.
- Delete `ALL_SPONSOR_ITEMS`; keep `SPONSOR_GROUPS` exported and make `SponsorItem`/`SponsorGroup` internal unless still imported.
- Make `BarChartDataPoint` and `LineChartDataPoint` internal interfaces.
- Stop destructuring/caching Microlink `logo` in `BlogPost.astro`.
- Delete unused `totalKm`, `stats`, `year`, and `padding` bindings from `generate-poster.mjs` while preserving generated SVG text.
- Delete the unused ride-calorie/farthest/5K/10K calculation chain and its now-unreachable helpers from `strava-sync.mjs`; do not change returned/persisted keys.
- Remove `@types/marked` with `npm uninstall --save-dev @types/marked`.

- [ ] **Step 4: Verify tests, TypeScript, and generated-script syntax**

Run: `node --test tests/*.test.mjs && ./node_modules/.bin/tsc --noEmit --pretty false && node --check scripts/generate-poster.mjs && node --check scripts/strava-sync.mjs`

Expected: all tests pass, TypeScript exits 0, both syntax checks exit 0.

- [ ] **Step 5: Commit**

```bash
git add tests/dead-code.test.mjs src scripts package.json package-lock.json
git commit -m "refactor: remove unused symbols and type stubs"
```

### Task 3: Delete unreachable CSS without touching generated selectors

**Files:**
- Modify: `tests/dead-code.test.mjs`
- Modify: `src/styles/style.scss`
- Modify: `src/layouts/About.astro`
- Modify: `src/layouts/Sports.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/photography.astro`
- Modify: `src/pages/tools.astro`
- Modify: `src/layouts/MagazineShell.astro`
- Modify: `src/layouts/BlogPost.astro`
- Modify: `src/pages/tags/index.astro`

**Interfaces:**
- Consumes: class names emitted by current Astro templates and known Markdown/third-party generators.
- Produces: smaller compiled CSS with identical rendered pages.

- [ ] **Step 1: Add a failing retired-selector test**

```js
test('retired global selector families stay removed', () => {
  const style = readFileSync(new URL('../src/styles/style.scss', import.meta.url), 'utf8');
  const retired = [
    'about-index', 'about-sheet', 'about-panel', 'about-blog', 'about-changelog',
    'list-surface', 'page-rail', 'list-stack', 'archive-stack', 'year-posts',
    'paper-ledger', 'feed-item', 'stream-card', 'blog-layout', 'article-page-shell',
    'post-kicker', 'post-meta__category', 'taxonomy-shell', 'categories-grid',
    'categories-item', 'header-wrapper-card', 'toc-empty',
  ];
  for (const selector of retired) assert.doesNotMatch(style, new RegExp(`\\.${selector}(?![\\w-])`));
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/dead-code.test.mjs`

Expected: FAIL on the first retired selector still present in `style.scss`.

- [ ] **Step 3: Remove the exact unreachable selector families and variables**

```text
Global selector families to delete:
.about-index .about-sheet .about-panels .about-panel* .about-chip* .about-colophon*
.about-blog* .about-changelog* and the obsolete global .changelog-* block
.list-surface* .page-rail* .list-stack .archive-stack .list-ledger .list-main*
.list-intro .year-posts .year-rail .year-title .paper-ledger .feed-item .stream-card*
.blog-layout .article-page-shell .post-kicker* .post-meta__category .post-meta__separator .post-meta__tag
.taxonomy-shell .categories-grid .categories-item .header-wrapper-card .toc-empty

Component-local selectors to delete:
About.astro .about-support-card
Sports.astro .page-title
blog/index.astro .archive-board__intro
photography.astro obsolete page header rules
tools.astro .page-title and .subtitle

Unused custom properties to delete:
--text-body --color-success --card-shadow --card-border --paper-surface
--paper-panel-rule --radius --blog-section-label-color --post-rail-width --topic-index
```

The generated Markdown and third-party selector families named in Global Constraints remain byte-for-byte unchanged.

- [ ] **Step 4: Verify Sass, tests, and a production build**

Run: `node --test tests/*.test.mjs && ./node_modules/.bin/sass --no-source-map src/styles/style.scss >/dev/null && npx --no-install astro build`

Expected: all tests pass, Sass exits 0, Astro generates all routes without warnings or errors.

- [ ] **Step 5: Commit**

```bash
git add tests/dead-code.test.mjs src
git commit -m "refactor: remove unreachable style rules"
```
