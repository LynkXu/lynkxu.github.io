# Minimal Reading Redesign

## Goal

用全新「极简阅读」视觉语言重构博客主体页：内容优先、窄栏可读、低噪音。功能专题页只保留入口，不改主题。

## Non-goals

- 不照搬参考站版式（按月双栏、分类索引等）
- 不延续 ledger / postcard / paper-card / Magazine 左栏语法
- 不改摄影、书影音、旅行、运动、工具页主题

## Scope (B)

In scope: `/`, `/blog`, blog posts, `/tags`, `/about`, `/shuoshuo`, `/message`, `/copyright`.

Out of scope (entry links only): `/photography`, `/media`, `/travel`, `/sports`, `/tools`.

## Architecture

- New `ReadingShell` layout + `reading.scss` token layer scoped to `body.reading-surface`.
- Feature pages keep existing Base / SimpleHeader paths.
- Reading pages: no left rail, no global card chrome, no utility FAB cluster; search + theme live in the header as quiet text controls.

## Visual direction

- Personality: 可知、理性、简约.
- Signature: strong title-to-body contrast + steady vertical rhythm; at most one hairline rule.
- Measure: ~65–72ch centered column.
- Type:
  - Body / titles: Source Serif 4 + Noto Serif SC
  - UI / meta: IBM Plex Sans + system CJK sans
  - Code: Lilex
- Color: cool near-white field, cool ink text, muted blue link; dark theme mirrors the same cool axis. No cream/terracotta, no green ledger accent, no paper-card shadows.

## Information architecture

- Home: recent posts (title + date, optional one-line excerpt) + short 碎语 preview (3 items). No「最近痕迹」hub.
- Archive: year-grouped plain lists.
- Post: title, date, tags, body; TOC/like/changelog kept but visually quiet.
- Tags / About / Shuoshuo / Message / Copyright: same shell, content-first.

## Navigation

- Primary: 首页 · 归档 · 碎语 · 留言 · 关于
- Footer row: 摄影 · 书影音 · 旅行 · 运动 · 工具 · RSS · 版权
