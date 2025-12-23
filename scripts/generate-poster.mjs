/**
 * 基于本地活动数据生成年度热力图 SVG
 * 不调用 Strava API，直接使用已同步的 activities.min.json
 * 包含所有运动类型（骑行、跑步等）
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ACTIVITIES_PATH = path.join(ROOT, 'src/data/strava/activities.min.json');
const OUTPUT_PATH = path.join(ROOT, 'public/strava-poster.svg');

// 配置 - 极简布局
const CONFIG = {
  year: new Date().getFullYear(),
  colors: {
    background: 'transparent',
    text: '#999999',
    empty: '#e0e0e0',
    // 热力图颜色梯度 - Strava 橙色系
    levels: [
      { min: 0, max: 5, color: '#ffcdb2' },
      { min: 5, max: 15, color: '#ffb088' },
      { min: 15, max: 25, color: '#ff8c5a' },
      { min: 25, max: 40, color: '#fc6a28' },
      { min: 40, max: Infinity, color: '#e54d00' },
    ],
  },
  // SVG 尺寸 - 极简
  cellSize: 2.0,
  cellGap: 0.5,
  padding: { top: 1, right: 1, bottom: 1, left: 1 },
  monthLabelHeight: 4,
};

function getColor(distanceKm) {
  if (!distanceKm || distanceKm <= 0) return CONFIG.colors.empty;
  for (const level of CONFIG.colors.levels) {
    if (distanceKm >= level.min && distanceKm < level.max) {
      return level.color;
    }
  }
  return CONFIG.colors.levels[CONFIG.colors.levels.length - 1].color;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 判断是否为有效的运动类型（骑行或跑步）
function isValidActivity(act) {
  const type = (act.sport_type || act.type || '').toString();
  const runTypes = ['Run', 'TrailRun', 'VirtualRun', 'Treadmill'];
  const rideTypes = ['Ride', 'VirtualRide', 'EBikeRide', 'GravelRide'];
  return runTypes.includes(type) || rideTypes.includes(type);
}

async function main() {
  const year = CONFIG.year;

  // 读取活动数据
  let activities = [];
  try {
    const data = await fs.readFile(ACTIVITIES_PATH, 'utf8');
    activities = JSON.parse(data);
  } catch {
    console.log('No activities data found, generating empty poster');
  }

  // 按日期聚合距离 (只统计当前年份，包含骑行和跑步)
  const dailyDistance = new Map();
  const dailyTypes = new Map(); // 记录每天的运动类型
  let rideKm = 0;
  let runKm = 0;

  for (const act of activities) {
    if (!isValidActivity(act)) continue;

    const dateStr = (act.start_date_local || act.start_date || '').slice(0, 10);
    if (!dateStr.startsWith(String(year))) continue;

    const km = (act.distance_m || 0) / 1000;
    dailyDistance.set(dateStr, (dailyDistance.get(dateStr) || 0) + km);

    // 统计类型和距离
    const type = (act.sport_type || act.type || '').toString();
    const isRun = ['Run', 'TrailRun', 'VirtualRun', 'Treadmill'].includes(type);
    if (isRun) {
      runKm += km;
    } else {
      rideKm += km;
    }

    // 记录类型用于 tooltip
    const types = dailyTypes.get(dateStr) || new Set();
    types.add(isRun ? 'run' : 'ride');
    dailyTypes.set(dateStr, types);
  }

  // 计算总距离
  const totalKm = rideKm + runKm;

  // 生成日期网格 (只包含当前年份)
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // 找到第一周的起始位置 (周一开始)
  const firstDayOfWeek = startDate.getDay();
  const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const cells = [];
  const monthLabels = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const { cellSize, cellGap, padding, monthLabelHeight } = CONFIG;
  const startX = padding.left;
  const startY = padding.top + monthLabelHeight;

  let currentDate = new Date(startDate);
  let lastMonth = -1;
  let maxCol = 0;

  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    const dayOfWeek = currentDate.getDay();
    const rowIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const dayOfYear = Math.floor((currentDate - startDate) / 86400000);
    const colIndex = Math.floor((dayOfYear + mondayOffset) / 7);
    maxCol = Math.max(maxCol, colIndex);

    const x = startX + colIndex * (cellSize + cellGap);
    const y = startY + rowIndex * (cellSize + cellGap);

    const km = dailyDistance.get(dateStr) || 0;
    const color = getColor(km);
    const types = dailyTypes.get(dateStr);
    const typeStr = types ? ` (${[...types].join('+')})` : '';
    const title = km > 0 ? `${dateStr} ${km.toFixed(1)}km${typeStr}` : dateStr;

    cells.push({ x, y, color, title });

    // 月份标签
    const month = currentDate.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ x, label: monthNames[month] });
      lastMonth = month;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 计算 SVG 尺寸
  const gridWidth = (maxCol + 1) * (cellSize + cellGap) - cellGap;
  const gridHeight = 7 * (cellSize + cellGap) - cellGap;
  const width = padding.left + gridWidth + padding.right;
  const height = padding.top + monthLabelHeight + gridHeight + padding.bottom;

  // 生成 SVG
  const svg = generateSVG(cells, monthLabels, { rideKm, runKm }, year, width, height, padding.top + monthLabelHeight - 1);

  await fs.writeFile(OUTPUT_PATH, svg, 'utf8');
  console.log(`Generated poster for ${year}: ${OUTPUT_PATH}`);
  console.log(`Ride: ${rideKm.toFixed(1)} km | Run: ${runKm.toFixed(1)} km`);
  console.log(`Days with activities: ${dailyDistance.size}`);
  console.log(`SVG size: ${width.toFixed(0)}x${height.toFixed(0)}`);
}

function generateSVG(cells, monthLabels, stats, year, width, height, monthLabelY) {
  const { cellSize, colors, padding } = CONFIG;

  let svg = `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 ${width.toFixed(1)} ${height.toFixed(1)}" xmlns="http://www.w3.org/2000/svg">
<rect fill="${colors.background}" width="100%" height="100%"/>
`;

  // 月份标签
  for (const { x, label } of monthLabels) {
    svg += `<text fill="${colors.text}" font-size="1.8" font-family="Arial" x="${x}" y="${monthLabelY}">${label}</text>\n`;
  }

  // 日期格子
  for (const { x, y, color, title } of cells) {
    svg += `<rect fill="${color}" width="${cellSize}" height="${cellSize}" x="${x}" y="${y}" rx="0.4"><title>${title}</title></rect>\n`;
  }

  svg += '</svg>';
  return svg;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
