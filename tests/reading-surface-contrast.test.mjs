import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
	new URL('../src/styles/tailwind.css', import.meta.url),
	'utf8',
);

function extractBlock(selector) {
	const selectorStart = source.indexOf(selector);
	assert.notEqual(selectorStart, -1, `Missing selector: ${selector}`);

	const blockStart = source.indexOf('{', selectorStart);
	let depth = 0;
	for (let index = blockStart; index < source.length; index += 1) {
		if (source[index] === '{') depth += 1;
		if (source[index] === '}') depth -= 1;
		if (depth === 0) return source.slice(blockStart + 1, index);
	}

	throw new Error(`Unclosed block: ${selector}`);
}

function readOklch(block, token) {
	const match = block.match(new RegExp(`${token}:\\s*oklch\\((\\d*\\.?\\d+)\\s+(\\d*\\.?\\d+)\\s+(\\d*\\.?\\d+)\\)`));
	assert.ok(match, `Missing OKLCH token: ${token}`);
	return match.slice(1).map(Number);
}

function relativeLuminance([lightness, chroma, hue]) {
	const radians = hue * Math.PI / 180;
	const a = chroma * Math.cos(radians);
	const b = chroma * Math.sin(radians);
	const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	return 0.2126 * Math.max(0, Math.min(1, red))
		+ 0.7152 * Math.max(0, Math.min(1, green))
		+ 0.0722 * Math.max(0, Math.min(1, blue));
}

function contrastRatio(foreground, background) {
	const lighter = Math.max(foreground, background);
	const darker = Math.min(foreground, background);
	return (lighter + 0.05) / (darker + 0.05);
}

test('small faint text keeps AA contrast in the explicit light theme', () => {
	const light = extractBlock(':root[data-theme="light"] body.reading-surface');
	const whiteLuminance = 1;
	const lightFaint = relativeLuminance(readOklch(light, '--r-ink-faint'));

	assert.ok(
		contrastRatio(lightFaint, whiteLuminance) >= 4.5,
		'Light-theme faint text must reach 4.5:1 against white',
	);
});

test('small faint text keeps AA contrast in the explicit dark theme', () => {
	const dark = extractBlock(':root[data-theme="dark"] body.reading-surface');
	const darkBackground = relativeLuminance(readOklch(dark, '--r-bg'));
	const darkFaint = relativeLuminance(readOklch(dark, '--r-ink-faint'));

	assert.ok(
		contrastRatio(darkFaint, darkBackground) >= 4.5,
		'Dark-theme faint text must reach 4.5:1 against its background',
	);
});
