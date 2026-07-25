# Home Intro / Works + Reading Header Bar

Date: 2026-07-25

## Goals

Two independent optimizations from `main`, on separate branches:

1. **Home door**: short self-intro + optional works block (flag-gated).
2. **Header bar**: single-row reading header with clearer brand / nav / tools hierarchy. Not sticky, not two-row.

## Branch 1 — `feat/home-intro-works`

### Intro

- Place above “最近文章”.
- Copy: one short line only, e.g. `你好，我是 Lynk。`
- No topic blurbs, no second explanatory paragraph, no landing-page welcome title.
- Serif, near body ink; use existing section spacing to the next block.

### Optional works

- Between intro and recent posts.
- List grammar (title + one short line), not card grid.
- 2–3 placeholder items in a local constant array.
- `SHOW_HOME_WORKS` boolean (default `false`); when false, section is not rendered.
- Order: intro → (optional) works → recent posts → 碎语.

### Out of scope

- Header changes, tag chips on post list, sticky behavior.

## Branch 2 — `feat/reading-header-bar`

### Header

- Keep single row: brand | nav | tools.
- Not `sticky` / `fixed`; visually a stable top bar only.
- Brand: slightly stronger anchor (size/weight).
- Nav: softer than brand.
- Tools: softer still; hover → near ink.
- Slightly more vertical padding; keep bottom rule.
- No brand tagline beside the wordmark.
- Narrow screens: wrap within the same single-layer model.

### Out of scope

- Home intro/works, hamburger, two-row masthead.

## Shared constraints

- Stay inside current reading-surface tokens and paper-reading tone.
- Light + dark both valid.
- Prefer existing spacing / type tokens; no random magic numbers.
