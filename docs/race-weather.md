# 比赛天气查询约定

Sports 页比赛天气统一使用 Open-Meteo Historical Weather API，显式固定 `ecmwf_ifs` 模型，不使用默认 Best Match，也不混用天气聚合页、预报和气象站实测。

## 下次查询

在项目根目录运行（需要 Node.js 20+ 和网络，不需要 API key）：

```sh
npm run query:race-weather -- 2026-11-01 30.27 120.15
```

三个参数依次为比赛日期、纬度、经度，取自 `src/data/races.json` 中对应赛事的 `date`、`lat`、`lng`。脚本只输出查询结果，不写文件、不加入构建或定时任务。

其他已有比赛的复查命令：

```sh
npm run query:race-weather -- 2026-03-22 30.63 120.55
npm run query:race-weather -- 2026-03-28 31.23 121.47
```

## 固定查询口径

| 参数 | 固定规则 |
| --- | --- |
| 接口 | `https://archive-api.open-meteo.com/v1/archive` |
| `latitude` / `longitude` | 使用该赛事所在城市的既有坐标，保留经纬度顺序 |
| `start_date` / `end_date` | 均为该比赛日期，查询单日 |
| `timezone` | `Asia/Shanghai`，按北京时间划分全天 |
| `models` | `ecmwf_ifs`，显式固定模型 |
| `daily` | `temperature_2m_max,temperature_2m_min,weather_code` |

这是 ECMWF IFS 城市网格历史估算，不是赛道或气象站实测。`low` / `high` 为全天 2 米空气温度的最低值和最高值；天气代码代表当天最显著的天气，不代表开赛时或整个比赛期间的天气。上午晴、夜间雨时，全天图标仍可能显示雨。

当前约定适用于国内赛事。遇到海外赛事，应先明确使用当地时区并调整查询与校验，不可直接把北京时间口径套过去。遇到未完赛、未来日期或缺失数据，不使用预报替代历史数据。

## 写入赛事记录

1. 确认返回日期与比赛日期一致、时区为北京时间、摄氏度单位正确、最低温不高于最高温且数据非空。脚本会自动校验这些项目，失败时退出且不输出可用记录。
2. 将输出的 `low`、`high`、`weatherCode`、`model`、`timezone`、`verifiedOn`、`source` 填入该赛事的 `weather`。外层 `date`、`latitude`、`longitude` 是复查上下文，不复制进 `weather`。
3. 按官方 WMO 代码表填写 `condition` 和 `icon`。当前已使用的映射如下：

   | `weatherCode` | `condition` | `icon` |
   | --- | --- | --- |
   | 3 | 阴 | `cloud` |
   | 53 | 毛毛雨 | `rain` |
   | 55 | 较强毛毛雨 | `rain` |

   当前组件仅绘制云和雨。遇到其他代码，先查官方码表；晴、雾、雪、雷暴等需补充准确的图标支持，不能一律当作阴或雨。
4. 数据保留原始小数精度，页面通过 `Math.round()` 显示整数。保留完整 `source` 查询链接及北京时间的查询日期 `verifiedOn`；它表示核对来源的日期，不表示实测认证。
5. 已有记录保留为静态快照。只在主动复查时更新，检查差异，不在每次构建时自动重新查询。上游补齐或修订历史数据时，同一查询可能返回不同结果。
6. 修改数据或图标后，按 `AGENTS.md` 检查 Sports 页的桌面、手机及浅深色主题，再运行 `npx astro build`。

脚本检查：

```sh
node --test scripts/race-weather.test.mjs
```

## 来源

- [Open-Meteo Historical Weather API：来源、模型、每日参数与 WMO 代码表](https://open-meteo.com/en/docs/historical-weather-api)
- 单场比赛的完整请求链接保存在 `src/data/races.json` 的 `weather.source` 中。
