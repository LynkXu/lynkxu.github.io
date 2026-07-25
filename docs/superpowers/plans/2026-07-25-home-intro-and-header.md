# Home Intro / Works + Reading Header Bar Implementation Plan

> **For agentic workers:** Implement each branch independently from `main`. Steps use checkbox syntax.

**Goal:** Ship two isolated homepage/header refinements without merging them into one PR.

**Architecture:** Branch 1 only touches home content + reading list styles. Branch 2 only retunes `ReadingShell` header chrome styles. Shared design context: minimal reading surface.

**Tech Stack:** Astro, SCSS (`reading.scss`), existing `ReadingShell`.

## Global Constraints

- Copy for intro: one short line; no topic blurbs.
- Works gated by `SHOW_HOME_WORKS` default `false`.
- Header: single row, not sticky/fixed.
- Stay on reading tokens; verify light/dark + desktop/mobile.

---

## Branch A — `feat/home-intro-works`

### Task A1: Intro block on home

**Files:** `src/pages/index.astro`, `src/styles/reading.scss`

- [ ] Add intro section above recent posts with copy `你好，我是 Lynk。`
- [ ] Style with quiet serif line; existing section rhythm
- [ ] Visual check desktop + mobile

### Task A2: Flag-gated works placeholders

**Files:** `src/pages/index.astro`, `src/styles/reading.scss`

- [ ] Add `SHOW_HOME_WORKS = false` and placeholder works array
- [ ] Render works section only when flag true (list: title + one line)
- [ ] Place between intro and recent posts
- [ ] Toggle flag true locally to verify, leave default false
- [ ] Commit on branch

---

## Branch B — `feat/reading-header-bar`

### Task B1: Single-row hierarchy

**Files:** `src/layouts/ReadingShell.astro` (only if markup needed), `src/styles/reading.scss`

- [ ] Strengthen brand vs soften nav/tools within one row
- [ ] Slightly increase header vertical padding; keep bottom rule
- [ ] No sticky/fixed; no tagline
- [ ] Visual check light/dark, desktop/mobile
- [ ] Commit on branch
