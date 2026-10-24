import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const component = readFileSync(new URL('../src/components/LikeButton.astro', import.meta.url), 'utf8');
const script = component.match(/<script>([\s\S]*?)<\/script>/)[1].replace('(btn: Element)', '(btn)');

async function setup({ count = 0, liked = false, succeeds = true, post = true } = {}) {
	const classes = new Set(['like-btn', 'pending', post ? 'post' : 'gossip']);
	const attrs = new Map([['data-id', 'test-post']]);
	const storage = new Map(liked ? [['liked_test-post', 'true']] : []);
	const countSpan = { textContent: '...' };
	const label = post ? { textContent: '点赞' } : null;
	const events = {};
	const btn = {
		classList: {
			add: name => classes.add(name), remove: name => classes.delete(name),
			contains: name => classes.has(name),
			toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
		},
		querySelector: selector => selector === '.like-count' ? countSpan : label,
		getAttribute: name => attrs.get(name),
		setAttribute: (name, value) => attrs.set(name, value),
		removeAttribute: name => attrs.delete(name),
		hasAttribute: name => attrs.has(name),
		addEventListener: (name, callback) => { events[name] = callback; },
	};
	runInNewContext(`${script}\ninitLikes();`, {
		document: { readyState: 'loading', addEventListener() {}, querySelectorAll: () => [btn] },
		localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
		fetch: async (_url, options) => ({ ok: options ? succeeds : true, json: async () => ({ likes: count }) }),
	});
	await new Promise(resolve => setImmediate(resolve));
	return { classes, attrs, countSpan, label, events, storage };
}

test('zero-count article supports liking and cancelling with matching labels and counts', async () => {
	const ui = await setup();
	assert.equal(ui.classes.has('pending'), false);
	assert.equal(ui.classes.has('is-empty'), true);
	assert.equal(ui.label.textContent, '点赞');
	await ui.events.click();
	assert.equal(ui.label.textContent, '已点赞');
	assert.equal(ui.attrs.get('aria-pressed'), 'true');
	assert.equal(ui.countSpan.textContent, 1);
	assert.equal(ui.classes.has('is-empty'), false);
	await ui.events.click();
	assert.equal(ui.label.textContent, '点赞');
	assert.equal(ui.attrs.get('aria-pressed'), 'false');
	assert.equal(ui.countSpan.textContent, 0);
	assert.equal(ui.classes.has('is-empty'), true);
});

test('saved likes restore the pressed state and article label', async () => {
	const ui = await setup({ count: 12, liked: true });
	assert.equal(ui.label.textContent, '已点赞');
	assert.equal(ui.attrs.get('aria-label'), '取消点赞');
	assert.equal(ui.attrs.get('aria-pressed'), 'true');
	assert.equal(ui.countSpan.textContent, 12);
});

test('failed requests restore both article states and allow retrying', async () => {
	for (const liked of [false, true]) {
		const ui = await setup({ count: 12, liked, succeeds: false });
		await ui.events.click();
		assert.equal(ui.label.textContent, liked ? '已点赞' : '点赞');
		assert.equal(ui.attrs.get('aria-pressed'), String(liked));
		assert.equal(ui.countSpan.textContent, 12);
		assert.equal(ui.attrs.has('disabled'), false);
	}
});

test('memo buttons continue to work without an article label', async () => {
	const ui = await setup({ post: false });
	await ui.events.click();
	assert.equal(ui.classes.has('liked'), true);
	assert.equal(ui.countSpan.textContent, 1);
});
