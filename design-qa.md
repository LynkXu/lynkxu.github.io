# Design QA history

## Travel / Media redesign QA

Date: 2026-09-17
Routes: `/travel`, `/media`
Reference: approved mockup plus `docs/superpowers/specs/2026-09-17-travel-media-redesign-design.md`

### Result

Ready for user visual acceptance. Interactive state, production build, and desktop/mobile light-dark checks passed.

### Evidence

- Unit tests: `node --test tests/travel-map-state.test.ts tests/media-filter.test.ts` — 10 passed
- Production: `npm exec astro build` — success; map and media scripts inlined as page modules
- Desktop light: travel world view, Chengdu boundary + tooltip, Osaka fallback fly-to, media shelf + type pills
- Desktop dark: both routes keep paper tokens; map tiles dim without washing zoom controls
- 390px: one-column archives, no horizontal overflow; media filters wrap under the title
- Interactions: city selection, `返回世界`, media filter `aria-pressed`, empty year sections hidden, counts update

### Remaining notes

- Default map includes Houston, so the world view is Pacific-centered rather than Asia-only like the mock data
- Cover images lazy-load; first paint can show empty frames for a moment
- Final visual sign-off belongs to the user

## Homepage Design QA

**Source visual truth**

- `/Users/lynk/.codex/visualizations/2026/09/21/01a0c192-fd02-72c1-ba02-ac579eb06304/lynk-home-ui-concept.html`
- User constraints override two details in the concept: the introductory description is omitted and the existing site footer is retained.

**Rendered implementation**

- URL: `http://127.0.0.1:4321/`
- Browser-rendered screenshot: Codex in-app browser capture retained in the task output (the browser capture API did not expose an on-disk path).
- Desktop viewport: 1280 × 900 CSS px, DPR 1; capture: 1280 × 900 px.
- Mobile viewport: 390 × 844 CSS px, DPR 1; full-page content height: approximately 1147 px.
- States: desktop light, mobile light, mobile dark.

**Full-view comparison evidence**

- The design and implementation were opened in the same browser session and captured at the desktop viewport before comparison.
- Both use the approved single reading column, restrained section rules, five recent posts, three short notes, and the existing low-contrast paper-like palette.
- The implementation intentionally removes the concept's introductory sentence and keeps the production footer structure and styling.
- The existing footer divider remains aligned to the reading column. Extending it to the viewport edge would give the footer disproportionate visual weight and weaken the page's shared alignment.

**Focused region comparison evidence**

- Intro, article rows, note rows, and footer were individually legible in the full-page captures, so separate crops were not necessary.
- At 390 px, article and note dates move beneath their associated content without horizontal overflow or awkward truncation.
- The dark-theme capture preserves the same hierarchy and divider contrast.

**Required fidelity surfaces**

- Fonts and typography: existing serif body/display and UI metadata families are preserved; the intro uses the existing page-title token and a restrained medium weight.
- Spacing and layout rhythm: intro and inter-section spacing use existing `--r-space-2xl`; list density uses `--r-space-sm`; alignments remain on the shared reading measure.
- Colors and visual tokens: no new background or accent colors were introduced; existing light and dark tokens remain in use.
- Image quality and assets: the page contains no visible image assets, so there is no asset substitution or raster-quality risk.
- Copy and content: the prohibited introductory description is absent; production article and note content is retained.

**Findings**

- No actionable P0, P1, or P2 visual differences remain.

**Comparison history**

- Initial implementation pass: no P0/P1/P2 issue was found, so no corrective visual iteration was required.

**Implementation checklist**

- [x] Keep the homepage single-column and card-free.
- [x] Show five recent articles.
- [x] Strengthen the intro through type scale and spacing only.
- [x] Stack dates cleanly on small screens.
- [x] Preserve the existing footer and its content-width divider.
- [x] Check desktop, mobile, light, and dark states.
- [x] Check browser console errors (none found).

final result: passed
