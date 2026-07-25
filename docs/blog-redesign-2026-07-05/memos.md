# Memos Page Design

## Page

`/shuoshuo`

## Job

把短记录排成安静时间线，像阅读笔记而不是社交 feed。

## Content To Keep

- 本地 gossips + Mastodon 合并、排序、分页。
- Markdown、媒体附件、LightGallery、LikeButton、草稿标记。
- 统计：总数、今年、月份、媒体、来源、月份分布。

## Layout

- 主区是垂直时间线。日期在左，正文在右。
- 去掉头像主导感，作者名只作为轻量 metadata。
- 每条 memo 用底部分割线，不用卡片阴影。
- 右侧 context 放 Snapshot、Months、Sources。

## Acceptance

- 页面第一感是时间记录，不是社交动态。
- 图片网格保持可点开，分页仍能隐藏/显示正确页。
- 移动端时间和内容不重叠。

## Final Review

- Converted memo cards into a full-width time ledger with date column and content column.
- Preserved local + Mastodon merge, pagination, media grid, LightGallery, draft markers, and likes.
- Second pass fixed the old `#shuoshuo` shrink-to-fit rule and explicitly placed memo body in the content column.
- Verified desktop, mobile, and dark desktop screenshots. No horizontal overflow.
