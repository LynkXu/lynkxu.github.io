import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../src/data/changelog.json');
const SINCE_DAYS = 90;
const MAX_ENTRIES = 8;

// 排除的关键词（小写匹配）
const SKIP_PATTERNS = [
  /^chore:\s*sync/i,
  /^vault\s+backup/i,
  /^update\s+style/i,
  /^update\s+blog\s+style/i,
  /^update\s+content\s+&\s+style/i,
  /^update\s+code\s+block\s+style/i,
  /^revert\s+/i,
  /^update\s*$/i,
  /^style:\s*change\s+weightlifting/i,
  /^style:\s*refine\s+translation/i,
  /^style:\s*shorten\s+bio/i,
  /^style:\s*adjust\s+vertical\s+spacing/i,
  /^style:\s*fix\s+vertical\s+alignment/i,
  /^style:\s*remove\s+redundant/i,
  /^style:\s*remove\s+(card|top\s+glow)/i,
  /^style:\s*add\s+subtle\s+dot/i,
  /^style:\s*unify\s+hero/i,
  /^style:\s*optimize\s+layout/i,
  /^style:\s*optimize\s+homepage\s+tags/i,
  /^style:\s*change\s+eof/i,
  /^style:\s*refine\s+eof/i,
  /^style:\s*replace\s+post\s+end/i,
  /^style:\s*remove\s+redundant\s+tags/i,
  /^style:\s*restore\s+subtle\s+card/i,
  /^style:\s*remove\s+card\s+background/i,
  /^style:\s*remove\s+redundant\s+english/i,
  /^fix:\s*rename\s+shuoshuo/i,
];

function shouldSkip(message) {
  const msg = message.trim();
  return SKIP_PATTERNS.some(p => p.test(msg));
}

// 检查提交是否只是发布了一篇文章（只改 1 个 .md 文件）
function isSingleMarkdownPost(hash) {
  try {
    const stat = execSync(`git show --stat --format='' ${hash}`, {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const lines = stat.trim().split('\n').filter(l => l.includes('|'));
    if (lines.length !== 1) return false;
    const file = lines[0].split('|')[0].trim();
    return file.endsWith('.md') || file.endsWith('.mdx');
  } catch {
    return false;
  }
}

function getFileChangeCount(hash) {
  try {
    const stat = execSync(`git show --stat --format='' ${hash}`, {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const lines = stat.trim().split('\n').filter(l => l.includes('|'));
    return lines.length;
  } catch {
    return 0;
  }
}

function generate() {
  const since = new Date();
  since.setDate(since.getDate() - SINCE_DAYS);
  const sinceStr = since.toISOString();

  console.log(`Generating changelog since ${sinceStr}...`);

  const logOutput = execSync(
    `git log --since="${sinceStr}" --no-merges --format="%H|%s|%ci"`,
    {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'ignore'],
    }
  );

  const entries = [];
  const lines = logOutput.trim().split('\n').filter(Boolean);

  for (const line of lines) {
    const [hash, message, dateStr] = line.split('|');
    if (!hash || !message) continue;

    if (shouldSkip(message)) continue;

    // 跳过只发布一篇文章的提交
    if (isSingleMarkdownPost(hash)) continue;

    const fileCount = getFileChangeCount(hash);
    const date = new Date(dateStr);

    entries.push({
      hash: hash.slice(0, 7),
      message: message.trim(),
      date: date.toISOString().split('T')[0],
      fileCount,
    });

    if (entries.length >= MAX_ENTRIES) break;
  }

  // Ensure directory exists
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2));
  console.log(`Wrote ${entries.length} changelog entries to ${OUTPUT_FILE}`);

  for (const e of entries) {
    console.log(`  ${e.date}  ${e.hash}  ${e.message}`);
  }
}

generate();
