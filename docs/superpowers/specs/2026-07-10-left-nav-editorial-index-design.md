# Left Navigation Editorial Index Design

## Goal

Refine only the blog shell's left navigation so it reads as a quiet editorial index, improves current-location visibility and mobile efficiency, and leaves the main column, right context rail, and secondary page layouts unchanged.

## Scope

- Modify only left-navigation markup and its locally scoped styles in `src/layouts/MagazineShell.astro`.
- Add a focused source-contract test for the navigation.
- Do not change `.ledger-shell`, `.ledger-main`, `.ledger-context`, page content, global layout tokens, data, or feature-page layouts.

## Visual Direction

- Keep the existing paper background, forest-green accent, natural-color avatar, and restrained rule-based language.
- Make the brand text-led by reducing the avatar from 44px to 36px.
- Prefix the five primary destinations with tabular `01`–`05` indices on the desktop rail.
- Replace the detached active dot with a short 1px rule close to the active label.
- Place search immediately after the primary navigation instead of pinning it to the viewport bottom.
- Keep topics and social links within the left navigation, with stronger small-text contrast and a compact editorial hierarchy.

## Responsive Behavior

- Desktop: retain sticky navigation, but let the rail's divider end with its content instead of forcing it to full viewport height.
- Up to 1100px: compose the navigation as a compact two-row masthead inside the existing single-column shell, retaining the current-page marker while omitting the desktop indices; do not change the shell breakpoint or content width.
- Up to 640px: keep brand and search on the first row, primary navigation on a 44px-tall second row, and secondary links below.

## Interaction and Accessibility

- Preserve semantic `aside`, `nav`, `details`, `summary`, `button`, and `aria-current` behavior.
- Keep focus-visible states and make touch targets at least 44px on narrow screens.
- Use color and an independent marker for hover/current feedback; do not animate padding or layout properties.

## Verification

- A source-contract test locks the indices, search order and inline-command style, active marker, mobile target sizes, and unchanged main/context layout declarations.
- Run Astro's type/content check through the production build.
- Inspect desktop light, desktop dark, 1024px, and mobile views and compare main/context geometry before and after.
