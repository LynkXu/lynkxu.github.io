# Travel and Media Redesign

## Goal

Redesign `/travel` and `/media` around their primary content while keeping them visually consistent with the existing blog. The selected visual source is `/Users/lynk/.codex/generated_images/01a0ad0a-9a67-7102-b039-8235a895aa1c/exec-b940fb42-ef95-4f50-b40a-2fcc34617182.png`.

## Shared visual language

- Use the existing `SimpleHeader`, theme tokens, serif heading stack, UI metadata stack, spacing scale, and wide container tokens.
- Keep the interface digital and clean. Do not add paper grain, parchment, faux editorial ornaments, an invented site brand, or a new global navigation.
- Use the page background, thin neutral rules, low-saturation moss accent, small radii, and minimal elevation already present in the blog.
- Remove dashboard statistics, English eyebrow labels, slogans, and explanatory copy that do not help the page task.
- Support light and dark themes and `prefers-reduced-motion`.

## Travel page

The travel page helps a reader understand geographic coverage first and revisit trips chronologically second.

- Show a compact page title followed by one full-width Leaflet map.
- The default map state fits all recorded places and shows restrained point markers.
- Selecting a city from the map or archive uses the same map to move to that place. There is no separate detail map.
- Places with a six-digit Chinese administrative code load the matching city boundary GeoJSON. The map fits that polygon and fills it with the existing accent color.
- A city polygon is visible only at regional/city zoom. Zooming back out removes the polygon from view.
- The selected state exposes the city and visit date, plus a functional `返回世界` control that clears the selection and restores the global bounds.
- If a boundary request fails or the place has no supported boundary, selection still flies to the point and opens its marker.
- The archive is a compact chronological index grouped by year. Rows are buttons connected to map selection; they are not cards.

## Media page

The media page helps a reader browse actual records immediately.

- Show a compact page title and one functional type filter: `全部`, `书籍`, `电影`, `剧集`, `游戏`.
- Default to `全部`; do not hide most of the collection behind the first type tab.
- Render a single recent-first archive grouped by record year.
- Each record shows its existing cover, title, type, publication year, available rating, status, date, and optional short note.
- Media entries use an open shelf layout with lightweight row/column alignment. Remove enclosing card borders and strong shadows.
- Filtering hides unmatched entries and empty year sections while updating `aria-pressed`.

## Data and failure handling

- Extend `TravelPlace` with optional `adminCode` and add codes for recorded mainland Chinese places and supported SARs where boundary data exists.
- Build the boundary URL only from validated six-digit codes.
- Treat external boundary data as progressive enhancement. A failure must not break point navigation or the archive.
- Keep NeoDB data and links unchanged.

## Responsive behavior

- Desktop uses the wide blog container and a broad map, followed by multi-column year groups.
- Mobile keeps the title and controls concise, uses a shorter map, and collapses travel/media archives to one column without horizontal page overflow.
- Map controls and filter controls remain keyboard reachable with visible focus.

## Verification

- Unit-test boundary URL validation, zoom-level visibility, selection labels, and media filter matching before page implementation.
- Run the unit tests and Astro production build.
- Check `/travel` and `/media` at desktop and mobile widths in light and dark themes.
- Verify travel city selection, boundary fallback, return-to-world, media filtering, keyboard focus, console errors, and responsive overflow.
- The user owns the final visual acceptance.
