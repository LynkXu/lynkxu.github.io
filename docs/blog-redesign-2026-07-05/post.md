# Post Detail Design

## Page

`/blog/[slug].html`

## Job

提供最安静、最稳定的长文阅读体验。

## Content To Keep

- 标题、描述、发布日期、更新日期、阅读时长、tags/categories。
- Markdown 渲染、代码复制、LightGallery、link card、Changelog、LikeButton、Toc。

## Layout

- 文章详情使用三列：左侧共享站点栏，中间正文，右侧窄 TOC/Meta。
- 标题区不放卡片，只用日期、类型、标题、描述形成开篇。
- 正文无外框，宽度约 `68ch`，行距略松。
- TOC 和 Meta 为细线分组，视觉低于正文。

## Acceptance

- 第一屏视觉焦点是文章标题和正文开头。
- 代码块、图片、引用、表格不溢出。
- 暗色模式对比足够但不刺眼。
- 所有原有脚本行为仍工作。

## Final Review

- Removed header/body card surfaces and kept title, meta, description, article body, TOC, and post metadata.
- Preserved LightGallery, code copy, link card, changelog, like button, and TOC scripts.
- Verified desktop, mobile, and dark desktop screenshots. No horizontal overflow.
