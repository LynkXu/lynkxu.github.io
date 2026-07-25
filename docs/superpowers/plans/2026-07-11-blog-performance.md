# Blog Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce cold-load bytes, redirect chains, third-party contention, background CPU work, and unnecessary gallery/API requests while preserving site behavior.

**Architecture:** Centralize responsive avatar URLs for a later CDN swap, use trailing-slash URL helpers for GitHub Pages, defer non-critical work until idle/visibility, and load gallery/full-size imagery only when it is needed. Protect the changes with source contracts, pure URL unit tests, production builds, and repeatable browser measurements.

**Tech Stack:** Astro 5, Node.js test runner, Sharp, Pillow, Sass, Playwright/Chromium for local verification.

## Global Constraints

- Generate exact 112×112 and 224×224 WebP avatar files, each below 20 KB.
- Keep avatar configuration in one exported `AVATAR_IMAGE` object so cloud replacement changes only `src/consts.ts`.
- Preserve fixed intrinsic image dimensions and current 36px, 40px, and 56px rendered sizes to prevent CLS.
- Preserve Google Analytics measurement ID `G-LS37X5G84N`, but do not let it contend with critical resources before `load`/idle.
- Keep Matter as the primary UI font; remove only the unconditional Lilex preload.
- Internal page and article links must end in `/`; asset, feed, hash, query-only, and external URLs remain unchanged.
- Preserve likes, LightGallery, theme, search, and photography behavior.
- Verify with `npx --no-install astro build`; do not run the data-syncing `npm run build`.

---

### Task 1: Generate responsive avatars and a compact favicon

**Files:**
- Create: `tests/performance-contract.test.mjs`
- Create: `public/avatar-112.webp`
- Create: `public/avatar-224.webp`
- Create: `public/favicon-64.png`
- Modify: `src/consts.ts`
- Modify: `src/layouts/MagazineShell.astro`
- Modify: `src/layouts/Shuoshuo.astro`
- Modify: `src/components/BaseHead.astro`
- Modify: `docs/design-mockups/generate-designs.mjs`
- Delete: `public/ava2.png`
- Delete: `public/ava3.png`
- Delete: `public/ava4.png`
- Delete: `public/avatar.png`
- Delete: `public/favicon.ico`

**Interfaces:**
- Consumes: the current `public/ava4.png` and `public/favicon.ico` as generation sources.
- Produces: `AVATAR_IMAGE = { src, srcset }` plus responsive local files that can later be replaced by cloud URLs.

- [ ] **Step 1: Write the failing asset/config contract**

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import sharp from 'sharp';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('avatar configuration uses responsive 112px and 224px WebP sources', async () => {
  const config = read('src/consts.ts');
  const shell = read('src/layouts/MagazineShell.astro');
  const memos = read('src/layouts/Shuoshuo.astro');
  assert.match(config, /export const AVATAR_IMAGE/);
  assert.match(config, /avatar-112\.webp/);
  assert.match(config, /avatar-224\.webp/);
  for (const [file, width] of [['public/avatar-112.webp', 112], ['public/avatar-224.webp', 224]]) {
    const url = new URL(`../${file}`, import.meta.url);
    assert.equal((await sharp(fileURLToPath(url)).metadata()).width, width);
    assert.ok(statSync(url).size < 20 * 1024);
  }
  assert.doesNotMatch(shell + memos, /ava4\.png/);
  assert.match(shell + memos, /AVATAR_IMAGE\.srcset/);
});

test('favicon is a compact 64px PNG', async () => {
  const file = new URL('../public/favicon-64.png', import.meta.url);
  assert.equal((await sharp(fileURLToPath(file)).metadata()).width, 64);
  assert.ok(statSync(file).size < 20 * 1024);
  assert.doesNotMatch(read('src/components/BaseHead.astro'), /favicon\.ico/);
});
```

- [ ] **Step 2: Run the new tests and verify RED**

Run: `node --test tests/performance-contract.test.mjs`

Expected: FAIL because `AVATAR_IMAGE` and the optimized files do not exist.

- [ ] **Step 3: Generate the exact assets**

```js
const sharp = require('sharp');
await sharp('public/ava4.png').resize(112, 112).webp({ quality: 82, effort: 6 }).toFile('public/avatar-112.webp');
await sharp('public/ava4.png').resize(224, 224).webp({ quality: 82, effort: 6 }).toFile('public/avatar-224.webp');
```

Use Pillow to extract and resize the icon with this exact command:

```bash
PYTHONPATH=/Users/link/.cache/codex-runtimes/codex-primary-runtime/dependencies/python \
  /Users/link/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 - <<'PY'
from PIL import Image

with Image.open('public/favicon.ico') as source:
    icon = source.convert('RGBA').resize((64, 64), Image.Resampling.LANCZOS)
    icon.save('public/favicon-64.png', optimize=True)
PY
```

Then delete `public/ava2.png`, `public/ava3.png`, `public/ava4.png`, `public/avatar.png`, and `public/favicon.ico` after generation.

- [ ] **Step 4: Centralize and consume the avatar configuration**

```ts
export const AVATAR_IMAGE = {
  src: '/avatar-112.webp',
  srcset: '/avatar-112.webp 112w, /avatar-224.webp 224w',
} as const;
```

Every avatar `<img>` uses `src={AVATAR_IMAGE.src}`, `srcset={AVATAR_IMAGE.srcset}`, and its exact `sizes` value (`36px`, `40px`, or `56px`). `BaseHead.astro` links `/favicon-64.png` with `type="image/png"` and `sizes="64x64"`. Update the historical mockup generator to read `public/avatar-224.webp` so preserved documentation tooling remains runnable.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `node --test tests/performance-contract.test.mjs`

Expected: PASS, 2 tests, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add tests/performance-contract.test.mjs public src/consts.ts src/layouts/MagazineShell.astro src/layouts/Shuoshuo.astro src/components/BaseHead.astro docs/design-mockups/generate-designs.mjs
git commit -m "perf: serve responsive avatar and favicon assets"
```

### Task 2: Remove redirect chains and defer analytics/font work

**Files:**
- Modify: `tests/performance-contract.test.mjs`
- Create: `src/utils/urls.mjs`
- Modify: `src/layouts/MagazineShell.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/HeaderLink.astro`
- Modify: `src/components/SimpleHeader.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/tags/index.astro`
- Modify: `src/pages/tags/[tag].astro`
- Modify: `src/components/SearchModal.astro`
- Modify: `src/components/BaseHead.astro`

**Interfaces:**
- Produces: `withTrailingSlash(path)`, `postHref(slug)`, and `tagHref(tag)`.
- Consumers: navigation, homepage/archive/tag/search-generated internal URLs.

- [ ] **Step 1: Add failing URL and critical-head tests**

```js
import { postHref, tagHref, withTrailingSlash } from '../src/utils/urls.mjs';

test('internal route helpers emit GitHub Pages canonical trailing slashes', () => {
  assert.equal(withTrailingSlash('/blog'), '/blog/');
  assert.equal(withTrailingSlash('/blog/?page=2#latest'), '/blog/?page=2#latest');
  assert.equal(postHref('hello-world'), '/blog/hello-world.html/');
  assert.equal(tagHref('AI 工具'), '/tags/AI%20%E5%B7%A5%E5%85%B7/');
});

test('critical head does not preload Lilex or eagerly request analytics', () => {
  const head = read('src/components/BaseHead.astro');
  assert.doesNotMatch(head, /rel=['\"]preload['\"][^>]*Lilex/);
  assert.doesNotMatch(head, /<script[^>]+src=['\"]https:\/\/www\.googletagmanager\.com/);
  assert.match(head, /requestIdleCallback/);
  assert.match(head, /createElement\(['\"]script['\"]\)/);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/performance-contract.test.mjs`

Expected: FAIL because the URL module is missing and BaseHead still preloads/requests critical resources eagerly.

- [ ] **Step 3: Implement the URL helpers and replace internal page links**

```js
export function withTrailingSlash(path) {
  const match = path.match(/^([^?#]*)([?#].*)?$/);
  const pathname = match?.[1] || '/';
  const suffix = match?.[2] || '';
  return `${pathname === '/' || pathname.endsWith('/') ? pathname : `${pathname}/`}${suffix}`;
}

export const postHref = (slug) => withTrailingSlash(`/blog/${slug}.html`);
export const tagHref = (tag) => withTrailingSlash(`/tags/${encodeURIComponent(tag)}`);
```

Use `withTrailingSlash`, `postHref`, or `tagHref` for dynamic values. Change static route literals to `/blog/`, `/shuoshuo/`, `/message/`, `/about/`, `/photography/`, `/media/`, `/travel/`, `/sports/`, and `/tools/`. Leave `/`, `/index.xml`, assets, hash links, query-only pagination links, and external links unchanged. Normalize `HeaderLink` comparisons with:

```ts
const normalizePath = (value: string) => value === '/' ? '/' : value.replace(/\/+$/, '');
const current = normalizePath(pathname);
const target = normalizePath(String(href || '/'));
const isActive = target === current || (target !== '/' && current.startsWith(`${target}/`));
```

- [ ] **Step 4: Defer Google Analytics and remove the global Lilex preload**

```js
function loadAnalytics() {
  if (document.querySelector('script[data-google-analytics]')) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-LS37X5G84N');
  const script = document.createElement('script');
  script.async = true;
  script.dataset.googleAnalytics = 'true';
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-LS37X5G84N';
  document.head.append(script);
}

function scheduleAnalytics() {
  if ('requestIdleCallback' in window) window.requestIdleCallback(loadAnalytics, { timeout: 3000 });
  else window.setTimeout(loadAnalytics, 1500);
}
```

Schedule this after `window.load`; remove the early GTM dns-prefetch/preconnect and Lilex preload. Keep `font-display: swap` declarations unchanged.

- [ ] **Step 5: Verify tests and build-link output**

Run: `node --test tests/*.test.mjs && npx --no-install astro build`

Expected: tests/build pass. Then scan built HTML and confirm no page-navigation URL lacks a trailing slash.

- [ ] **Step 6: Commit**

```bash
git add tests/performance-contract.test.mjs src
git commit -m "perf: remove navigation redirects and defer analytics"
```

### Task 3: Eliminate idle runtime and non-visible API/gallery work

**Files:**
- Modify: `tests/performance-contract.test.mjs`
- Modify: `src/components/Background.astro`
- Modify: `src/components/LikeButton.astro`
- Modify: `src/layouts/Shuoshuo.astro`
- Modify: `src/layouts/BlogPost.astro`

**Interfaces:**
- Produces: a visibility-aware canvas loop, viewport-triggered like loading, and on-demand LightGallery loading.
- Consumers: all Base pages, article likes, memo pagination, and article image galleries.

- [ ] **Step 1: Add failing runtime contract tests**

```js
test('background animation pauses when hidden or dark', () => {
  const source = read('src/components/Background.astro');
  assert.match(source, /visibilitychange/);
  assert.match(source, /MutationObserver/);
  assert.match(source, /cancelAnimationFrame/);
  assert.doesNotMatch(source, /readToken\([^)]*\)[\s\S]{0,300}circles\.forEach/);
});

test('likes initialize only when their buttons become visible', () => {
  const likes = read('src/components/LikeButton.astro');
  const memos = read('src/layouts/Shuoshuo.astro');
  assert.match(likes, /IntersectionObserver/);
  assert.match(likes, /data-like-initialized/);
  assert.match(memos, /likes:refresh/);
});

test('blog posts load LightGallery only when images exist', () => {
  const post = read('src/layouts/BlogPost.astro');
  assert.doesNotMatch(post, /<script[^>]+src=['\"]\/lightgallery\/js\/lightgallery\.min\.js/);
  assert.match(post, /images\.length === 0/);
  assert.match(post, /loadLightGallery/);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test tests/performance-contract.test.mjs`

Expected: FAIL because the current canvas runs continuously, likes fetch all buttons, and BlogPost always includes LightGallery.

- [ ] **Step 3: Make the background loop visibility/theme-aware**

Cache `--background-ornament` outside the frame loop and add these control functions around the existing drawing math:

```js
let running = false;
let stroke = readToken('--background-ornament', 'rgba(0, 0, 0, 0.05)');

function startAnimation() {
  if (running || document.visibilityState !== 'visible' || isDarkTheme()) return;
  stroke = readToken('--background-ornament', 'rgba(0, 0, 0, 0.05)');
  running = true;
  animationId = requestAnimationFrame(draw);
}

function stopAnimation() {
  running = false;
  cancelAnimationFrame(animationId);
  ctx.clearRect(0, 0, width, height);
}

function syncAnimation() {
  if (document.visibilityState === 'visible' && !isDarkTheme()) startAnimation();
  else stopAnimation();
}
```

Listen to `visibilitychange`, the color-scheme media query, `data-theme` via `MutationObserver`, and resize. The frame function reads the cached `stroke` value and returns immediately when `running` is false.

- [ ] **Step 4: Load likes only as buttons enter the viewport**

Replace the eager `buttons.forEach(async ...)` path with one observer and the existing per-button fetch/click body inside `initializeButton`:

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    initializeButton(entry.target);
  });
}, { rootMargin: '160px 0px' });

function observeVisibleLikes() {
  document.querySelectorAll('.like-btn:not([data-like-initialized])').forEach((button) => {
    if (button.closest('[hidden]')) return;
    button.dataset.likeInitialized = 'true';
    observer.observe(button);
  });
}

document.addEventListener('likes:refresh', observeVisibleLikes);
```

On memo page changes, dispatch `new CustomEvent('likes:refresh')`. Optimistic updates and localStorage behavior remain unchanged.

- [ ] **Step 5: Load article gallery assets on demand**

Remove the unconditional BlogPost LightGallery CSS/JS. Before wrapping images, return when `images.length === 0`; otherwise `loadLightGallery()` injects one stylesheet link and one deferred script, resolves on load, and then initializes the existing gallery options.

- [ ] **Step 6: Verify tests and commit**

Run: `node --test tests/*.test.mjs && ./node_modules/.bin/tsc --noEmit --pretty false`

Expected: all tests and TypeScript pass.

```bash
git add tests/performance-contract.test.mjs src/components/Background.astro src/components/LikeButton.astro src/layouts/Shuoshuo.astro src/layouts/BlogPost.astro
git commit -m "perf: defer invisible background gallery and like work"
```

### Task 4: Serve optimized full photography images

**Files:**
- Modify: `tests/performance-contract.test.mjs`
- Modify: `src/pages/photography.astro`

**Interfaces:**
- Consumes: original imported photography assets for EXIF and source quality.
- Produces: 1200px thumbnails and up-to-2400px WebP gallery targets; originals remain in source control.

- [ ] **Step 1: Add a failing source contract**

```js
test('photography gallery links use optimized full-size WebP output', () => {
  const source = read('src/pages/photography.astro');
  assert.match(source, /getImage/);
  assert.match(source, /width:\s*Math\.min\(2400/);
  assert.match(source, /format:\s*['\"]webp['\"]/);
  assert.match(source, /href=\{img\.fullSrc\}/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/performance-contract.test.mjs`

Expected: FAIL because gallery anchors still point to original multi-megabyte files.

- [ ] **Step 3: Generate optimized full-size URLs during the Astro build**

Import `getImage` from `astro:assets`. After EXIF/dimension processing, call:

```ts
const fullImage = await getImage({
  src: image,
  width: Math.min(2400, image.width),
  format: 'webp',
  quality: 82,
});
```

Return `fullSrc: fullImage.src` from the processed image map. Use `href={img.fullSrc}` and `data-src={img.fullSrc}`. Keep the existing 1200px `<Image>` thumbnail and set `loading={index === 0 ? 'eager' : 'lazy'}` plus `fetchpriority={index === 0 ? 'high' : 'auto'}`.

- [ ] **Step 4: Verify tests, production build, and output references**

Run: `node --test tests/*.test.mjs && npx --no-install astro build`

Expected: tests/build pass; photography anchors point to `_astro/*.webp`, not original JPEG paths.

- [ ] **Step 5: Commit**

```bash
git add tests/performance-contract.test.mjs src/pages/photography.astro
git commit -m "perf: serve optimized photography gallery targets"
```

### Task 5: Verify browser metrics and document the cloud swap

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: the production `dist/` output and `AVATAR_IMAGE` configuration.
- Produces: repeatable performance evidence and two-step CDN replacement guidance.

- [ ] **Step 1: Document the exact cloud replacement procedure**

```md
### Avatar CDN

Upload `public/avatar-112.webp` and `public/avatar-224.webp` with immutable caching. Replace only `AVATAR_IMAGE.src` and `AVATAR_IMAGE.srcset` in `src/consts.ts` with their HTTPS URLs. After verifying both URLs return WebP with long-lived cache headers, delete the two local WebP files and add a `preconnect` for the CDN origin in `BaseHead.astro`.
```

- [ ] **Step 2: Run full verification**

Run:

```bash
node --test tests/*.test.mjs
./node_modules/.bin/tsc --noEmit --pretty false
./node_modules/.bin/sass --no-source-map src/styles/style.scss >/dev/null
npx --no-install astro build
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 3: Repeat the established browser measurement**

Serve `dist/` locally and measure `/`, `/blog/`, one article, `/shuoshuo/`, and `/photography/` in desktop and mobile slow-4G/4×CPU profiles. Record:

```text
Homepage first-party transfer target: <= 650 KB before analytics
Homepage avatar transfer target: <= 20 KB
Internal navigation redirects: 0
Initial memo like requests: 0 until buttons intersect the viewport
CLS target: < 0.1
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: explain avatar CDN replacement"
```
