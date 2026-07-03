# Blog Redesign Preferences

## Purpose

This document records the current redesign direction after the homepage iteration. It is the working checklist for the next pass on Archive, Memos, Leaves, About, and post detail pages.

## Design Baseline

- The blog should feel restrained, readable, and personal: content first, quiet surfaces, clear rhythm.
- The homepage is the style anchor: strong opening identity is allowed, but content modules must quickly become the focus.
- Main content should carry the page. Right rails are supportive and should not explain the obvious.
- Prefer meaningful information density over large decorative blocks.

## Confirmed Preferences From The Homepage Pass

- Remove copy that only describes the site without helping navigation or reading.
- Avoid overly dominant top sections. Lower content such as Latest and Index should not feel visually weaker than the hero.
- Keep useful structural anchors, such as the date block in Latest, when they improve scanning.
- Reduce nested-card noise by removing unnecessary inner borders before removing useful structure.
- Section labels such as Latest and Index should be light, not headline-heavy.
- Links and metadata should be correct and intentional; decorative or incorrect icons should be fixed rather than ignored.
- Data stream surfaces should be softer than primary content cards.
- Text weight in lower content modules should stay moderate. Heavy type is reserved for page identity and article titles.
- Spacing should breathe. If a section feels cramped, increase rhythm before adding more decoration.

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
- Are there unnecessary nested borders or cards?
- Is every right-rail item useful, current, and non-redundant?
- Are summaries shown only where they help the user decide what to read?
- Do long Chinese and English titles avoid overlap with dates, tags, and metadata?
- Does mobile stack without losing important controls or creating full-width clutter?
- Does dark mode retain enough contrast without becoming visually loud?
