import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = path.resolve('docs/design-mockups');
const W = 1600;
const H = 1067;

const colors = {
  bg: '#fbfbfa',
  paper: '#fffefd',
  paper2: '#f7f8f7',
  ink: '#101314',
  softInk: '#263033',
  muted: '#68737d',
  faint: '#8d969d',
  rule: '#d9dddc',
  ruleSoft: '#e8ebea',
  green: '#17756b',
  green2: '#2c867a',
  greenDark: '#11564f',
  wash: '#f0f6f3',
  chip: '#edf5f2',
  amber: '#9b6a19',
};

const font = "'Avenir Next', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";
const serif = "Georgia, 'Songti SC', 'Noto Serif CJK SC', serif";

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgRoot(title, body, active = 'Archive') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#111827" flood-opacity="0.045"/>
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#111827" flood-opacity="0.035"/>
    </filter>
    <filter id="tinyShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#111827" flood-opacity="0.055"/>
    </filter>
    <linearGradient id="greenPanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#176c62"/>
      <stop offset="1" stop-color="#0f4f49"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${colors.bg}"/>
  ${header(active)}
  ${body}
  <text x="${W / 2}" y="${H - 42}" text-anchor="middle" font-family="${font}" font-size="15" fill="${colors.muted}">© 2020 - 2026 LynkXu · Powered by Astro · Design by Lynk</text>
</svg>`;
}

function header(active) {
  const nav = [
    ['Archive', 605],
    ['Memos', 715],
    ['Leaves', 826],
    ['About', 934],
    ['RSS', 1027],
  ];
  const navItems = nav.map(([label, x]) => {
    const isActive = label === active;
    return `
      <text x="${x}" y="43" text-anchor="middle" font-family="${font}" font-size="17" font-weight="${isActive ? 600 : 500}" fill="${isActive ? colors.ink : '#151719'}">${label}</text>
      ${isActive ? `<rect x="${x - 29}" y="72" width="58" height="3.4" rx="1.7" fill="${colors.green}"/>` : ''}`;
  }).join('');

  return `
    <rect x="0" y="0" width="${W}" height="78" fill="${colors.paper}" opacity="0.96"/>
    <line x1="0" y1="78" x2="${W}" y2="78" stroke="${colors.rule}"/>
    <text x="74" y="45" font-family="${font}" font-size="27" font-weight="800" fill="${colors.green}">LynkXu</text>
    <text x="178" y="45" font-family="${font}" font-size="26" font-weight="700" fill="${colors.ink}">/ Blog</text>
    ${navItems}
    <rect x="1338" y="20" width="188" height="39" rx="19.5" fill="${colors.paper}" stroke="${colors.rule}"/>
    <circle cx="1364" cy="39" r="8" fill="none" stroke="${colors.softInk}" stroke-width="1.8"/>
    <line x1="1370" y1="45" x2="1376" y2="51" stroke="${colors.softInk}" stroke-width="1.8" stroke-linecap="round"/>
    <text x="1388" y="44" font-family="${font}" font-size="16" fill="${colors.muted}">Search ⌘K</text>
  `;
}

function rect(x, y, w, h, options = {}) {
  const {
    fill = colors.paper,
    stroke = colors.rule,
    rx = 8,
    filter = 'url(#tinyShadow)',
    opacity = 1,
  } = options;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" opacity="${opacity}" filter="${filter}"/>`;
}

function labelText(x, y, text, color = colors.green) {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="16" font-weight="800" fill="${color}" letter-spacing="0.03em">${esc(text)}</text>
  <rect x="${x}" y="${y + 10}" width="45" height="3" rx="1.5" fill="${color}"/>`;
}

function text(x, y, value, size = 16, fill = colors.ink, weight = 500, extra = '') {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(value)}</text>`;
}

function serifText(x, y, value, size = 16, fill = colors.ink, weight = 500) {
  return `<text x="${x}" y="${y}" font-family="${serif}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`;
}

function para(x, y, lines, size = 16, line = 28, fill = colors.muted, weight = 400) {
  return lines.map((lineText, i) => text(x, y + i * line, lineText, size, fill, weight)).join('');
}

function chip(x, y, value, w = 64, fill = colors.chip, color = colors.green) {
  return `<rect x="${x}" y="${y}" width="${w}" height="27" rx="6" fill="${fill}"/>
  <text x="${x + w / 2}" y="${y + 18}" text-anchor="middle" font-family="${font}" font-size="13" font-weight="700" fill="${color}">${esc(value)}</text>`;
}

function stat(x, y, w, value, label) {
  return `${rect(x, y, w, 76, { fill: colors.paper, stroke: colors.ruleSoft, rx: 7, filter: 'none' })}
  ${text(x + 20, y + 32, value, 25, colors.green, 800)}
  ${text(x + 20, y + 57, label, 14, colors.ink, 600)}`;
}

function iconBox(x, y, symbol) {
  return `<rect x="${x}" y="${y}" width="42" height="42" rx="7" fill="${colors.paper}" stroke="${colors.ruleSoft}"/>
  <text x="${x + 21}" y="${y + 27}" text-anchor="middle" font-family="${font}" font-size="19" font-weight="700" fill="${colors.ink}">${esc(symbol)}</text>`;
}

function archivePage() {
  const rows = [
    ['2026', '05.31', '让 Agent 教我写 Agent', '关于 Agent 设计与实践的一些思考与记录。', 'AI'],
    ['', '03.01', '过年碎碎念', '一些琐事，感受与新年的小目标。', '生活'],
    ['', '01.19', '博客同步工作流', 'Hexo → GitHub → Cloudflare Pages 的自动化流程。', 'blog'],
    ['2025', '12.29', '2025 年终回顾', '运动、工作、阅读与生活的小结。', '年度'],
    ['', '09.18', '新工作与新的节奏', '一次职业切换之后的记录。', '工作'],
    ['', '02.14', '美国旅行记录', '签证、航班、城市漫游与一些照片。', '旅行'],
    ['2024', '09.14', '阶段性复盘', '把混乱的输入整理成稳定的输出。', '复盘'],
    ['2023', '09.06', 'Rust 学习笔记', '所有权、生命周期与工程实践摘录。', '技术'],
  ];
  let y = 230;
  const list = rows.map(([year, date, title, desc, tag], i) => {
    const top = y + i * 72;
    return `
      ${i ? `<line x1="118" y1="${top - 22}" x2="1012" y2="${top - 22}" stroke="${colors.ruleSoft}"/>` : ''}
      ${year ? text(118, top + 8, year, 27, colors.green, 850) : ''}
      ${text(238, top, date, 16, colors.green, 800)}
      <line x1="296" y1="${top - 25}" x2="296" y2="${top + 31}" stroke="${colors.rule}"/>
      ${text(336, top - 2, title, 20, colors.ink, 850)}
      ${text(336, top + 29, desc, 15, colors.muted, 500)}
      ${chip(908, top - 22, tag, tag.length > 3 ? 62 : 54)}
    `;
  }).join('');

  const body = `
    <g transform="translate(0,0)">
      ${rect(74, 114, 980, 832, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
      ${labelText(118, 150, 'ARTICLES')}
      ${text(118, 184, '18 entries, filed by year. Tags stay secondary.', 15, colors.muted, 600)}
      ${list}
      ${text(118, 910, 'Older entries →', 15, colors.green, 800)}

      ${rect(1090, 114, 364, 342, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
      ${labelText(1120, 148, 'TAGS')}
      ${para(1120, 198, ['辅助筛选，不抢走文章列表的注意力。'], 15, 25)}
      ${chip(1120, 246, 'AI', 62)}
      ${chip(1196, 246, 'blog', 72, '#f5f6f5', colors.softInk)}
      ${chip(1282, 246, '生活', 72, '#f5f6f5', colors.softInk)}
      ${chip(1368, 246, '年度', 62, '#f5f6f5', colors.softInk)}
      ${chip(1120, 290, '旅行', 72, '#f5f6f5', colors.softInk)}
      ${chip(1206, 290, '技术', 72, '#f5f6f5', colors.softInk)}
      ${chip(1292, 290, '复盘', 72, '#f5f6f5', colors.softInk)}
      <line x1="1120" y1="354" x2="1424" y2="354" stroke="${colors.ruleSoft}"/>
      ${text(1120, 397, '18', 30, colors.green, 850)}
      ${text(1170, 397, 'entries since 2021', 16, colors.ink, 700)}
      ${text(1120, 430, '14 topics, listed by latest update', 14, colors.muted, 600)}

      ${rect(1090, 488, 364, 458, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
      ${labelText(1120, 522, 'QUICK INDEX')}
      ${text(1120, 580, '2026', 22, colors.green, 850)}
      ${text(1212, 580, '3 entries', 15, colors.muted, 600)}
      ${text(1120, 630, '2025', 22, colors.green, 850)}
      ${text(1212, 630, '3 entries', 15, colors.muted, 600)}
      ${text(1120, 680, '2024', 22, colors.green, 850)}
      ${text(1212, 680, '1 entry', 15, colors.muted, 600)}
      ${text(1120, 730, '2023', 22, colors.green, 850)}
      ${text(1212, 730, '1 entry', 15, colors.muted, 600)}
    </g>
  `;
  return svgRoot('Archive', body, 'Archive');
}

function memoItem(x, y, h, tag, date, lines, hasMedia = false, width = 846) {
  const media = hasMedia ? `
    <rect x="${x + 92}" y="${y + h - 98}" width="124" height="72" rx="4" fill="#dce5e2" stroke="${colors.ruleSoft}"/>
    <rect x="${x + 226}" y="${y + h - 98}" width="124" height="72" rx="4" fill="#eef0ed" stroke="${colors.ruleSoft}"/>
    <rect x="${x + 360}" y="${y + h - 98}" width="124" height="72" rx="4" fill="#d2ded9" stroke="${colors.ruleSoft}"/>
  ` : '';
  return `
    ${rect(x, y, width, h, { fill: colors.paper, stroke: colors.ruleSoft, rx: 8, filter: 'none' })}
    <circle cx="${x + 38}" cy="${y + 39}" r="20" fill="#c9d8d3"/>
    ${text(x + 70, y + 34, 'LynkXu', 17, colors.ink, 800)}
    ${chip(x + 142, y + 14, tag, tag.length > 4 ? 88 : 64)}
    ${text(x + 70, y + 60, date, 13, colors.faint, 600)}
    ${para(x + 70, y + 96, lines, 16, 29, colors.softInk, 500)}
    ${media}
    <line x1="${x + 70}" y1="${y + h - 20}" x2="${x + width - 40}" y2="${y + h - 20}" stroke="${colors.ruleSoft}"/>
    ${text(x + 70, y + h + 6, 'Like · Share', 13, colors.faint, 600)}
  `;
}

function memosPage() {
  const body = `
    ${rect(74, 114, 980, 832, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(100, 150, 'TIMELINE')}
    ${text(100, 184, 'Short notes gathered by time. Filters stay secondary.', 15, colors.muted, 600)}
    ${memoItem(100, 228, 188, 'AI', '2026.01.03 · 22:48', ['最近把博客同步流程交给 Agent 之后，最明显的变化不是省时间，', '而是每次动手前会更认真地描述自己想要什么。'], false, 906)}
    ${memoItem(100, 442, 236, 'photo', '2025.12.08 · 19:26', ['傍晚的光很短，拍照时反而能更快判断要不要留下。', '有些画面不适合解释，只适合存档。'], true, 906)}
    ${rect(100, 704, 906, 82, { fill: colors.paper, stroke: colors.ruleSoft, rx: 8, filter: 'none' })}
    <circle cx="138" cy="744" r="20" fill="#c9d8d3"/>
    ${text(170, 740, 'LynkXu', 17, colors.ink, 800)}
    ${chip(242, 720, 'mastodon', 88)}
    ${text(170, 766, '2025.12.07 · 10:12', 13, colors.faint, 600)}
    ${text(408, 752, '把零碎的感受放回时间里，它们会自己产生上下文。', 16, colors.softInk, 500)}

    ${rect(1090, 114, 364, 188, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(1120, 148, 'FILTERS')}
    ${chip(1120, 198, 'All', 64)}
    ${chip(1198, 198, 'Local', 76, '#f5f6f5', colors.softInk)}
    ${chip(1288, 198, 'Mastodon', 104, '#f5f6f5', colors.softInk)}
    ${chip(1120, 242, 'Media', 82, '#f5f6f5', colors.softInk)}

    ${rect(1090, 334, 364, 230, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(1120, 368, 'MONTHS')}
    ${text(1120, 428, '2026.01', 17, colors.ink, 800)}
    <rect x="1214" y="413" width="168" height="9" rx="4.5" fill="${colors.wash}"/>
    <rect x="1214" y="413" width="110" height="9" rx="4.5" fill="${colors.green}"/>
    ${text(1400, 428, '9', 16, colors.green, 800)}
    ${text(1120, 468, '2025.12', 17, colors.ink, 800)}
    <rect x="1214" y="453" width="168" height="9" rx="4.5" fill="${colors.wash}"/>
    <rect x="1214" y="453" width="142" height="9" rx="4.5" fill="${colors.green}"/>
    ${text(1400, 468, '12', 16, colors.green, 800)}
    ${text(1120, 512, '31 memos · 12 media', 15, colors.muted, 600)}

    ${rect(1090, 596, 364, 350, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(1120, 630, 'SOURCES')}
    ${text(1120, 686, 'Local markdown', 16, colors.ink, 800)}
    ${text(1300, 686, '7', 18, colors.green, 850)}
    ${text(1120, 726, 'Remote statuses', 16, colors.ink, 800)}
    ${text(1300, 726, '24', 18, colors.green, 850)}
  `;
  return svgRoot('Memos', body, 'Memos');
}

function leavesPage() {
  const msg = (x, y, name, date, body, width = 884, height = 118) => `
    ${rect(x, y, width, height, { fill: colors.paper2, stroke: colors.ruleSoft, rx: 8, filter: 'none' })}
    <circle cx="${x + 34}" cy="${y + 36}" r="18" fill="#d6e3df"/>
    ${text(x + 64, y + 35, name, 16, colors.ink, 800)}
    ${text(x + 64, y + 60, date, 13, colors.faint, 600)}
    ${text(x + 64, y + 91, body, 15, colors.softInk, 500)}
  `;
  const body = `
    ${rect(74, 114, 980, 832, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(100, 150, 'MESSAGES')}
    ${text(100, 184, 'Notes left by visitors. The input stays secondary.', 15, colors.muted, 600)}
    ${msg(100, 220, 'Sora', '2026.01.11 · Shanghai', '很喜欢这个页面的留白，读起来没有负担。')}
    ${msg(100, 366, 'Ming', '2025.12.24 · Hangzhou', '从年终总结点进来的，运动记录部分很好看，也很适合按年份重读。')}
    ${msg(100, 512, 'Anonymous', '2025.12.07 · Web', 'RSS 已订阅，希望继续更新。这个站点像一个安静但持续有生命力的角落。')}
    ${msg(100, 658, 'Yan', '2025.11.16 · Beijing', '看到旅行和书影音都被收在一起，感觉个人站还是很值得长期维护。')}
    ${text(100, 914, 'View older leaves →', 15, colors.green, 800)}

    ${rect(1090, 114, 364, 188, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(1120, 148, 'SUMMARY')}
    ${text(1120, 202, '42', 32, colors.green, 850)}
    ${text(1172, 202, 'messages', 17, colors.ink, 800)}
    ${text(1120, 238, '6 this month · 2 pending', 15, colors.muted, 600)}

    ${rect(1090, 334, 364, 612, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(1120, 368, 'LEAVE A NOTE')}
    <rect x="1120" y="420" width="304" height="58" rx="8" fill="${colors.paper2}" stroke="${colors.ruleSoft}"/>
    ${text(1142, 456, 'Name / Email', 15, colors.faint, 500)}
    <rect x="1120" y="498" width="304" height="142" rx="8" fill="${colors.paper2}" stroke="${colors.ruleSoft}"/>
    ${para(1142, 538, ['写下想说的话。', '输入区保持次级，不打断留言阅读。'], 15, 26, colors.faint)}
    <rect x="1120" y="672" width="134" height="40" rx="8" fill="${colors.green}"/>
    ${text(1152, 698, 'Submit', 15, '#ffffff', 800)}
    <rect x="1270" y="672" width="118" height="40" rx="8" fill="${colors.paper}" stroke="${colors.ruleSoft}"/>
    ${text(1300, 698, 'Preview', 15, colors.ink, 700)}
    <line x1="1120" y1="740" x2="1424" y2="740" stroke="${colors.ruleSoft}"/>
    ${text(1120, 770, 'Powered by Twikoo', 13, colors.faint, 600)}
  `;
  return svgRoot('Leaves', body, 'Leaves');
}

async function imageData(file) {
  const buffer = await fs.readFile(path.resolve(file));
  const ext = path.extname(file).slice(1).replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${buffer.toString('base64')}`;
}

async function homePage() {
  const avatar = await imageData('public/ava3.png');
  const latestRows = [
    ['MAY', '31', '让 Agent 教我写 Agent', '关于 Agent 设计与实践的一些思考与记录。', 'AI', '8 min read'],
    ['FEB', '10', '过年碎碎念', '一些琐事，感受与新年的小目标。', '生活', '6 min read'],
    ['JAN', '22', '博客同步工作流', 'Hexo → GitHub → Cloudflare Pages 的自动化流程。', 'blog', '7 min read'],
    ['JAN', '18', '域名&图床搭建记录', 'Cloudflare + R2 + PicGo 的配置与踩坑记录。', 'blog', '6 min read'],
  ];
  const latest = latestRows.map(([mon, day, title, desc, tag, read], i) => {
    const y = 620 + i * 84;
    return `
      ${i ? `<line x1="100" y1="${y - 26}" x2="770" y2="${y - 26}" stroke="${colors.ruleSoft}"/>` : ''}
      ${text(128, y - 14, mon, 13, colors.softInk, 700)}
      ${text(126, y + 18, day, 25, colors.green, 850)}
      <line x1="184" y1="${y - 30}" x2="184" y2="${y + 26}" stroke="${colors.rule}"/>
      ${text(222, y - 10, title, 18, colors.ink, 850)}
      ${text(222, y + 22, desc, 14, colors.muted, 500)}
      ${chip(636, y - 22, tag, 54)}
      ${text(694, y - 5, `· ${read}`, 13, colors.muted, 600)}
    `;
  }).join('');

  const body = `
    ${text(96, 186, 'Do the right thing.', 58, colors.ink, 850)}
    ${text(96, 258, 'Do things right.', 58, colors.ink, 850)}
    ${para(98, 320, ['一个把文章、碎碎念、书影音、旅行足迹、运动数据和', '工具清单汇总到一起的个人内容中枢。'], 20, 34, colors.muted)}
    ${stat(98, 394, 176, '18', 'Entries')}
    ${stat(302, 394, 176, '14', 'Topics')}
    ${stat(506, 394, 176, '2021', 'Since')}

    ${rect(864, 118, 660, 374, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    <image x="898" y="148" width="140" height="140" href="${avatar}" clip-path="circle(70px at 70px 70px)" preserveAspectRatio="xMidYMid slice"/>
    ${text(1080, 180, 'LynkXu', 28, colors.ink, 850)}
    ${text(1080, 218, '细节控 / APP 体验家 / Web3 爱好 / AI 依赖', 16, colors.muted, 600)}
    <line x1="1080" y1="252" x2="1492" y2="252" stroke="${colors.rule}"/>
    ${iconBox(1080, 276, '</>')}
    ${text(1124, 302, 'Currently', 15, colors.ink, 800)}
    ${text(1210, 302, 'AI coding agent / Astro blog', 15, colors.muted, 600)}
    ${iconBox(1080, 326, '✎')}
    ${text(1124, 352, 'Writing', 15, colors.ink, 800)}
    ${text(1210, 352, 'AI, blog systems, life notes', 15, colors.muted, 600)}
    ${iconBox(1080, 376, '↻')}
    ${text(1124, 402, 'Sync', 15, colors.ink, 800)}
    ${text(1210, 402, 'Obsidian, Mastodon, NeoDB, Strava', 15, colors.muted, 600)}
    <line x1="898" y1="430" x2="1492" y2="430" stroke="${colors.rule}"/>
    ${iconBox(898, 452, 'GH')}
    ${iconBox(974, 452, 'X')}
    ${iconBox(1050, 452, 'RSS')}

    ${rect(74, 526, 720, 420, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(100, 558, 'LATEST')}
    ${latest}
    ${text(100, 914, 'View all entries →', 15, colors.green, 800)}

    ${rect(818, 526, 706, 420, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(846, 558, 'INDEX')}
    ${rect(846, 606, 326, 88, { fill: colors.paper2, stroke: colors.ruleSoft, rx: 7, filter: 'none' })}
    ${iconBox(870, 628, '▣')}
    ${text(934, 638, 'Photography', 16, colors.ink, 850)}
    ${text(934, 666, '光影瞬间', 15, colors.ink, 700)}
    ${text(934, 688, '15 images with EXIF', 13, colors.muted, 600)}
    ${text(1138, 660, '›', 34, colors.ink, 500)}
    ${rect(1188, 606, 306, 88, { fill: colors.paper2, stroke: colors.ruleSoft, rx: 7, filter: 'none' })}
    ${iconBox(1212, 628, '□')}
    ${text(1276, 638, 'Media', 16, colors.ink, 850)}
    ${text(1276, 666, '书影音', 15, colors.ink, 700)}
    ${text(1276, 688, '22 NeoDB records', 13, colors.muted, 600)}
    ${text(1460, 660, '›', 34, colors.ink, 500)}
    ${rect(846, 710, 326, 88, { fill: colors.paper2, stroke: colors.ruleSoft, rx: 7, filter: 'none' })}
    ${iconBox(870, 732, '○')}
    ${text(934, 742, 'Travel', 16, colors.ink, 850)}
    ${text(934, 770, '旅行足迹', 15, colors.ink, 700)}
    ${text(934, 792, '27 places / map pins', 13, colors.muted, 600)}
    ${text(1138, 764, '›', 34, colors.ink, 500)}
    ${rect(1188, 710, 306, 88, { fill: colors.paper2, stroke: colors.ruleSoft, rx: 7, filter: 'none' })}
    ${iconBox(1212, 732, '△')}
    ${text(1276, 742, 'Sports', 16, colors.ink, 850)}
    ${text(1276, 770, '运动记录', 15, colors.ink, 700)}
    ${text(1276, 792, '189 Strava activities', 13, colors.muted, 600)}
    ${text(1460, 764, '›', 34, colors.ink, 500)}
    <rect x="846" y="820" width="648" height="86" rx="8" fill="url(#greenPanel)"/>
    ${text(872, 858, 'Data streams', 24, '#ffffff', 850)}
    ${text(872, 886, '订阅我在各平台的数据与动态，自动同步，持续更新。', 15, '#e4f1ee', 500)}
    ${text(1460, 878, '›', 44, '#ffffff', 500)}
  `;
  return svgRoot('Home', body, 'Archive');
}

async function aboutPage() {
  const body = `
    ${rect(74, 114, 744, 832, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(104, 150, 'PROFILE')}
    ${text(104, 214, 'Hi, I am Lynk', 38, colors.ink, 850)}
    ${para(104, 266, ['一个偏乐观的悲观主义者。', '一个偏现实的理想主义者。', '一个想法很多，但却不善表达的人。'], 20, 36, colors.softInk, 650)}
    <line x1="104" y1="406" x2="772" y2="406" stroke="${colors.ruleSoft}"/>
    ${para(104, 464, ['我尝试在这里记下自己的所思所想，生活需要记录，记录是为了更好地生活。', '这个页面更像一张说明书：我是谁、我在做什么、以及这个博客如何被维护。'], 17, 34, colors.muted, 500)}
    ${rect(104, 588, 300, 96, { fill: colors.paper2, stroke: colors.ruleSoft, rx: 8, filter: 'none' })}
    ${iconBox(128, 614, '⌘')}
    ${text(190, 630, '工作', 17, colors.ink, 800)}
    ${text(190, 660, 'Fullstack / AI tools', 15, colors.muted, 600)}
    ${rect(436, 588, 300, 96, { fill: colors.paper2, stroke: colors.ruleSoft, rx: 8, filter: 'none' })}
    ${iconBox(460, 614, '↗')}
    ${text(522, 630, '日常', 17, colors.ink, 800)}
    ${text(522, 660, '训练 / 阅读 / 漫步', 15, colors.muted, 600)}

    ${rect(850, 114, 604, 236, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(880, 148, 'NOW')}
    ${text(880, 210, 'What I care about', 30, colors.ink, 850)}
    ${para(880, 254, ['细节、工具、长期主义，以及如何让日常记录保持可回看。'], 16, 28)}
    ${text(880, 306, 'Shanghai · Fullstack Engineer · Training rhythm', 15, colors.green, 800)}

    ${rect(850, 382, 604, 286, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(880, 416, 'COLOPHON')}
    ${text(880, 478, 'About this blog', 30, colors.ink, 850)}
    ${para(880, 522, ['Astro 与 GitHub Pages 驱动。内容从 Obsidian、NeoDB、Strava', '和 Mastodon 自动同步，最后收束成可长期阅读的个人内容中枢。'], 16, 28)}

    ${rect(850, 700, 604, 246, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(880, 734, 'SUPPORT')}
    ${text(880, 792, 'Sponsor', 22, colors.ink, 850)}
    ${text(980, 792, '赞助入口保持低优先级，不打断关于页的叙事。', 15, colors.muted, 600)}
  `;
  return svgRoot('About', body, 'About');
}

function postPage() {
  const body = `
    ${rect(74, 114, 906, 190, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${text(104, 156, 'Archive / AI', 15, colors.green, 800)}
    ${text(104, 206, '让 Agent 教我写 Agent', 38, colors.ink, 850)}
    ${para(104, 248, ['关于 Agent 设计与实践的一些思考与记录。'], 17, 28)}
    ${text(104, 280, 'May 31, 2026', 14, colors.muted, 600)}
    ${text(226, 280, '·', 14, colors.faint, 600)}
    ${text(246, 280, '8 min read', 14, colors.muted, 600)}
    ${chip(352, 258, 'AI', 52)}

    ${rect(1010, 114, 444, 326, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(1040, 146, 'ON THIS PAGE')}
    ${text(1040, 206, '设计目标', 16, colors.green, 800)}
    ${text(1040, 244, '上下文与约束', 16, colors.ink, 700)}
    ${text(1040, 282, '工具链', 16, colors.ink, 700)}
    ${text(1040, 320, '下一步', 16, colors.ink, 700)}
    <line x1="1040" y1="364" x2="1424" y2="364" stroke="${colors.ruleSoft}"/>
    ${text(1040, 404, 'Current section follows scroll', 14, colors.faint, 600)}

    ${rect(1010, 472, 444, 244, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${labelText(1040, 504, 'META')}
    ${text(1040, 562, 'Published', 14, colors.faint, 700)}
    ${text(1162, 562, '2026.05.31', 16, colors.ink, 700)}
    ${text(1040, 604, 'Updated', 14, colors.faint, 700)}
    ${text(1162, 604, '2026.06.02', 16, colors.ink, 700)}
    ${text(1040, 646, 'Reading', 14, colors.faint, 700)}
    ${text(1162, 646, '8 min', 16, colors.ink, 700)}
    ${text(1040, 688, 'Tags', 14, colors.faint, 700)}
    ${chip(1162, 667, 'AI', 54)}
    ${chip(1228, 667, 'Agent', 78)}

    ${rect(74, 336, 906, 610, { fill: colors.paper, stroke: colors.rule, rx: 8 })}
    ${serifText(144, 402, '设计目标', 29, colors.ink, 850)}
    ${para(144, 452, ['我真正想要的不是让 Agent 替我写更多代码，而是让它暴露我没有说清楚的地方。', '一个好的 Agent 工作流，首先应该让问题变得可讨论，然后才是把方案变成文件。'], 18, 34, colors.softInk, 500)}
    ${serifText(144, 576, '上下文与约束', 29, colors.ink, 850)}
    ${para(144, 626, ['实践中最有用的约束来自三个地方：项目已有结构、读者真实路径，以及后续维护成本。', '当这三者一致时，自动化才会变得可靠。'], 18, 34, colors.softInk, 500)}
    <rect x="144" y="718" width="766" height="88" rx="8" fill="${colors.paper2}" stroke="${colors.ruleSoft}"/>
    ${text(170, 754, 'agent.plan({ scope: "small", verify: "always" })', 17, colors.greenDark, 700)}
    ${text(170, 784, '// 先定义边界，再进入执行。', 15, colors.muted, 600)}
    ${serifText(144, 876, '工具链', 29, colors.ink, 850)}
    ${text(144, 918, '把可重复的工作流交给工具，但把判断留给人。', 18, colors.softInk, 500)}
  `;
  return svgRoot('Post detail', body, 'Archive');
}

async function writePng(name, svg) {
  const svgPath = path.join(OUT_DIR, `${name}.svg`);
  const pngPath = path.join(OUT_DIR, `${name}.png`);
  await fs.writeFile(svgPath, svg, 'utf8');
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  return pngPath;
}

const outputs = [];
outputs.push(await writePng('home-page-design', await homePage()));
outputs.push(await writePng('archive-page-design', archivePage()));
outputs.push(await writePng('memos-page-design', memosPage()));
outputs.push(await writePng('leaves-page-design', leavesPage()));
outputs.push(await writePng('about-page-design', await aboutPage()));
outputs.push(await writePng('post-detail-page-design', postPage()));

console.log(outputs.join('\n'));
