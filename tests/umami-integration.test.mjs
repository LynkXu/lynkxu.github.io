import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const head = readFileSync(new URL('../src/components/BaseHead.astro', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const deployWorkflow = readFileSync(new URL('../.github/workflows/astro.yml', import.meta.url), 'utf8');

test('BaseHead loads Umami through public environment configuration only', () => {
	assert.match(head, /PUBLIC_UMAMI_WEBSITE_ID/);
	assert.match(head, /PUBLIC_UMAMI_SCRIPT_URL/);
	assert.doesNotMatch(head, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
	assert.match(head, /https:\/\/cloud\.umami\.is\/script\.js/);
	assert.match(head, /data-website-id=\{umamiWebsiteId\}/);
	assert.match(head, /src=\{umamiScriptSrc\}/);
});

test('Google Analytics is not loaded alongside Umami', () => {
	assert.doesNotMatch(head, /googletagmanager\.com/);
	assert.doesNotMatch(head, /\bgtag\b/);
	assert.doesNotMatch(head, /G-LS37X5G84N/);
});

test('README documents the Umami deployment environment variables', () => {
	assert.match(readme, /PUBLIC_UMAMI_WEBSITE_ID/);
	assert.match(readme, /PUBLIC_UMAMI_SCRIPT_URL/);
});

test('GitHub Pages build passes the Umami secret to Astro', () => {
	assert.match(deployWorkflow, /PUBLIC_UMAMI_WEBSITE_ID:\s*\$\{\{\s*secrets\.PUBLIC_UMAMI_WEBSITE_ID\s*\}\}/);
});
