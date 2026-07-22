# 健身数据页面可行性与设计草案

日期：2026-07-23

## 结论

可以做，而且很适合接在当前 `/sports` 专题页之后。但建议不要把它做成另一个训练 App，而是做成博客里的“健身账本”：低噪音、可回看、可解释，重点展示训练频率、训练量、动作进步和阶段变化。

推荐方案是：

- `/sports` 保持跑步 / 骑行，继续由 Strava 驱动。
- 新增一个同级 tab，例如「力量」或「健身」，数据优先来自 Hevy API。
- 构建时同步 Hevy 数据到 `src/data/hevy/*.json`，页面只消费脱敏后的本地 JSON。
- 如果 Hevy API 不稳定或暂时不可用，保留 CSV / 手动 JSON 导入作为后备。

## 当前 sports 页面风格观察

相关文件：

- `src/content/page/sports.mdx`
- `src/layouts/Sports.astro`
- `src/components/Tabs.astro`
- `src/components/YearlyStatGrid.astro`
- `src/components/StatCard.astro`
- `src/components/SportsBarChart.astro`
- `scripts/strava-sync.mjs`

当前页面已经形成了比较完整的专题页语法：

- 使用 `Sports` layout，隐藏常规 header，改用 `SimpleHeader`，页面宽度放宽到 `max-width: 1400px`。
- 内容主体仍然是纸面阅读气质，不是强产品化 dashboard。
- 顶部用 `Tabs` 在「跑步」「骑行」之间切换，并在右侧放 Strava 外链。
- 每个运动类型先展示 4 张关键指标卡，再展示月度柱状图、可视化模块和记录列表。
- 卡片使用 `var(--paper-card-bg)`、细边框、轻阴影、低饱和绿色系 accent。
- 图表密度偏紧凑，适合长期回看，不追求大屏炫技。
- 表格在桌面端是紧凑横向列表，移动端折叠成更像记录条目的形式。

健身页应该沿用这套结构：顶部 tab、关键指标卡、月度趋势、动作/肌群维度模块、最近训练记录。不要引入独立字体、大圆角浮层、高饱和健身品牌色或大面积黑色运动 App 风格。

## 数据来源可行性

### Strava

当前项目已经有 Strava 同步脚本：

- OAuth refresh token 换 access token。
- 拉取 `/athlete/activities`。
- 拉取 athlete stats。
- 对新增活动按需拉 activity detail。
- 本地缓存到 `src/data/strava/activities.min.json`。
- 汇总生成 `src/data/sports-stats.json`。

这说明项目的数据管线已经适合继续扩展。Strava 仍然适合：

- 跑步、骑行、徒步等耐力项目。
- 年/月里程、时间、次数、配速、速度、路线、赛事表现。
- 有氧训练与力量训练之间的整体训练分布。

但 Strava 不适合作为力量训练主数据源。它可以记录 `WeightTraining` 等运动类型，而且 2026 年 5 月 Strava changelog 提到上传侧开始支持 FIT set data 和 weight training JSON 上传；这更偏“把力量训练上传到 Strava”，不等于能稳定读出 Hevy 那种动作、组数、重量、次数、RPE、动作历史等细粒度训练日志。对于博客健身页，Strava 最多作为补充：展示“力量训练作为一种活动出现了多少次、花了多少时间”。

### Hevy API

Hevy 当前有公开 API 文档，能力覆盖健身页最需要的核心数据：

- `GET /v1/workouts`：分页获取训练记录。
- `GET /v1/workouts/count`：训练总数。
- `GET /v1/workouts/events`：获取某个日期后的更新 / 删除事件，适合增量同步。
- `GET /v1/workouts/{workoutId}`：获取单次训练完整细节。
- `GET /v1/exercise_templates`：动作模板。
- `GET /v1/exercise_history/{exerciseTemplateId}`：单个动作历史。
- `GET /v1/body_measurements`：身体围度 / 体重等测量数据。
- `GET /v1/routines`：训练计划模板。

限制也比较明确：

- API 文档标注为早期版本，结构未来可能改变，甚至可能被废弃。
- API 目前仅 Hevy Pro 用户可用。
- 鉴权方式是 API key，不是 OAuth；更适合个人站点的构建时同步，不适合公开网页运行时请求。
- 不应该把原始训练 note、图片、个人体测详情直接暴露在前端。

结论：Hevy API 可用，但应该做成“个人静态站构建数据源”，不要做成浏览器端直接调用。

### Hevy CSV / 手动导入

Hevy 帮助文档确认 App 内存在导入导出入口，第三方 dashboard 也普遍通过 Hevy CSV export 做可视化。这个方式适合作为兜底：

- 不依赖 Pro API。
- 不需要把 API key 放进 CI。
- 适合偶尔手动更新。

缺点是：

- 自动化弱。
- 删除 / 更新同步不如 `/workouts/events` 清晰。
- CSV 字段随导出版本变化时需要 parser 兼容。

如果先做低风险版本，可以先设计数据 schema 和页面组件，再用手动 JSON 或 CSV 生成同样的 `fitness-stats.json`。后续接 Hevy API 时只替换同步层。

## 推荐数据管线

新增脚本：

```text
scripts/hevy-sync.mjs
```

新增数据文件：

```text
src/data/hevy/workouts.min.json
src/data/hevy/state.json
src/data/fitness-stats.json
```

环境变量：

```text
HEVY_API_KEY
HEVY_INITIAL_AFTER
```

同步流程：

1. 读取 `src/data/hevy/state.json`，拿到上次同步时间。
2. 首次同步用 `GET /v1/workouts` 分页拉全量。
3. 后续同步用 `GET /v1/workouts/events?since=...` 拉更新和删除。
4. 把 workout 压缩为页面需要的最小字段：日期、标题、时长、动作、组、重量、次数、肌群、体测等。
5. 生成聚合后的 `src/data/fitness-stats.json`。
6. 页面只 import 聚合数据和必要的最小 workout 列表。

不要把 API key、原始 notes、媒体 URL、精确体测隐私字段打进前端 bundle。

## 页面信息架构

建议把 `/sports` 改成三个 tab：

- 跑步
- 骑行
- 力量

如果担心页面名称变窄，也可以保持 `/sports` 不变，因为「运动主页」已经能包住力量训练。单独新增 `/fitness` 也可行，但会让运动数据分散，且当前组件体系已经明显围绕 sports 专题页成型。

「力量」tab 的结构：

1. 关键指标卡
2. 月度训练趋势
3. 肌群 / 动作分布
4. 重点动作进步
5. 最近训练记录

## 指标设计

首屏 4 张指标卡建议：

- 训练次数：累计或今年训练次数。
- 总训练时长：小时。
- 总训练量：volume，按 `weight * reps` 聚合；自重动作单独标注不纳入或折算。
- 活跃周数 / 最近连续性：例如最近 12 周训练了几周，比 streak 更克制。

第二层指标：

- 月度训练次数。
- 月度训练量。
- 每周训练日分布。
- 肌群占比：胸 / 背 / 腿 / 肩 / 手臂 / 核心。
- 动作 Top N：按训练量、组数或出现次数。
- 重点动作趋势：深蹲、硬拉、卧推、划船、肩推等。

不建议首版做：

- 1RM 强推断，除非 Hevy API 明确提供或数据质量足够稳定。
- 体脂 / 体重公开趋势，除非用户明确愿意展示。
- 每组完整明细全量展开，页面会太像日志后台。

## 视觉设计方向

整体延续 sports 页面：

- 继续使用 `StatCard` / `StatGrid` 的纸感卡片。
- 继续使用 `modules-stack`、`module-card`、`module-header`、紧凑图表。
- accent 可以从当前运动绿稍微偏向低饱和蓝绿或墨青，但不要换成健身 App 常见的高饱和红、荧光绿或黑金。
- 图表使用同一套 SVG 图表组件，优先扩展 `SportsBarChart` 的单位和 summary 文案。
- 记录列表沿用 race table 的密度，但列改为：日期、训练、动作数、组数、训练量、时长。

桌面草图：

```text
Sports
运动记录

[ 跑步 ] [ 骑行 ] [ 力量 ]                         Hevy / Strava badge

[训练次数] [总时长] [总训练量] [活跃周数]

┌ 月度训练 ─────────────── [2026] [2025] [全部] ┐
│ 次数 / volume 柱状图                          │
└───────────────────────────────────────────────┘

┌ 分布 ───────────────┬ 重点动作趋势 ───────────┐
│ 肌群占比 / 动作 Top │ 卧推 / 深蹲 / 硬拉 tab   │
└─────────────────────┴─────────────────────────┘

┌ 最近训练 ─────────────────────────────────────┐
│ 2026-07-20  Push Day  6动作  18组  8,240kg  72m │
└───────────────────────────────────────────────┘
```

移动端：

- 顶部 tab 横向滚动。
- 4 张指标卡改为 2 列，极窄屏 1 列。
- 分布和动作趋势上下堆叠。
- 最近训练记录变成 compact row：标题第一行，日期 / 组数 / volume 第二行。

## 数据模型草案

`src/data/fitness-stats.json` 可以长这样：

```json
{
  "generatedAt": "2026-07-23T00:00:00.000Z",
  "source": "hevy",
  "strength": {
    "cards": {
      "totalWorkouts": { "label": "训练次数", "value": "128", "unit": "次", "subtext": "Hevy 记录" },
      "totalTime": { "label": "总时长", "value": "146.5", "unit": "h", "subtext": "在健身房的时间" },
      "totalVolume": { "label": "总训练量", "value": "486", "unit": "t", "subtext": "仅统计负重动作" },
      "activeWeeks": { "label": "活跃周数", "value": "32", "unit": "周", "subtext": "最近一年" }
    },
    "monthly": [
      { "month": "2026-07", "workouts": 12, "sets": 248, "volumeKg": 58240, "durationMin": 720 }
    ],
    "muscles": [
      { "label": "背", "sets": 420, "volumeKg": 120400 }
    ],
    "lifts": [
      {
        "id": "bench-press",
        "name": "Bench Press",
        "bestSet": "80kg × 5",
        "history": [
          { "date": "2026-07-01", "estimated1rmKg": 93.3, "volumeKg": 4800 }
        ]
      }
    ],
    "recentWorkouts": [
      {
        "date": "2026-07-20",
        "title": "Push Day",
        "exerciseCount": 6,
        "setCount": 18,
        "volumeKg": 8240,
        "durationMin": 72
      }
    ]
  }
}
```

## 组件设计

可复用：

- `Tabs`
- `TabItem`
- `StatGrid`
- `StatCard`
- `SportsBarChart`
- `SportsLineChart`

建议新增：

- `StrengthStatGrid.astro`：类似 `YearlyStatGrid`，但面向力量训练。
- `StrengthDistributionChart.astro`：肌群 / 动作分布，可先用横向条形图，不必引入新图表库。
- `LiftProgressChart.astro`：重点动作趋势，复用 line chart 的设计语言。
- `WorkoutTable.astro`：最近训练记录列表。
- `HevyBadge.astro`：类似 `StravaBadge`，但文案用 `Data from Hevy` 或 `Logged in Hevy`，避免过强社交导流。

注意：`YearlyStatGrid.astro` 现在已经承担跑步、骑行、赛事、地图、趋势、表格多个职责。新增力量模块时不要继续把所有逻辑塞进去，最好拆出力量专用组件，保持边界清晰。

## 隐私与合规

推荐公开展示：

- 月 / 年聚合数据。
- 动作名称。
- 组数、次数、重量的聚合或最佳组。
- 最近训练标题和概览。

谨慎展示：

- 训练 note。
- 训练照片。
- 精确身体测量数据。
- 具体健身房位置或时间规律。

Strava 侧需要继续尊重授权、隐私设置和删除义务。Hevy 侧虽然是个人 API key，但也应该以同样标准处理：前端只放展示必要字段，原始缓存如含隐私内容则不进入公开仓库。

## 实施阶段建议

### Phase 1：静态 schema 与页面原型

先手写一份 `fitness-stats.json` 样例，做出「力量」tab 和组件。目标是验证页面结构、视觉密度和移动端表现。

### Phase 2：Hevy API 同步

新增 `scripts/hevy-sync.mjs`，实现全量同步、增量同步、删除事件处理和聚合生成。

### Phase 3：数据质量与隐私收敛

补上动作映射、肌群归类、自重动作处理、体测字段白名单、错误日志和数据缺失状态。

## 风险

- Hevy API 仍早期，字段结构可能变化。
- Hevy API 需要 Pro，长期可用性依赖订阅和产品策略。
- 力量训练数据比跑步复杂，volume、1RM、肌群归类都有解释成本。
- 如果把太多细节公开，页面会偏隐私暴露和后台感。
- 当前 `SportsStyles.astro` 似乎存在 `.empty-state` selector 缺失的小问题，后续实现时可以顺手修正，但不应和健身页设计混在一个大改里。

## 推荐决策

推荐做，但首版范围要小：

- 只做 `/sports` 的第三个 tab「力量」。
- 数据源优先 Hevy API，CSV / 手动 JSON 作为 fallback。
- 首版展示聚合指标、月度趋势、肌群分布、重点动作趋势、最近训练。
- 不展示完整逐组日志、不展示体测隐私、不做 1RM 强推断。

这样既能延续当前 sports 页面的专题数据气质，又不会把个人博客变成一个过重的健身 SaaS。

## 参考来源

- Strava API getting started: https://developers.strava.com/docs/getting-started/
- Strava authentication: https://developers.strava.com/docs/authentication/
- Strava rate limits: https://developers.strava.com/docs/rate-limits/
- Strava API policy 2026: https://www.strava.com/legal/api_policy
- Strava API changelog: https://developers.strava.com/docs/changelog/
- Hevy API docs: https://api.hevyapp.com/docs/
- Hevy import help: https://help.hevyapp.com/hc/en-us/articles/35687878672663-Tutorial-Log-Previous-Workouts-and-Import-CSV
