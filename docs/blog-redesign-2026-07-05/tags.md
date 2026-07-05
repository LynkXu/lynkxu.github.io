# Tags Design

## Pages

`/tags` and `/tags/[tag]`

## Job

提供按主题进入文章的轻量索引。

## Content To Keep

- 所有 tag、计数、每个 tag 最新文章、tag 下文章列表。
- `CategoryFilter` 的切换入口。

## Layout

- `/tags` 使用紧凑文字索引，不做 masonry 彩色卡片。
- 每个主题条目显示 tag 名、数量、最新文章和日期。
- `/tags/[tag]` 使用同归档一致的 ledger 行。
- 标签切换区是右侧/顶部辅助信息，不压过文章列表。

## Acceptance

- tag 页面和归档页属于同一视觉语言。
- 不出现浮动卡片墙、动画入场或大色块。
- 移动端仍能快速扫读 tag 和文章标题。

## Final Review

- `/tags` was refactored from a card wall to a line-based topic index.
- `/tags/[tag]` now follows the archive ledger pattern with a lightweight tag switcher.
- Second pass removed residual mobile topic box borders; each topic now uses only a bottom rule.
- Verified desktop, mobile, and dark desktop screenshots. No horizontal overflow.
