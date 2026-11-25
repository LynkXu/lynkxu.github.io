import fs from 'node:fs/promises';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const CACHE_PATH = path.resolve('src/data/link-cards.json');
const REFRESH = process.argv.includes('--refresh');

async function walkMarkdownFiles(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkMarkdownFiles(fullPath)));
		} else if (/\.(md|mdx)$/i.test(entry.name)) {
			files.push(fullPath);
		}
	}
	return files;
}

function extractUrls(content) {
	// Strip HTML comments before scanning
	const stripped = content.replace(/<!--[\s\S]*?-->/g, '');
	const urls = new Set();

	const divRegex = /<div[^>]*class="[^"]*\blink-card\b[^"]*"[^>]*data-url="([^"]+)"[^>]*>/g;
	for (const match of stripped.matchAll(divRegex)) {
		urls.add(match[1].trim());
	}

	const directiveRegex = /::link-card\{url="([^"]+)"(?:\s*,\s*style="[^"]+")?\}/g;
	for (const match of stripped.matchAll(directiveRegex)) {
		urls.add(match[1].trim());
	}

	return urls;
}

async function loadCache() {
	try {
		const raw = await fs.readFile(CACHE_PATH, 'utf8');
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

function decodeEntities(str) {
	return String(str || '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
		.trim();
}

function parseMetaFromHtml(html, baseUrl) {
	const getMeta = (attr, value) => {
		const patterns = [
			new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
			new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["'][^>]*>`, 'i'),
		];
		for (const re of patterns) {
			const m = html.match(re);
			if (m?.[1]) return decodeEntities(m[1]);
		}
		return '';
	};

	const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
	const title = getMeta('property', 'og:title') || getMeta('name', 'twitter:title') || decodeEntities(titleTag);
	const description =
		getMeta('property', 'og:description') ||
		getMeta('name', 'twitter:description') ||
		getMeta('name', 'description');
	let image = getMeta('property', 'og:image') || getMeta('name', 'twitter:image');
	if (image) {
		try {
			image = new URL(image, baseUrl).toString();
		} catch {
			image = '';
		}
	}

	if (!title) return null;
	return { title, description, image };
}

async function fetchDirectMeta(url) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 8000);
	try {
		const res = await fetch(url, {
			signal: controller.signal,
			redirect: 'follow',
			headers: {
				'user-agent': 'Mozilla/5.0 (compatible; LynkXuBlogBot/1.0)',
				accept: 'text/html,application/xhtml+xml',
			},
		});
		if (!res.ok) return null;
		const html = await res.text();
		return parseMetaFromHtml(html, res.url || url);
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

const INVALID_TITLE_PATTERNS = [
	/页面不见了/i,
	/404\b/i,
	/just a moment/i,
	/access denied/i,
	/attention required/i,
];

function isValidMeta(meta) {
	if (!meta?.title) return false;
	return !INVALID_TITLE_PATTERNS.some((re) => re.test(meta.title));
}

async function fetchMeta(url) {
	const direct = await fetchDirectMeta(url);
	if (isValidMeta(direct)) return direct;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 8000);
	try {
		const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
			signal: controller.signal,
		});
		if (!res.ok) return null;
		const json = await res.json();
		const data = json?.data;
		const meta = data?.title
			? {
					title: String(data.title).trim(),
					description: String(data.description || '').trim(),
					image: String(data.image?.url || '').trim(),
				}
			: null;
		return isValidMeta(meta) ? meta : null;
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

async function main() {
	const files = await walkMarkdownFiles(BLOG_DIR);
	const urls = new Set();
	for (const file of files) {
		const content = await fs.readFile(file, 'utf8');
		for (const url of extractUrls(content)) {
			urls.add(url);
		}
	}

	const cache = await loadCache();
	let updated = 0;

	for (const url of Array.from(urls).sort()) {
		if (!REFRESH && cache[url]?.title) {
			continue;
		}
		console.log(`[link-cards] Fetching ${url}`);
		const meta = await fetchMeta(url);
		if (meta) {
			cache[url] = meta;
			updated++;
			console.log(`[link-cards] Cached: ${meta.title}`);
		} else {
			console.warn(`[link-cards] Skipped (unavailable): ${url}`);
		}
	}

	const sortedCache = Object.fromEntries(
		Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)),
	);

	await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
	await fs.writeFile(CACHE_PATH, `${JSON.stringify(sortedCache, null, 2)}\n`, 'utf8');
	console.log(`[link-cards] Done (${Object.keys(sortedCache).length} cached, ${updated} updated).`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
