# Travel and Media Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/travel` and `/media` from the approved mockup with a single progressive map and a content-first unified media archive.

**Architecture:** Keep both routes inside the existing Astro layout and token system. Extract small pure state helpers for boundary selection and media filtering, then keep Leaflet and DOM wiring local to their pages. Boundary GeoJSON is progressive enhancement keyed by optional administrative codes in the existing travel data.

**Tech Stack:** Astro 5, TypeScript, browser JavaScript, Leaflet 1.9.4, Node `node:test`, existing SCSS design tokens.

**Spec:** `docs/superpowers/specs/2026-09-17-travel-media-redesign-design.md`

## Global Constraints

- Match `/Users/lynk/.codex/generated_images/01a0ad0a-9a67-7102-b039-8235a895aa1c/exec-b940fb42-ef95-4f50-b40a-2fcc34617182.png` while preferring the current blog tokens over its exaggerated paper/editorial cues.
- Use one map with world and city states; never render a second detail map.
- Do not add dashboard statistics, filler copy, new fonts, fake branding, or new global navigation.
- Preserve light/dark themes, responsive behavior, accessible controls, and reduced-motion support.
- Preserve the unrelated modification in `src/content/blog/.obsidian/workspace.json`.

---

### Task 1: Testable interaction state

**Files:**
- Create: `src/lib/travel-map-state.ts`
- Create: `src/lib/media-filter.ts`
- Create: `tests/travel-map-state.test.ts`
- Create: `tests/media-filter.test.ts`

**Interfaces:**
- Produces: `getBoundaryUrl(adminCode?: string): string | null`, `isBoundaryVisible(zoom: number): boolean`, `getSelectionLabel(name: string, date: string): string`, and `matchesMediaFilter(itemKind: string, activeKind: string): boolean`.

- [ ] **Step 1: Write failing Node tests for valid/invalid administrative codes, city zoom visibility, selection labels, and `all`/type media matching.**
- [ ] **Step 2: Run `node --test tests/travel-map-state.test.ts tests/media-filter.test.ts` and confirm failure because the modules do not exist.**
- [ ] **Step 3: Implement the four pure helpers with no DOM or Leaflet dependency.**
- [ ] **Step 4: Re-run the two tests and confirm they pass.**

### Task 2: Single-map travel experience

**Files:**
- Modify: `src/data/travel-places.ts`
- Modify: `src/pages/travel.astro`

**Interfaces:**
- Consumes: helpers from Task 1 and `TravelPlace.adminCode`.
- Produces: `data-place-index` buttons, one `#travel-map`, `#travel-map-reset`, and `#travel-map-selection` live state.

- [ ] **Step 1: Add `adminCode?: string` and verified six-digit codes to supported Chinese travel places.**
- [ ] **Step 2: Replace the hero/stat/card structure with a compact title, one full-width map, selection/reset controls, and a chronological row index.**
- [ ] **Step 3: Wire map and archive selection to marker focus, progressive boundary loading, city fit, zoom visibility, failure fallback, and world reset.**
- [ ] **Step 4: Implement desktop/mobile, dark-theme, focus, hover, and reduced-motion styles using existing tokens.**
- [ ] **Step 5: Run the state tests and `npm exec astro build`.**

### Task 3: Unified media archive

**Files:**
- Modify: `src/pages/media.astro`
- Modify: `src/components/MediaCard.astro`

**Interfaces:**
- Consumes: `matchesMediaFilter` from Task 1 and the existing NeoDB JSON shape.
- Produces: `[data-media-filter]`, `[data-media-item]`, and `[data-media-year]` hooks.

- [ ] **Step 1: Build one recent-first, year-grouped collection carrying each item’s type key and label.**
- [ ] **Step 2: Replace statistics and tab panels with a compact title, plain filter controls, and one unified archive.**
- [ ] **Step 3: Wire filter controls to entry/year visibility and accessible pressed state.**
- [ ] **Step 4: Restyle `MediaCard` as an open shelf item without a surrounding card border or strong shadow.**
- [ ] **Step 5: Run the state tests and `npm exec astro build`.**

### Task 4: Browser and design verification

**Files:**
- Create: `design-qa.md`

**Interfaces:**
- Consumes: approved mockup and local `/travel` and `/media` routes.
- Produces: a `design-qa.md` record with final result and evidence.

- [ ] **Step 1: Open the routes in the in-app browser at desktop and 390px mobile widths.**
- [ ] **Step 2: Check light/dark themes, map city selection/reset, media filters, focus states, overflow, and console errors.**
- [ ] **Step 3: Compare the rendered pages with the approved mockup, correct P0–P2 mismatches, and record the comparison.**
- [ ] **Step 4: Re-run tests and `npm exec astro build`, leaving the local preview available for user acceptance.**
