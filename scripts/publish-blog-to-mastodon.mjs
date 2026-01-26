import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = process.cwd();

const STATE_FILE = path.join(REPO_ROOT, 'src/data/mastodon-published.json');
const BLOG_ROOT = path.join(REPO_ROOT, 'src/content/blog');
const ASTRO_CONFIG = path.join(REPO_ROOT, 'astro.config.mjs');

const MASTODON_INSTANCE = (process.env.MASTODON_INSTANCE || '').trim();
const MASTODON_ACCESS_TOKEN = (process.env.MASTODON_ACCESS_TOKEN || '').trim();
const BASE_SHA = (process.env.BASE_SHA || '').trim();
const HEAD_SHA = (process.env.HEAD_SHA || '').trim();

const DEFAULT_CHAR_LIMIT = 500;
const STATUS_CHAR_LIMIT = Number.parseInt(process.env.MASTODON_CHAR_LIMIT || '', 10) || DEFAULT_CHAR_LIMIT;
const VISIBILITY = (process.env.MASTODON_VISIBILITY || 'public').trim();

function sh(cmd) {
	return execSync(cmd, { encoding: 'utf8' }).trimEnd();
}

function readText(p) {
	return fs.readFileSync(p, 'utf8');
}

function readJson(p, fallback) {
	try {
		if (!fs.existsSync(p)) return fallback;
		const raw = fs.readFileSync(p, 'utf8');
		if (!raw.trim()) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}

function writeJson(p, value) {
	const dir = path.dirname(p);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
}

function getSiteUrlFromAstroConfig() {
	try {
		const txt = readText(ASTRO_CONFIG);
		const m =
			txt.match(/site:\s*'([^']+)'/) ||
			txt.match(/site:\s*"([^"]+)"/);
		return (m?.[1] || '').trim() || 'https://lynkxu.com';
	} catch {
		return 'https://lynkxu.com';
	}
}

function isAllZeroSha(sha) {
	return /^[0]{40}$/.test(sha);
}

function getAddedBlogFiles(baseSha, headSha) {
	// For initial commits / unknown base, diff against empty tree.
	const emptyTree = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
	const base = !baseSha || isAllZeroSha(baseSha) ? emptyTree : baseSha;
	const head = headSha || 'HEAD';

	const out = sh(`git diff --name-status ${base} ${head}`);
	if (!out.trim()) return [];

	const lines = out.split('\n').map((l) => l.trim()).filter(Boolean);
	const added = [];
	for (const line of lines) {
		// Format: "A\tpath"
		const [status, ...rest] = line.split(/\s+/);
		const file = rest.join(' ').trim();
		if (status !== 'A') continue;
		if (!file) continue;
		if (!file.startsWith('src/content/blog/')) continue;
		if (file.startsWith('src/content/blog/en/')) continue;
		if (!/\.(md|mdx)$/i.test(file)) continue;
		added.push(file);
	}
	return added;
}

function stripQuotes(s) {
	const t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		return t.slice(1, -1);
	}
	return t;
}

function parseFrontmatter(md) {
	// Minimal YAML frontmatter parser for this repo's needs:
	// - title: string
	// - description: string (optional)
	// - slug: string (optional)
	// - draft: boolean (optional)
	//
	// Supports:
	// ---
	// key: value
	// key:
	//   - item
	// ---
	if (!md.startsWith('---\n') && !md.startsWith('---\r\n')) return {};
	const endIdx = md.indexOf('\n---', 4);
	if (endIdx === -1) return {};

	const fmBlock = md.slice(4, endIdx).replace(/\r\n/g, '\n');
	const lines = fmBlock.split('\n');
	const data = {};

	let currentKey = null;
	for (const raw of lines) {
		const line = raw.replace(/\t/g, '  ');
		if (!line.trim()) continue;

		// list item
		const listMatch = line.match(/^\s*-\s+(.*)$/);
		if (listMatch && currentKey) {
			if (!Array.isArray(data[currentKey])) data[currentKey] = [];
			data[currentKey].push(stripQuotes(listMatch[1]));
			continue;
		}

		const kv = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
		if (!kv) continue;
		currentKey = kv[1];
		const rawVal = kv[2] ?? '';
		if (rawVal === '') {
			// could be a list starting next lines
			data[currentKey] = data[currentKey] ?? [];
			continue;
		}

		const v = stripQuotes(rawVal);
		if (v === 'true') data[currentKey] = true;
		else if (v === 'false') data[currentKey] = false;
		else data[currentKey] = v;
	}

	return data;
}

function toPosix(p) {
	return p.split(path.sep).join('/');
}

function computePostId(relFileFromRepoRoot, frontmatter) {
	// Align with src/content.config.ts:
	// generateId: data.slug || entry (entry is path relative to src/content/blog, including subdirs, without leading slash)
	if (frontmatter?.slug) return String(frontmatter.slug).trim();
	const relFromBlogRoot = path.relative(BLOG_ROOT, path.join(REPO_ROOT, relFileFromRepoRoot));
	const noExt = relFromBlogRoot.replace(/\.(md|mdx)$/i, '');
	return toPosix(noExt);
}

function buildStatusText({ title, description, url }) {
	const titleLine = `《${title}》`;
	const blogSyncTag = '#BlogSync'; // 标记这是从博客同步过来的文章
	const parts = [titleLine];
	if (description && description.trim()) parts.push(description.trim());
	parts.push(url);
	parts.push(blogSyncTag);

	let status = parts.join('\n\n').trim();
	if (status.length <= STATUS_CHAR_LIMIT) return status;

	// Truncate description first, always keep title + url + tag.
	const fixed = [titleLine, url, blogSyncTag].join('\n\n');
	const remaining = Math.max(0, STATUS_CHAR_LIMIT - fixed.length - 2); // -2 for extra '\n\n' before url if needed
	if (!description || remaining <= 0) return fixed.slice(0, STATUS_CHAR_LIMIT);

	const ellipsis = '…';
	const trimmed = description.trim();
	const maxDesc = Math.max(0, remaining - ellipsis.length);
	const shortDesc = maxDesc > 0 ? trimmed.slice(0, maxDesc) + ellipsis : '';
	return [titleLine, shortDesc, url, blogSyncTag].filter(Boolean).join('\n\n').trim().slice(0, STATUS_CHAR_LIMIT);
}

async function postToMastodon({ instance, token, status, visibility }) {
	const url = `${instance.replace(/\/+$/, '')}/api/v1/statuses`;
	const resp = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ status, visibility }),
	});
	if (!resp.ok) {
		const text = await resp.text().catch(() => '');
		throw new Error(`Mastodon post failed: ${resp.status} ${resp.statusText}${text ? ` - ${text}` : ''}`);
	}
	return await resp.json();
}

async function main() {
	if (!MASTODON_INSTANCE || !MASTODON_ACCESS_TOKEN) {
		console.log('[mastodon-publish] Missing MASTODON_INSTANCE or MASTODON_ACCESS_TOKEN; skipping.');
		return;
	}

	const siteUrl = (process.env.SITE_URL || '').trim() || getSiteUrlFromAstroConfig();
	const state = readJson(STATE_FILE, []);
	const published = Array.isArray(state) ? state : [];
	const publishedUrlSet = new Set(published.map((x) => x?.url).filter(Boolean));

	const addedFiles = getAddedBlogFiles(BASE_SHA, HEAD_SHA);
	if (addedFiles.length === 0) {
		console.log('[mastodon-publish] No newly added blog posts detected; skipping.');
		return;
	}

	let postedCount = 0;
	for (const rel of addedFiles) {
		const abs = path.join(REPO_ROOT, rel);
		if (!fs.existsSync(abs)) continue;

		const md = readText(abs);
		const fm = parseFrontmatter(md);
		const title = (fm.title || '').toString().trim();
		if (!title) {
			console.log(`[mastodon-publish] Skip (no title): ${rel}`);
			continue;
		}
		if (fm.draft === true) {
			console.log(`[mastodon-publish] Skip (draft): ${rel}`);
			continue;
		}

		const postId = computePostId(rel, fm);
		// Site output uses a trailing slash for these routes (e.g. ".../xxx.html/").
		const canonicalUrl = `${siteUrl.replace(/\/+$/, '')}/blog/${postId}.html/`;
		if (publishedUrlSet.has(canonicalUrl)) {
			console.log(`[mastodon-publish] Skip (already published): ${canonicalUrl}`);
			continue;
		}

		const description = (fm.description || '').toString();
		const status = buildStatusText({ title, description, url: canonicalUrl });

		console.log(`[mastodon-publish] Posting: ${canonicalUrl}`);
		const toot = await postToMastodon({
			instance: MASTODON_INSTANCE,
			token: MASTODON_ACCESS_TOKEN,
			status,
			visibility: VISIBILITY,
		});

		postedCount += 1;
		published.push({
			url: canonicalUrl,
			postId,
			title,
			sourcePath: rel,
			tootId: toot?.id || null,
			tootUrl: toot?.url || null,
			visibility: toot?.visibility || VISIBILITY,
			commit: HEAD_SHA || null,
			publishedAt: new Date().toISOString(),
		});
		publishedUrlSet.add(canonicalUrl);
	}

	if (postedCount === 0) {
		console.log('[mastodon-publish] Nothing new to publish.');
		return;
	}

	// Keep newest first in state file.
	published.sort((a, b) => String(b?.publishedAt || '').localeCompare(String(a?.publishedAt || '')));
	writeJson(STATE_FILE, published);
	console.log(`[mastodon-publish] Done. Posted ${postedCount} new post(s).`);
}

main().catch((err) => {
	console.error('[mastodon-publish] Error:', err);
	process.exit(1);
});
