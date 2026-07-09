# Left Navigation Editorial Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine only the blog shell's left navigation into a compact editorial index without changing main-content or right-rail layout.

**Architecture:** Keep the implementation inside `MagazineShell.astro`: enrich the existing nav data with display indices, reorder only left-sidebar children, and replace only `.ledger-*` sidebar styles. A Node source-contract test prevents accidental edits to the shell/main/context layout contract.

**Tech Stack:** Astro 5, scoped CSS, Node.js built-in test runner.

## Global Constraints

- Do not modify `.ledger-shell`, `.ledger-main`, `.ledger-context`, global layout tokens, page content, or secondary feature-page layouts.
- Preserve the current paper/ink/forest-green theme and semantic navigation elements.
- Touch targets are at least 44px at the narrow breakpoint.

---

### Task 1: Lock the left-navigation contract

**Files:**
- Create: `tests/left-nav-structure.test.mjs`
- Read: `src/layouts/MagazineShell.astro`

**Interfaces:**
- Consumes: the source text of `src/layouts/MagazineShell.astro`
- Produces: a deterministic contract for numbered links, active topic disclosure, sidebar order, active marker, and mobile target size

- [ ] **Step 1: Write the failing test**

Create Node tests that assert `01`–`05` index values, `secondaryActiveItem`, an `open` binding on `.ledger-collections`, search markup before topics, `.ledger-nav__index`, absence of `.ledger-nav__link.active::after`, and a `2.75rem` narrow-screen target.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/left-nav-structure.test.mjs`

Expected: FAIL because the current navigation has no indices or secondary-active disclosure and still uses the detached dot.

### Task 2: Implement the editorial navigation

**Files:**
- Modify: `src/layouts/MagazineShell.astro`
- Test: `tests/left-nav-structure.test.mjs`

**Interfaces:**
- Consumes: existing `isActive(href)` route matching and current theme tokens
- Produces: numbered primary links, automatically expanded active topics, content-height sticky rail, compact responsive masthead

- [ ] **Step 1: Add minimal markup and data**

Add index strings to `navItems`, derive `secondaryActiveItem`, render index/label spans, move search immediately after the primary nav, bind topic openness to active state, and place RSS with social links.

- [ ] **Step 2: Replace only left-sidebar styles**

Reduce the avatar, use a three-column link grid, add a nearby 1px active rule, remove padding-based hover motion and bottom pinning, raise secondary text size/contrast, and add two-row 1100px/640px masthead rules.

- [ ] **Step 3: Run focused tests**

Run: `node --test tests/left-nav-structure.test.mjs`

Expected: all tests PASS.

- [ ] **Step 4: Run production verification**

Run: `npm run build`

Expected: build completes successfully with no Astro errors.

- [ ] **Step 5: Inspect responsive views**

Run the local Astro server and inspect `/` plus a blog post at desktop light, desktop dark, 1024px, and mobile widths. Confirm `.ledger-main` and `.ledger-context` geometry remains unchanged at desktop widths.
