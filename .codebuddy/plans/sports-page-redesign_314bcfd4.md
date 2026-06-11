---
name: sports-page-redesign
overview: 重构 /sports 运动记录页面：移除热力图，新增月度跑量/骑行折线图、马拉松成绩趋势折线图、比赛地图标记；保留顶部统计卡片；基于 main 新建分支开发。
design:
  styleKeywords:
    - 纸面阅读
    - 克制留白
    - 数据可视化
    - 低饱和
    - 细线网格
  fontSystem:
    fontFamily: var(--serif-font)
    heading:
      size: 1.2rem
      weight: 700
    subheading:
      size: 1rem
      weight: 600
    body:
      size: 0.9rem
      weight: 400
  colorSystem:
    primary:
      - var(--accent-color)
    background:
      - var(--page-bg)
      - var(--code-background-color)
    text:
      - var(--heading-color)
      - var(--text-color)
      - var(--gray-color)
    functional:
      - rgba(0,0,0,0.12)
      - rgba(255,255,255,0.15)
todos:
  - id: remove-strava
    content: 删除 sports.mdx 中的 Strava 热力图卡片及 SportsStyles.astro 中的相关样式
    status: completed
  - id: prepare-data
    content: 在 races.json 中补充比赛坐标 lat/lng 字段，并确认 sports-stats.json 月度数据结构满足图表需求
    status: completed
  - id: create-linechart
    content: 使用 [skill:impeccable] 创建 SportsLineChart.astro 通用 SVG 折线图组件，支持坐标轴、网格、tooltip、主题适配和入场动画
    status: completed
  - id: create-racemap
    content: 使用 [skill:impeccable] 创建 RaceMap.astro 组件，复用 Leaflet + CartoDB 实现比赛地点标记与交互
    status: completed
    dependencies:
      - prepare-data
  - id: integrate-components
    content: 重构 YearlyStatGrid.astro，整合折线图和地图，实现年份切换联动；在 Sports.astro 中引入 Leaflet CDN
    status: completed
    dependencies:
      - create-linechart
      - create-racemap
  - id: responsive-animate
    content: 使用 [skill:adapt] 和 [skill:animate] 优化移动端布局、图表响应式适配及动画细节
    status: completed
    dependencies:
      - integrate-components
  - id: visual-check
    content: 启动本地预览，检查桌面/移动端视图及深浅色主题下的实际渲染效果
    status: completed
    dependencies:
      - responsive-animate
---

## Product Overview

优化博客的 /sports 运动记录二级页面，将现有的纯表格数据展示升级为包含折线图可视化、地图标记的 richer 数据展示页，同时保持项目克制的纸感设计风格。

## Core Features

- 移除顶部 Strava 年度热力图卡片
- 保留并优化顶部的跑量/时长/PB 统计卡片
- 为跑步和骑行分别增加月度数据折线图（距离趋势）
- 为跑步增加马拉松完赛成绩趋势折线图
- 为跑步增加比赛地图标记（类似 /travel 页面的 Leaflet 地图）
- 年份切换器联动控制所有可视化组件
- 保持深浅色主题兼容性
- 基于 main 分支新建分支开发

## Tech Stack

- 框架: Astro 5.x（现有）
- 样式: SCSS + CSS Variables（现有设计 token）
- 地图: Leaflet + CartoDB Positron（复用 /travel 方案，CDN 引入）
- 图表: 纯 SVG + 原生 JavaScript（零依赖，契合项目克制气质）

## Implementation Approach

### 图表方案选择

放弃引入 ECharts/Chart.js 等重型图表库，采用**纯 SVG 手写折线图**。理由：

1. 数据量极小（月度最多 12 个点，比赛记录目前仅 2 条），重型库性价比极低
2. 完全控制样式，可完美匹配项目"纸面阅读、低饱和、克制"的视觉气质
3. 零额外依赖，不增加页面负载
4. 通过 `stroke-dashoffset` 动画实现优雅的绘制动效

折线图功能包括：响应式 viewBox、坐标轴与网格线、数据点 hover tooltip、入场路径动画、CSS variable 主题色适配。

### 地图方案

直接复用 `/travel` 页面的 Leaflet + CartoDB 底图技术栈。通过 CDN 在 `Sports.astro` 布局的 `<slot name="head" />` 中引入 Leaflet CSS/JS。

- 地图容器高度约 400px，宽度跟随内容区
- 只展示已完成且带有坐标（lat/lng）的比赛
- 标记点击弹出比赛信息（名称、日期、成绩）
- 比赛卡片 hover/click 可与地图 flyTo 交互

### 数据方案

保持现有 JSON 数据格式，在 `races.json` 中补充 `lat` / `lng` 字段。不迁移到 Content Collection，理由：

1. 纯结构化数据，无长文本内容
2. 便于后续从 Strava API 等脚本同步
3. 修改成本最低，与 `sports-stats.json` 保持一致

### 组件拆分

- `SportsLineChart.astro`：通用 SVG 折线图组件，通过 `define:vars` 接收数据，IIFE 隔离渲染逻辑
- `RaceMap.astro`：Leaflet 地图组件，接收过滤后的比赛数据
- `YearlyStatGrid.astro`：整合统计卡片、折线图、地图、比赛卡片、月度表格的年份切换容器

### 年份切换联动

现有的年份切换 script 通过切换 `.detail-group.active` 控制内容显示。折线图和地图容器置于对应的 `.detail-group` 内部，随年份切换自然显示/隐藏。所有图表在初始时预渲染，通过 CSS display 切换，避免切换时的空白闪烁。

### 性能与可靠性

- SVG 图表预渲染，切换年份无重绘开销
- Leaflet 地图仅在跑步 Tab 且存在坐标数据时初始化
- 所有新增 script 兼容 `prefers-reduced-motion`
- 主题切换监听：通过 MutationObserver 监听 `data-theme` 变化，动态更新 SVG 颜色

## Architecture Design

### 页面结构（跑步 Tab）

```
SimpleHeader
└── Sports Layout (max-width: 1400px)
    └── Tabs
        └── TabItem: 跑步
            └── YearlyStatGrid
                ├── 年份切换器
                ├── StatGrid (跑量/时长/半马PB/全马PB)
                ├── detail-group[data-year="2026"] (active)
                │   ├── SportsLineChart: 月度跑量折线
                │   ├── RaceMap: 比赛地图 (如有坐标)
                │   ├── SportsLineChart: 马拉松成绩趋势
                │   ├── 比赛记录卡片网格
                │   └── 月度数据表格
                ├── detail-group[data-year="2025"]
                │   └── ... (同上)
                └── detail-group[data-year="total"]
                    └── ... (同上)
```

### 数据流

races.json (含 lat/lng) → YearlyStatGrid (Astro 编译时过滤/分组) → 通过 define:vars 注入客户端 script → SportsLineChart / RaceMap 渲染

## Directory Structure

```
project-root/
├── src/
│   ├── components/
│   │   ├── SportsLineChart.astro   # [NEW] 通用 SVG 折线图组件。接收数据数组、Y轴标签、单位、颜色等配置，渲染响应式 SVG 折线图，含坐标轴、网格、数据点、hover tooltip、路径绘制动画。
│   │   ├── RaceMap.astro           # [NEW] 比赛地图组件。接收 races 数组，初始化 Leaflet 地图（复用 CartoDB 底图），添加比赛标记与弹出信息，支持卡片与地图的交互联动。
│   │   ├── YearlyStatGrid.astro    # [MODIFY] 重构现有组件。整合 SportsLineChart 和 RaceMap，在 detail-group 内新增图表和地图区块；年份切换脚本保持现有逻辑。
│   │   └── SportsStyles.astro      # [MODIFY] 删除 Strava 卡片相关样式，新增 SVG 折线图样式（坐标轴、网格、tooltip、动画、主题适配）和地图容器样式。
│   ├── layouts/
│   │   └── Sports.astro            # [MODIFY] 在 Base 的 head slot 中引入 Leaflet CDN（CSS + JS），供 RaceMap 组件使用。
│   ├── content/
│   │   └── page/
│   │       └── sports.mdx          # [MODIFY] 删除 Strava 热力图卡片（strava-card 区块），保留 Tabs 和 YearlyStatGrid 引用。
│   └── data/
│       └── races.json              # [MODIFY] 用户补充各比赛记录的 lat / lng 字段（示例数据先由开发者填入，后续用户可自行维护）。
```

## Key Code Structures

### SVG 折线图核心渲染接口

```typescript
interface LineChartDataPoint {
  x: string;   // 标签，如 "2026-01" 或 "2026-03-22"
  y: number;   // 数值，如 83.83（km）或 6862（秒）
}

interface LineChartConfig {
  yLabel: string;      // Y轴单位，如 "km" 或 "时间"
  yFormatter: (v: number) => string;  // Y轴格式化函数，如 (s) => "01:54:22"
  color?: string;      // 线条颜色，默认使用 --accent-color
  animate?: boolean;   // 是否启用绘制动画
}
```

### races.json 扩展字段

```
{
  "lat": 30.7484,
  "lng": 120.7402
}
```

## 设计方向

延续项目"可知、理性、简约"的品牌气质，所有新增可视化模块必须服从现有纸感设计语言。

### 折线图设计

- 线条：使用 `var(--accent-color)` 或低饱和墨色，线宽 2px，端点使用 4px 空心圆（hover 时填充）
- 坐标轴：1px 细线，颜色使用 `rgba(var(--text-color), 0.15)`，刻度标签使用 `var(--gray-color)`，字号 0.75rem
- 网格线：仅保留水平虚线网格，极淡（opacity 0.08），不喧宾夺主
- Tooltip：纸感卡片样式，细边框、极轻阴影、4px 圆角，背景跟随 `--code-background-color`，不使用鲜艳色块
- 动画：路径绘制动画（stroke-dashoffset），时长 0.8s，缓动 ease-out
- 响应式：SVG 使用 viewBox + width: 100%，移动端保持可读的最小高度 200px

### 地图设计

- 容器：宽度跟随内容区（max-width 1400px 内全宽），高度 400px，圆角 8px，细边框
- 底图：复用 CartoDB Positron（浅色/深色均协调）
- 标记：Leaflet 默认标记或微调后的简约圆点标记
- 弹出卡片：与 travel 页面一致的轻量 popup 风格
- 与下方内容的过渡：使用与 travel 相同的渐变遮罩或直接以背景色分隔，避免生硬截断

### 整体布局节奏

- 统计卡片 → 折线图 → 地图 → 比赛卡片 → 表格，形成"总览 → 趋势 → 空间 → 详情 → 精确数据"的信息递进
- 各区块间距使用现有 token（`--space-2xl` ~ `--space-3xl`），保持呼吸感
- 年份切换器保持在统计卡片上方，作为页面一级控制

## Agent Extensions

### Skill

- **impeccable**
- Purpose: 在实现 SVG 折线图和地图交互时，确保视觉质量达到生产级标准，避免"AI 味"的通用样式，融入项目现有的纸感设计语言
- Expected outcome: 折线图的坐标轴、网格、tooltip、动画效果与项目整体风格高度统一，地图标记和弹出层视觉精致

- **adapt**
- Purpose: 确保新增的折线图和地图在移动端视图下正常显示，调整 SVG 尺寸、地图高度、布局堆叠等
- Expected outcome: 移动端下折线图不溢出、地图高度适配、布局从网格正确切换为堆叠

- **animate**
- Purpose: 为折线图添加优雅的路径绘制动画和数据点 hover 动效，为地图标记添加出现动画
- Expected outcome: 折线入场时有流畅的绘制感，数据点 hover 有轻量反馈，动画兼容 prefers-reduced-motion