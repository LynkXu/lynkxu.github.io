import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import sharp from 'sharp';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

test('avatar configuration uses responsive 112px and 224px WebP sources', async () => {
	const config = read('src/consts.ts');
	const about = read('src/layouts/About.astro');
	const memos = read('src/layouts/Shuoshuo.astro');
	const mockupGenerator = read('docs/design-mockups/generate-designs.mjs');

	assert.match(config, /export const AVATAR_IMAGE/);
	assert.match(config, /src: ['"]https:\/\/images\.lynkxu\.com\/avatar-112\.webp['"]/);
	assert.match(config, /srcset: ['"]https:\/\/images\.lynkxu\.com\/avatar-112\.webp 112w, https:\/\/images\.lynkxu\.com\/avatar-224\.webp 224w['"]/);

	for (const [file, width] of [['public/avatar-112.webp', 112], ['public/avatar-224.webp', 224]]) {
		const url = new URL(`../${file}`, import.meta.url);
		assert.equal(existsSync(url), true, `${file} must exist`);
		const metadata = await sharp(fileURLToPath(url)).metadata();
		assert.equal(metadata.format, 'webp');
		assert.equal(metadata.width, width);
		assert.equal(metadata.height, width);
		assert.ok(statSync(url).size < 20 * 1024);
	}

	assert.match(about, /import \{ AVATAR_IMAGE \} from ['"]\.\.\/consts['"]/);
	assert.match(about, /src=\{AVATAR_IMAGE\.src\}/);
	assert.match(about, /srcset=\{AVATAR_IMAGE\.srcset\}/);
	assert.match(about, /sizes="72px"/);
	assert.match(about, /width="72"/);
	assert.match(about, /height="72"/);
	assert.match(memos, /class="r-memo__avatar"[\s\S]*src="\/avatar-112\.webp"/);
	assert.match(memos, /width="112"/);
	assert.match(memos, /height="112"/);

	assert.match(mockupGenerator, /imageData\(['"]public\/avatar-224\.webp['"]\)/);
	assert.doesNotMatch(config + about + memos + mockupGenerator, /(?:ava[234]|avatar)\.png/);
	for (const file of ['public/ava2.png', 'public/ava3.png', 'public/ava4.png', 'public/avatar.png']) {
		assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), false);
	}
});

test('favicon is a compact 64px PNG', async () => {
	const file = new URL('../public/favicon-64.png', import.meta.url);
	assert.equal(existsSync(file), true, 'public/favicon-64.png must exist');
	const metadata = await sharp(fileURLToPath(file)).metadata();
	const head = read('src/components/BaseHead.astro');

	assert.equal(metadata.format, 'png');
	assert.equal(metadata.width, 64);
	assert.equal(metadata.height, 64);
	assert.ok(statSync(file).size < 20 * 1024);
	assert.match(head, /<link rel=['"]icon['"] type=['"]image\/png['"] href=['"]\/favicon-64\.png['"] sizes=['"]64x64['"] \/>/);
	assert.doesNotMatch(head, /favicon\.ico/);
	assert.equal(existsSync(new URL('../public/favicon.ico', import.meta.url)), false);
});
