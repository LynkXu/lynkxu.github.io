# Archive Page Design

## Page

`/blog`

## Job

高效率扫描所有文章，按年份和日期找到阅读对象。

## Content To Keep

- `getCollection('blog')`、`filterDrafts`、排序、草稿标记、文章链接。
- 文章标题、日期、首个 tag、年份目录、tag 入口。

## Layout

- 主区为无卡片 ledger：年份在左，文章行在右。
- 每篇文章一行：`MM.DD / title / primary tag`。
- 不展示摘要，保持归档密度。
- 右侧 context 只放总数、主题数、年份锚点和前若干 tag。

## Acceptance

- 长中英文标题可换行，不挤压日期和 tag。
- 年份锚点醒目但不比文章标题重。
- 不出现大外框卡片或彩色 tag 云。

## Final Review

- Implemented as a year/date/title/tag ledger with no summaries.
- Right context keeps tags, counts, and year anchors only.
- Verified desktop, mobile, and dark desktop screenshots. No horizontal overflow or card background remains.
