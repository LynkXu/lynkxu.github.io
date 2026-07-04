# Blog Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the primary blog-facing pages to match the supplied mockups while preserving existing content and sync behavior.

**Architecture:** Keep Astro content collections and data scripts unchanged. Update the shared `MagazineShell` to support a top-nav, page-specific right rail, and mockup-aligned paper layout, then update each affected page/layout to use that shell.

**Tech Stack:** Astro 5, MDX content collections, SCSS/CSS custom properties, existing LightGallery/Twikoo/Mastodon/NeoDB integrations.

---

## File Structure

- Modify `src/layouts/MagazineShell.astro`: shared blog shell, header, navigation, search trigger, optional right rail.
- Modify `src/pages/blog/index.astro`: archive page content and right rail.
- Modify `src/layouts/BlogPost.astro`: post header/body panels, metadata rail, existing TOC and post scripts.
- Modify `src/layouts/About.astro`: about page composition.
- Modify `src/content/page/about.mdx`: only if existing content wrappers need class hooks; keep content unchanged.
- Modify `src/layouts/Shuoshuo.astro`: memo timeline visual structure and stats rail; preserve data merge and scripts.
- Modify `src/layouts/Message.astro`: leaves page panels around existing comments.
- Modify `src/styles/style.scss`: only for shared tokens or global helpers that are reused by several redesigned pages.

## Tasks

### Task 1: Shared Magazine Shell

**Files:**
- Modify: `src/layouts/MagazineShell.astro`

- [ ] Add props for `railMode`, `showProfileCard`, and `shellLabel` with safe defaults.
- [ ] Render a desktop top navigation that matches the mockups and keeps the existing RSS and search entry points.
- [ ] Keep the existing profile card available for pages that still need it, but allow redesigned pages to provide `sidebar-extra` as their primary right rail.
- [ ] Update responsive CSS so the right rail stacks below the main content on tablet and mobile.

### Task 2: Archive Page

**Files:**
- Modify: `src/pages/blog/index.astro`

- [ ] Preserve the existing `getCollection('blog')`, `filterDrafts`, sorting, and post URL generation.
- [ ] Add tag and year summary data from the already-loaded posts.
- [ ] Replace the simple year-card list with a mockup-style article ledger.
- [ ] Provide a right rail with tags, entry count, topic count, and quick year index.
- [ ] Verify long Chinese and English titles wrap without overlapping tags or dates.

### Task 3: Post Detail

**Files:**
- Modify: `src/layouts/BlogPost.astro`

- [ ] Keep post markdown rendering, LightGallery setup, copy buttons, changelog, and like button intact.
- [ ] Split the visible surface into a post header panel and article body panel.
- [ ] Move TOC and post metadata into the shell right rail.
- [ ] Preserve `postId`, `showTOC`, `tocMinLevel`, `tocMaxLevel`, and `readingTime`.
- [ ] Check code blocks, images, headings, and mobile post headers.

### Task 4: About Page

**Files:**
- Modify: `src/layouts/About.astro`
- Modify only if needed: `src/content/page/about.mdx`

- [ ] Keep the existing written content and `SponsorAbout` component.
- [ ] Create a large profile panel and smaller right-side panels matching the about mockup.
- [ ] Use existing content hooks for work/daily/support/blog details.
- [ ] Ensure mobile stacks without nested card crowding.

### Task 5: Memos Page

**Files:**
- Modify: `src/layouts/Shuoshuo.astro`

- [ ] Preserve local gossips plus Mastodon merge, sort order, stats, page size, pagination, LikeButton IDs, media attachments, and LightGallery initialization.
- [ ] Add a timeline paper panel, memo cards, and visual source/filter chips.
- [ ] Add a right rail for filters, month stats, and source stats.
- [ ] Keep filters non-destructive unless they can be wired to the existing in-memory `memoItems` safely.
- [ ] Verify `?page=` pagination still hides and shows the correct page.

### Task 6: Leaves Page

**Files:**
- Modify: `src/layouts/Message.astro`

- [ ] Preserve `<Comments showLinuxDo={false} manualTwikooLoad={true} />`.
- [ ] Add a main message panel and contextual right rail.
- [ ] Style the Twikoo lazy gate so it belongs to the new paper interface without changing its script.

### Task 7: Shared Polish And Verification

**Files:**
- Modify only as needed: `src/styles/style.scss`

- [ ] Run `npm run build`.
- [ ] Start the dev server.
- [ ] Inspect desktop and mobile for `/blog`, one generated `/blog/*.html` page, `/about`, `/shuoshuo`, and `/message`.
- [ ] Check light and dark theme contrast.
- [ ] Confirm excluded pages are not modified.
- [ ] Search for protected sync files and verify they were not edited.
- [ ] Fix spacing, overlapping text, unclear emphasis, or unsuitable colors found during review.

## Self-Review

- Spec coverage: all requested redesigned pages and excluded second-level pages are represented.
- Protected behavior: blog routes, draft filtering, Mastodon/NeoDB sync files, memos merge, pagination, LightGallery, LikeButton, and Twikoo lazy loading are explicitly protected.
- Placeholders: none.
- Type consistency: prop names are limited to shell presentation concerns and do not affect content collection types.

