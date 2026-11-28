import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_JSON = path.join(__dirname, '../src/data/home-cover.json');
const OUTPUT_DIR = path.join(__dirname, '../public/home-cover');
const DAILY_IMAGE_PATH = path.join(OUTPUT_DIR, 'daily.webp');
const FALLBACK_IMAGE_PATH = path.join(OUTPUT_DIR, 'fallback.webp');

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'LynkXuBlog/1.0 (https://lynkxu.com; home-cover-sync)';

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MIN_ASPECT_RATIO = 1.35;
const MIN_WIDTH = 1000;
const TARGET_WIDTH = 1400;

function getBeijingDate(offsetDays = 0) {
	const now = new Date(Date.now() + offsetDays * 86400_000);
	const fmt = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Shanghai',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	return fmt.format(now); // YYYY-MM-DD
}

function decodeEntities(text) {
	return text
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

function stripHtml(html) {
	if (!html) return '';
	return decodeEntities(
		html
			.replace(/<style[\s\S]*?<\/style>/gi, ' ')
			.replace(/<script[\s\S]*?<\/script>/gi, ' ')
			.replace(/<\/?(?:p|div|br|li|tr)[^>]*>/gi, ' ')
			.replace(/<[^>]+>/g, '')
	)
		.replace(/\s+/g, ' ')
		.replace(/\s+([,.;:!?，。；：！？、）》」』])/g, '$1')
		.replace(/([（《「『(])\s+/g, '$1')
		.trim();
}

async function fetchJson(url) {
	const res = await fetch(url, {
		headers: {
			'User-Agent': USER_AGENT,
			Accept: 'application/json',
		},
	});
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
	}
	return res.json();
}

async function expandTemplate(wikitext) {
	const params = new URLSearchParams({
		action: 'expandtemplates',
		text: wikitext,
		prop: 'wikitext',
		format: 'json',
	});
	const data = await fetchJson(`${WIKIMEDIA_API}?${params}`);
	return (data?.expandtemplates?.wikitext || '').trim();
}

async function fetchLocalizedCaption(dateStr, lang) {
	const templateTitle = `Template:Potd/${dateStr} (${lang})`;
	const params = new URLSearchParams({
		action: 'parse',
		page: templateTitle,
		prop: 'text',
		format: 'json',
		disablelimitreport: '1',
		disableeditsection: '1',
	});
	const data = await fetchJson(`${WIKIMEDIA_API}?${params}`);
	if (data?.error) return '';
	const rawHtml = data?.parse?.text?.['*'] || '';
	const text = stripHtml(rawHtml);
	if (!text || text.includes(`Template:Potd/${dateStr}`)) return '';
	return text;
}

async function fetchFileInfo(filename) {
	const normalized = filename.replace(/^File:/i, '').trim();
	const params = new URLSearchParams({
		action: 'query',
		titles: `File:${normalized}`,
		prop: 'imageinfo',
		iiprop: 'url|size|mime|extmetadata',
		iiurlwidth: String(TARGET_WIDTH),
		format: 'json',
	});
	const data = await fetchJson(`${WIKIMEDIA_API}?${params}`);
	const pages = data?.query?.pages || {};
	const page = Object.values(pages)[0];
	const info = page?.imageinfo?.[0];
	if (!info) return null;
	return {
		filename: normalized,
		...info,
	};
}

function buildFallbackPayload(dateStr, reason) {
	return {
		date: dateStr,
		isFallback: true,
		fallbackReason: reason,
		image: '/home-cover/fallback.webp',
		position: 'center 45%',
		description: '晨雾笼罩的层叠青山',
		author: 'Inggrid Koe',
		license: 'Unsplash License',
		sourceName: 'Unsplash',
		sourceUrl: 'https://unsplash.com/photos/misty-mountains-inggrid-koe',
	};
}

async function writeFallback(dateStr, reason) {
	if (!fs.existsSync(FALLBACK_IMAGE_PATH)) {
		throw new Error(`Fallback cover image not found at ${FALLBACK_IMAGE_PATH}`);
	}
	const payload = buildFallbackPayload(dateStr, reason);
	fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
	fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
	console.log(`[home-cover] Using fallback cover (${reason}) for ${dateStr}`);
}

async function main() {
	const targetDate = process.argv[2] || getBeijingDate(0);
	console.log(`[home-cover] Fetching Wikimedia POTD for ${targetDate}...`);

	try {
		const filename = await expandTemplate(`{{Potd/${targetDate}}}`);
		if (!filename || filename.includes('{{') || filename.includes('Template:Potd')) {
			await writeFallback(targetDate, 'POTD template unavailable for target date');
			return;
		}

		const info = await fetchFileInfo(filename);
		if (!info) {
			await writeFallback(targetDate, `Image info not found for ${filename}`);
			return;
		}

		const { width = 0, height = 0, mime = '', thumburl, url, descriptionurl, extmetadata = {} } = info;
		const aspect = height > 0 ? width / height : 0;

		if (!ALLOWED_MIMES.has(mime)) {
			await writeFallback(targetDate, `Unsupported MIME type: ${mime}`);
			return;
		}

		if (width < MIN_WIDTH || aspect < MIN_ASPECT_RATIO) {
			await writeFallback(
				targetDate,
				`Non-landscape or low-res image (${width}x${height}, aspect=${aspect.toFixed(2)})`
			);
			return;
		}

		const downloadUrl = thumburl || url;
		if (!downloadUrl) {
			await writeFallback(targetDate, 'Missing downloadable image URL');
			return;
		}

		const [zhCaption, zhHansCaption, enCaption, imgRes] = await Promise.all([
			fetchLocalizedCaption(targetDate, 'zh').catch(() => ''),
			fetchLocalizedCaption(targetDate, 'zh-hans').catch(() => ''),
			fetchLocalizedCaption(targetDate, 'en').catch(() => ''),
			fetch(downloadUrl, { headers: { 'User-Agent': USER_AGENT } }),
		]);

		if (!imgRes.ok) {
			await writeFallback(targetDate, `Failed to download image: HTTP ${imgRes.status}`);
			return;
		}

		const rawBuffer = Buffer.from(await imgRes.arrayBuffer());
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
		const savedInfo = await sharp(rawBuffer)
			.rotate()
			.resize({ width: TARGET_WIDTH, withoutEnlargement: true })
			.webp({ quality: 84 })
			.toFile(DAILY_IMAGE_PATH);

		const metaDesc = stripHtml(extmetadata?.ImageDescription?.value || '');
		const description =
			zhCaption || zhHansCaption || enCaption || metaDesc || filename.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
		const author = stripHtml(extmetadata?.Artist?.value || '') || 'Wikimedia Commons';
		const license = stripHtml(extmetadata?.LicenseShortName?.value || '') || 'Wikimedia Commons';
		const sourceUrl =
			descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(info.filename)}`;

		const payload = {
			date: targetDate,
			isFallback: false,
			image: '/home-cover/daily.webp',
			width: savedInfo.width,
			height: savedInfo.height,
			position: 'center 48%',
			filename: info.filename,
			description,
			author,
			license,
			sourceName: 'Wikimedia POTD',
			sourceUrl,
		};

		fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
		fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
		console.log(
			`[home-cover] Saved POTD for ${targetDate}: ${info.filename} (${savedInfo.width}x${savedInfo.height}, ${Math.round(savedInfo.size / 1024)}KB)`
		);
	} catch (error) {
		console.warn('[home-cover] Sync error:', error instanceof Error ? error.message : String(error));
		await writeFallback(targetDate, 'Fetch error');
	}
}

main();
