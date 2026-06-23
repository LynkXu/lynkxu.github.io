# 首页「舒展留白型」重构方案

## 目标
在不破坏克制、简约风格的前提下,给首页增加辨识度。落点 = **整体节奏与留白重构**(舒展留白型),不靠单点视觉锡点,靠呼吸节奏与重心编排让首页从其他页面中跳脱出来。

## 设计约束(已与用户确认)
- motto 文案保留:"Do the right thing. / Do things right."
- 右侧 profile-sidebar **不动**
- 5 个专题入口(Photography/Media/Travel/Sports/Tools)**可重新编排**
- 改动幅度:较大重塑(允许调整布局结构,但严守现有 token + 纸感语言)
- 严守 CLAUDE.md 风格基线:复用 spacing token、宽度 token、纸感卡片语法、字体系统;hover 位移 1–2px;动效 0.2–0.35s;兼容 prefers-reduced-motion;浅色/深色双主题成立

## 现状问题诊断
1. **开篇缺乏呼吸**:`home-statement` 的 motto 字号过小(`clamp(0.92rem, 1.45vw, 1.04rem)`,几乎和正文同级),且与下方 `home-board` 间距 (`clamp(var(--space-md), 2.8vw, var(--space-lg))` ≈ 16–24px)偏紧,开篇没有"停顿感"。
2. **视觉重心偏上**:motto 小 + 间距紧,导致页面一上来就进入信息密集区,首页和归档/标签页的"信息聚合页"气质同质,缺少首页应有的舒展开场。
3. **入口列表与 featured 同行挤占**:`home-board` 把 featured 大卡(左,占 1.18fr)和 5 入口列表(右,0.34fr)放在同一 grid 行,featured 卡被压窄,入口列表也局促。两者本应是不同层级(最新文章 vs 全站入口),强行并排削弱了 featured 的引导力。
4. **motto 的 `/` 分隔虽克制,但缺乏首页专属的开篇仪式感**。

## 重构方案(舒展留白型)

### 核心思路
把首页主区从「motto → 双栏(feat ​ured+入口)」改为三段式纵向呼吸结构:
**① 开篇 motto 区(适度放大 + 增加上方留白)→ ② Latest 区(featured 独占一行,更舒展)→ ③ Index 入口区(5 入口横向重新编排,成为收尾节奏)**

视觉重心从"顶部挤"变为"纵向三段呼吸",首页独有的开篇仪式感 + 收尾节奏自然建立辨识度。

### 具体改动

#### 改动 1:`home-statement` 开篇升级
- motto 字号从 `clamp(0.92rem, 1.45vw, 1.04rem)` → `clamp(1.15rem, 2.4vw, 1.45rem)`(适度放大,仍远小于文章页 h1 的 1.72–2.05rem,不抢戏)
- 上方增加显著留白:`padding-top: clamp(var(--space-xl), 5vw, var(--space-3xl))`(让 motto 从容器顶部下沉,建立开篇呼吸)
- 行高从 `1.4` → `1.32`(放大后略收紧,保持标题凝聚力,符合 `--lh-tight` 语义)
- 字重保持 `500`,颜色保持现有 `color-mix(heading 72%, gray)` 的柔和墨色
- `/` 分隔符保持现有克制处理(小字、faint 色)

#### 改动 2:`home-board` 从双栏改为纵向三段
- 删除现有 `grid-template-columns: minmax(0, 1fr) minmax(9.8rem, 0.34fr)` 双栏
- 改为 `display: flex; flex-direction: column`,三段纵向排列
- 段间距加大:`gap: clamp(var(--space-2xl), 5vw, var(--space-3xl))`(48–64px,建立区块呼吸)
- featured 卡从被压窄的 1.18fr 列解放出来,获得完整宽度

#### 改动 3:`home-latest__panel` featured 区舒展
- featured 卡(左)与 compact 列表(右)的内部双栏比例微调:从 `1.18fr / 0.82fr` → `1.35fr / 0.65fr`(featured 更舒展,compact 更紧凑)
- `min-height` 从 `clamp(20.5rem, 34vw, 23rem)` → `clamp(18rem, 30vw, 21rem)`(略降,因为现在独占宽度不再需要那么高)
- featured 卡内部 padding 适度加大,正文更呼吸

#### 改动 4:`home-entry-list`(Index 入口)重新编排
这是"较大重塑"的主要落点。现状是 5 个入口挤在右侧 0.34fr 窄列(每行一个,纵向堆叠)。重构为:
- **桌面**:featured 区下方独占一行,5 个入口改为**横向 5 列网格**(或 2+3 分行),每个入口卡片更扁、更宽,作为首页收尾的"全站导航带"
- 入口卡片视觉降级:比 featured 更轻(更小 padding、更弱边框),明确层级是"次级导航"而非"内容"
- **移动端**:回退为现有的纵向 / 2 列布局(保持移动端紧凑)

入口卡内部保持现有结构(英文 label + 中文 small),只改外层排布。

#### 改动 5:开篇 fade-up 动效微调
- 现有 `home-fade-up 0.55s` 保留
- motto 区与 board 区可做轻微错时入场(motto 先、board 后,0.1–0.15s 延迟),强化"开篇→展开"的纵向节奏感
- 严守 prefers-reduced-motion:reduce 下全部静态

### 涉及文件
- `src/pages/index.astro` — 主结构 + `<style>` 块(全部首页样式都在这里,集中改动)
- 不动:`MagazineShell.astro`、`Header.astro`、`style.scss`、右侧 profile-sidebar

### 风险与回退
- 风险点:入口列表从窄列改为横向 5 列,在中等宽度(760–1024px)可能显得拥挤 → 用 `@media (max-width: 1023px)` 回退为 2 列 / 纵向
- 回退:所有改动集中在 `index.astro` 单文件,`git checkout` 即可完全还原

### 完成后的强制视觉检查(CLAUDE.md §3)
- [ ] 启动 dev server,桌面视图检查首页
- [ ] 移动端视图检查(布局/字号/换行都变了,必查)
- [ ] 浅色 + 深色双主题检查
- [ ] 字体一致性:正文/标题/元信息/代码仍各归其位
- [ ] 字号一致性:无忽大忽小
- [ ] 宽度合理性:featured 卡行长不失控
- [ ] 间距一致性:三段节奏统一,无异常拥挤/松散
- [ ] 卡片一致性:边框/阴影/圆角/hover 仍属纸感体系
- [ ] prefers-reduced-motion 下动效关闭

## 待确认
方案是否 OK,确认后开始实施。
