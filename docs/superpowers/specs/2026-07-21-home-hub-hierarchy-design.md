# Home Hub Hierarchy Design

## Goal

让首页三块近况（最近文章 / 碎语 / 最近痕迹）保持**同类内容语法**，同时让「最近文章」权重更高。

## Decision

采用「一张纸 + 节奏分层」，不做：

- 嵌套 inset / 分卡片
- 主次拆到纸内 / 纸外两种容器

## Visual Direction

- 结构对齐归档页：单一 `postcard-sheet`，内部多段列表。
- 主次只靠：区块间距、标题字号/颜色、次要列表略紧略淡。
- 文章之后留白更大；碎语与痕迹彼此更近，读成一组次要近况。
- 内边距对齐归档板（约 `1–1.35rem`），避免首页纸面与全站纸面脱节。

## Structure

```
home-hub.postcard-sheet
├── hub-block--writing（主）
├── hub-block--notes（次）
└── hub-block--traces（次）
```

## Verification

- 桌面 / 移动，浅色 / 深色。
- 目测：三块仍是同一种列表，但文章区先被看见；无额外盒子。
