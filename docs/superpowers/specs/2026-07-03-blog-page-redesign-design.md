# Blog Page Redesign Design

## Goal

Redesign the primary blog-facing pages to match the supplied mockups while preserving existing content, routes, and data synchronization paths.

## Visual Source

- `docs/design-mockups/about-page-design.png`
- `docs/design-mockups/archive-page-design.png`
- `docs/design-mockups/post-detail-page-design.png`
- `docs/design-mockups/memos-page-design.png`
- `docs/design-mockups/leaves-page-design.png`
- `/Users/link/.codex/attachments/888ffc75-116e-407a-816a-2c71d3d1331e/image-1.png` as the home-page style anchor

## Scope

Redesign:

- `/blog`
- `/blog/[slug].html`
- `/about`
- `/shuoshuo`
- `/message`

Do not redesign:

- `/photography`
- `/sports`
- `/media`
- `/travel`
- `/tools`
- `/copyright`
- Other second-level feature pages unless they are directly needed to keep shared navigation consistent.

## Direction

Use a restrained paper interface with a top navigation bar, strong but limited teal accents, thin bordered panels, compact section labels, and a two-column desktop layout. The main column carries the content. The right column carries page context such as tags, quick index, filters, metadata, or comment summary.

The design should feel close to the mockups, but it must remain native to the existing site: serif reading typography, existing spacing tokens, existing paper card tokens, and dark-theme compatibility stay in place.

## Protected Data And Behavior

Do not change these data links or identifiers:

- Blog collection loading through `getCollection('blog')`
- Draft filtering through `filterDrafts`
- Blog URLs using `/blog/${post.data.slug ?? post.id}.html`
- RSS and search index generation
- `scripts/fetch-mastodon.js`
- `scripts/fetch-neodb.js`
- `scripts/publish-blog-to-mastodon.mjs`
- `src/data/mastodon.json`
- `src/data/neodb.json`
- `src/data/mastodon-published.json`
- Memos merge of local `gossips` collection and Mastodon statuses
- Memos pagination query behavior
- Memos and post LightGallery initialization
- `LikeButton` IDs for posts and gossips
- `Comments` Twikoo lazy-load behavior on `/message`

## Page Designs

### Shared Shell

`MagazineShell` becomes the primary blog shell. It should provide a mockup-aligned header with brand, section navigation, RSS, and search trigger. Page body spacing should use the existing `--page-inline`, `--blog-shell-width`, `--paper-card-*`, and text tokens. The shell should allow pages to override the right rail through slots instead of always showing the author card.

### Archive

`/blog` uses a large paper panel for year-grouped posts and a right rail for tags and quick year index. Existing post order, draft badges, tags, descriptions, and URLs stay intact.

### Post Detail

Post detail uses a header panel, a separate article body panel, and a right rail containing the table of contents and metadata. Existing markdown rendering, code copy behavior, LightGallery, changelog, and like button stay intact.

### About

`/about` becomes a two-column paper composition: a large profile panel with current page content and smaller right-side panels for now, colophon, and support. Existing MDX content and sponsor component stay as content sources.

### Memos

`/shuoshuo` becomes a timeline panel with memo cards and a right rail for filters, month/source stats, and counts. Filters can be visual-only unless the existing data model already supports safe filtering. The local-plus-Mastodon merge, pagination, media attachment gallery, and likes remain functional.

### Leaves

`/message` adds a page panel around comments and a contextual right rail. The Twikoo lazy gate and manual loading remain untouched.

## Verification

- Run `npm run build`.
- Run the local site and inspect desktop and mobile views for `/blog`, one post detail page, `/about`, `/shuoshuo`, and `/message`.
- Check light and dark themes for color and border contrast.
- Confirm no design work touched the excluded second-level feature pages.
- Confirm scripts and data file paths for blog sync remain unchanged.

