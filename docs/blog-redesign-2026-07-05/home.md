# Home Page Design

## Page

`/`

## Job

让读者最快进入最近文章，并保留通往归档和二级内容页的入口。

## Content To Keep

- 现有文章集合、最新文章、文章数量、标签数量、起始年份。
- 现有头像、社交链接、Photography / Media / Travel / Sports 入口。
- Mastodon / NeoDB / Strava 外部入口。

## Layout

- 左侧共享站点栏负责全站导航。
- 主区第一屏不放 slogan。顶部只放 `LynkXu` 和三个轻量统计。
- 最新文章是页面最大内容块，使用日期锚点、标题、短摘要、首个标签和阅读时间。
- Index 入口比最新文章低一级，不做大图标卡片，只做两列文字入口。
- 数据流入口只保留平台名，不写解释性介绍。

## Acceptance

- 默认桌面视口里最新文章比个人资料更显眼。
- 不出现“Do the right thing”一类标语。
- 颜色不超过黑/灰/细线/一枚淡绿色。
- 移动端先读到身份和最新文章，再看到入口。

## Final Review

- Implemented as left navigation + main reading ledger.
- Removed the slogan and kept only existing identity, stats, latest posts, index links, and stream links.
- Second pass removed residual card borders from stats, latest entries, index entries, and stream links.
- Verified desktop, mobile, and dark desktop screenshots. No horizontal overflow.
