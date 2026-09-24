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

## Works page design QA

**Source visual truth**

- `/Users/lynk/.codex/generated_images/01a0d168-0012-79b1-8193-126ff7cfbe19/exec-a7744d26-0639-4935-b58e-43183d26ca48.png` (1586 × 992 px). The image represents an approximately 1440 × 900 desktop composition.
- The production site's existing header and footer take precedence over the mockup's simplified global shell.

**Rendered implementation**

- URL: `http://127.0.0.1:4321/works`
- Browser-rendered screenshot: Codex in-app browser capture retained in this task; the browser capture API did not expose an on-disk path.
- Desktop: 1440 × 900 CSS px, DPR 1; screenshot 1437 × 900 px because the page scrollbar occupies 3 px.
- Mobile: 390 × 844 CSS px, DPR 1; no horizontal overflow (`scrollWidth` 387 px).
- States: desktop light, mobile light, mobile dark.

**Full-view comparison evidence**

- The source image and browser-rendered desktop capture were both opened for visual review. The mockup is about 1.10 times larger in pixel width, so composition and reading density were compared after accounting for that scale difference.
- Both show a single narrow reading column, a modest page title, two equal-weight project entries, direct linked names, one-line descriptions on desktop, and no cards, metadata, images, or filler copy.
- The implementation keeps the site's real footer and its reading-width rule, which the mockup omits.

**Focused region comparison evidence**

- The project links and descriptions were inspected in a focused browser capture and through rendered element bounds. Both titles start on the same left edge as the page heading; descriptions sit directly below their links.
- At desktop width, the rendered title is 19.52 px and description is 14.4 px, using the site's existing serif stack. The two project entries have an approximately 44 px inter-item gap from `--r-space-xl`.
- At 390 px, both descriptions wrap cleanly within the 296 px content column.

**Required fidelity surfaces**

- Fonts and typography: the existing serif family is used for heading, linked names, and descriptions; UI navigation retains its existing font. Link underlines remain visible without adding a button treatment.
- Spacing and layout rhythm: the page uses the shared 60ch reading measure and existing `--r-space-lg`, `--r-space-xl`, and `--r-space-xs` tokens. No arbitrary card spacing remains.
- Colors and visual tokens: text, link, background, and dark-theme colors come from the reading surface tokens. The mobile dark-theme capture showed readable contrast.
- Image quality and assets: the chosen design contains no image assets, so none were substituted or generated.
- Copy and content: Runote and AI-Learning names and descriptions match the approved design; year and category labels are absent.

**Interaction and browser checks**

- Both project links have the expected external URLs, `target="_blank"`, and `rel="noopener noreferrer"`.
- Theme switching changed the mobile page to dark mode and back. The browser reported no console errors.
- `npx astro build` completed successfully and generated `/works/index.html`.

**Findings and comparison history**

- Initial render: the description margin was being reset by `!m-0`, leaving the title-to-description gap slightly tight. The local top margin was corrected to `--r-space-xs`; the desktop and mobile page were captured again.
- Final render: no actionable P0, P1, or P2 mismatch remains. The mockup is an illustrative raster design, so minor differences in font rasterization and global shell details are expected.

final result: passed

## 项目页密度调整（2026-09-24）

- 将导航、页面标题及空状态的“作品”改为“项目”，保留 `/works` 路由，避免破坏既有链接。
- 项目名由 19.52 px 收至 16 px；标题到列表间距由 `--r-space-lg` 收至 `--r-space-md`，条目间距由 `--r-space-xl` 收至 `--r-space-md`。描述仍为 14.4 px，行高收至 1.55。
- `npx astro build` 通过，`/works/index.html` 已生成。实际页面已检查 1440 × 900 桌面和 390 × 844 移动端；两者均无横向溢出，移动端描述正常换行。
- 以上仅为实现与基础显示检查；最终视觉审查及是否继续调整由用户决定。
