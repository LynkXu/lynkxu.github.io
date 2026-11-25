import fs from 'node:fs';
import path from 'node:path';

const CACHE_PATH = path.resolve('src/data/link-cards.json');

function loadLinkCardCache() {
	try {
		return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
	} catch {
		return {};
	}
}

function getClasses(properties) {
	const raw = properties?.className ?? properties?.class;
	if (Array.isArray(raw)) return raw.map(String);
	if (typeof raw === 'string') return raw.split(/\s+/).filter(Boolean);
	return [];
}

function extractText(nodes = []) {
	let out = '';
	for (const node of nodes) {
		if (node.type === 'text') out += node.value || '';
		else if (node.children) out += extractText(node.children);
	}
	return out.trim();
}

function decodeHtmlAttr(str) {
	return String(str || '')
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function stripTags(html) {
	return decodeHtmlAttr(String(html || '').replace(/<[^>]+>/g, '')).trim();
}

function resolveHostname(url) {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

function buildReadyChildren(url, style, meta) {
	const bodyChildren = [
		{
			type: 'element',
			tagName: 'span',
			properties: { className: ['link-card__title'] },
			children: [{ type: 'text', value: meta.title }],
		},
	];

	if (meta.description && style !== 'minimal') {
		bodyChildren.push({
			type: 'element',
			tagName: 'p',
			properties: {},
			children: [{ type: 'text', value: meta.description }],
		});
	}

	bodyChildren.push({
		type: 'element',
		tagName: 'span',
		properties: { className: ['link-card__host'] },
		children: [{ type: 'text', value: resolveHostname(url) }],
	});

	const linkChildren = [];
	if (meta.image && style !== 'minimal') {
		linkChildren.push({
			type: 'element',
			tagName: 'div',
			properties: { className: ['link-card__image-wrapper'] },
			children: [
				{
					type: 'element',
					tagName: 'img',
					properties: {
						src: meta.image,
						alt: '',
						loading: 'lazy',
						decoding: 'async',
					},
					children: [],
				},
			],
		});
	}

	linkChildren.push({
		type: 'element',
		tagName: 'div',
		properties: { className: ['link-card__body'] },
		children: bodyChildren,
	});

	return [
		{
			type: 'element',
			tagName: 'a',
			properties: {
				href: url,
				target: '_blank',
				rel: 'noopener noreferrer',
				className: ['link-card__content'],
			},
			children: linkChildren,
		},
	];
}

function buildFallbackChildren(url, fallbackText) {
	return [
		{
			type: 'element',
			tagName: 'a',
			properties: {
				href: url,
				target: '_blank',
				rel: 'noopener noreferrer',
				className: ['link-card__fallback'],
			},
			children: [{ type: 'text', value: fallbackText || url }],
		},
	];
}

function buildCardElement(url, rawStyle, existingClasses, fallbackText, cache) {
	const classes = Array.from(new Set(['link-card', ...existingClasses]));
	const style =
		rawStyle ||
		(classes.includes('link-card--cover')
			? 'cover'
			: classes.includes('link-card--minimal')
				? 'minimal'
				: 'default');

	if (style !== 'default' && !classes.includes(`link-card--${style}`)) {
		classes.push(`link-card--${style}`);
	}

	const meta = cache[url];
	let children;

	if (meta?.title) {
		if (!classes.includes('link-card--ready')) classes.push('link-card--ready');
		children = buildReadyChildren(url, style, meta);
	} else if (fallbackText) {
		// 作者手写了标题文本且目标站不可抓取时，按极简卡片排版直出并标记 ready，避免被客户端抓取 404 页覆盖。
		if (!classes.includes('link-card--minimal') && style === 'default') {
			classes.push('link-card--minimal');
		}
		if (!classes.includes('link-card--ready')) classes.push('link-card--ready');
		children = buildReadyChildren(url, 'minimal', { title: fallbackText, description: '', image: '' });
	} else {
		children = buildFallbackChildren(url, '');
	}

	return {
		type: 'element',
		tagName: 'div',
		properties: {
			className: classes,
			'data-url': url,
			...(style !== 'default' ? { 'data-style': style } : {}),
		},
		children,
	};
}

function parseRawLinkCard(rawHtml, cache) {
	const trimmed = String(rawHtml || '').trim();
	const match = trimmed.match(/^<div\b([^>]*)>([\s\S]*?)<\/div>$/i);
	if (!match) return null;

	const attrs = match[1];
	const innerHtml = match[2];

	const classMatch = attrs.match(/\bclass=["']([^"']+)["']/i);
	const classes = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
	if (!classes.includes('link-card')) return null;

	const urlMatch = attrs.match(/\bdata-url=["']([^"']+)["']/i);
	if (!urlMatch) return null;

	const url = decodeHtmlAttr(urlMatch[1]).trim();
	if (!url) return null;

	const styleMatch = attrs.match(/\bdata-style=["']([^"']+)["']/i);
	const style = styleMatch ? styleMatch[1].trim() : '';
	const fallbackText = stripTags(innerHtml);

	return buildCardElement(url, style, classes, fallbackText, cache);
}

// Pre-render cached LinkCards at build time (supports raw HTML blocks, elements, and ::link-card directives).
export default function rehypeLinkCard() {
	return function transform(tree) {
		const cache = loadLinkCardCache();

		function visit(node) {
			if (!node || !Array.isArray(node.children)) return;

			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];

				if (child.type === 'raw') {
					const parsed = parseRawLinkCard(child.value, cache);
					if (parsed) {
						node.children[i] = parsed;
					}
					continue;
				}

				if (child.type !== 'element') continue;

				if (child.tagName === 'p') {
					const text = extractText(child.children);
					const match = text.match(/^::link-card\{url="([^"]+)"(?:\s*,\s*style="([^"]+)")?\}$/);
					if (match) {
						node.children[i] = buildCardElement(match[1], match[2] || '', [], '', cache);
						continue;
					}
				}

				if (child.tagName === 'div') {
					const classes = getClasses(child.properties);
					const url = child.properties?.dataUrl ?? child.properties?.['data-url'];
					if (classes.includes('link-card') && typeof url === 'string' && url.trim()) {
						const rawStyle = child.properties?.dataStyle ?? child.properties?.['data-style'];
						node.children[i] = buildCardElement(
							url.trim(),
							typeof rawStyle === 'string' ? rawStyle : '',
							classes,
							extractText(child.children),
							cache,
						);
						continue;
					}
				}

				visit(child);
			}
		}

		visit(tree);
	};
}
