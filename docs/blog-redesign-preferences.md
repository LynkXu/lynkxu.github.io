# Blog Redesign Preferences

## Purpose

This document records the current redesign direction after the homepage iteration. It is the working checklist for the next pass on Archive, Memos, Leaves, About, and post detail pages.

## Design Baseline

- The blog should feel restrained, readable, and personal: content first, quiet surfaces, clear rhythm.
- The homepage is the style anchor: strong opening identity is allowed, but content modules must quickly become the focus.
- Main content should carry the page. Right rails are supportive and should not explain the obvious.
- Prefer meaningful information density over large decorative blocks.
- Core blog pages use a consistent shell width of `1160px` so Home, Archive, Memos, Leaves, About, and post detail pages share the same horizontal rhythm. Feature pages can diverge only when their content type requires it.
- Core blog pages should use medium information density: enough content visible in a default window, without turning long-form reading into an app-like table.

## Confirmed Preferences From The Homepage Pass

- Remove copy that only describes the site without helping navigation or reading.
- Avoid overly dominant top sections. Lower content such as Latest and Index should not feel visually weaker than the hero.
- Keep useful structural anchors, such as the date block in Latest, when they improve scanning.
- Reduce nested-card noise by removing unnecessary inner borders before removing useful structure.
- On the homepage, content sections should not use an outer card when their children are already card-like. Use spacing and alignment for the section; keep cards only for actual entries or links.
- Section labels such as Latest and Index should be light, not headline-heavy.
- Links and metadata should be correct and intentional; decorative or incorrect icons should be fixed rather than ignored.
- Data stream surfaces should be softer than primary content cards.
- Text weight should stay light-to-moderate across the site. Most UI emphasis should sit around medium weight; heavy type is rare and reserved for the strongest page identity moments only.
- Spacing should breathe. If a section feels cramped, increase rhythm before adding more decoration.
- Reading text uses the same sans-based mixed Chinese/Latin stack as the UI for steadier gray value in long articles. Serif faces are reserved for selective editorial accents, not the default article body.
- Density should be tuned by role: article pages tighten line-height and padding first; Archive can be the densest scanning surface; Memos can be compact but should still feel like a calm timeline; About and Leaves should only be lightly compressed.

## Typography Weight Strategy

- Body text uses regular weight.
- Current global weight scale: medium `430`, semibold `500`, bold `560`, display `640`.
- Article body should feel clear and steady before it feels literary; prefer font family, color, line-height, width, and padding tuning before increasing body weight.
- Secondary UI labels, metadata, rail content, and small navigation text should avoid bold weight.
- Section labels should be light and quiet, not headline-heavy.
- Article/list titles should usually use medium or semibold weight, not heavy bold.
- Large display text may be stronger, but should still feel restrained rather than poster-like.
- Avoid hard-coded high weights such as 700, 760, 800 unless there is a specific visual reason.
- Use size and weight together to express hierarchy:
  - Page identity: larger size, `560`, rarely `640`.
  - Year/stat anchors: larger size, `560`.
  - Article/card titles: medium size, `500`.
  - Dates, tags, metadata, side-rail values: small-to-medium size, `430` or `500`.
  - Supporting descriptions: regular body weight.

## Page-Level Requirements

### Archive

- The archive list should not show article summaries.
- The list should be optimized for scanning by year, date, title, and primary tag.
- Tags and year shortcuts stay secondary in the right rail.
- Draft badges can remain visible in development, but should not dominate the row.

### Memos

- Memos should feel like a quiet timeline, not a dashboard.
- Memo cards can keep their boundaries, but density and spacing should be calmer than a social feed.
- Filters and source/month stats are secondary context.

### Leaves

- The comment input and Twikoo content should stay functional and lazy-loaded.
- The page should frame visitor messages as the main content.
- Right rail copy should be useful, short, and non-promotional.

### About

- The previous right rail is not meaningful enough.
- Replace generic explanation cards with self-descriptive, useful personal context.
- Keep the about page personal, but avoid slogan lists that repeat homepage personality tags.
- Sponsor/support should remain low priority.

### Post Detail

- The article title and body should be the primary reading path.
- TOC and metadata should be useful but visually quieter than the article.
- Avoid stacked card heaviness around the title and body when a lighter page rhythm works better.
- Preserve markdown rendering, code copy buttons, images, LightGallery, changelog, likes, TOC behavior, and post metadata.

## Review Checklist

- Can the page be understood at default desktop size without the first screen feeling crowded?
- Does the main content win over the right rail?
- Are all section labels lighter than page titles and article titles?
- Does any page feel globally too bold or visually loud because too many elements use semibold/bold?
- Are there unnecessary nested borders or cards?
- Is every right-rail item useful, current, and non-redundant?
- Are summaries shown only where they help the user decide what to read?
- Do long Chinese and English titles avoid overlap with dates, tags, and metadata?
- Does mobile stack without losing important controls or creating full-width clutter?
- Does dark mode retain enough contrast without becoming visually loud?
