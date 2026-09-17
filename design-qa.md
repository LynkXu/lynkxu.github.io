# Travel / Media redesign QA

Date: 2026-09-17
Routes: `/travel`, `/media`
Reference: approved mockup plus `docs/superpowers/specs/2026-09-17-travel-media-redesign-design.md`

## Result

Ready for user visual acceptance. Interactive state, production build, and desktop/mobile light-dark checks passed.

## Evidence

- Unit tests: `node --test tests/travel-map-state.test.ts tests/media-filter.test.ts` — 10 passed
- Production: `npm exec astro build` — success; map and media scripts inlined as page modules
- Desktop light: travel world view, Chengdu boundary + tooltip, Osaka fallback fly-to, media shelf + type pills
- Desktop dark: both routes keep paper tokens; map tiles dim without washing zoom controls
- 390px: one-column archives, no horizontal overflow; media filters wrap under the title
- Interactions: city selection, `返回世界`, media filter `aria-pressed`, empty year sections hidden, counts update

## Remaining notes

- Default map includes Houston, so the world view is Pacific-centered rather than Asia-only like the mock data
- Cover images lazy-load; first paint can show empty frames for a moment
- Final visual sign-off belongs to the user
