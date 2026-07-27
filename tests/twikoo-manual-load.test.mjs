import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const commentsSource = readFileSync(new URL('../src/components/Comments.astro', import.meta.url), 'utf8');
const inlineScript = commentsSource.match(/<script is:inline[^>]*>\n([\s\S]*?)\n<\/script>/)?.[1];

assert.ok(inlineScript, 'Comments.astro inline Twikoo script should be extractable');

function createElementStub() {
	return {
		dataset: {},
		hidden: false,
		innerHTML: '',
		textContent: '',
		disabled: false,
		onclick: null,
		focus() {
			this.focused = true;
		},
		addEventListener() {},
		appendChild() {},
		remove() {
			this.removed = true;
		},
		querySelector(selector) {
			if (selector === '.twikoo-lazygate__meta') return this.messageEl;
			return null;
		},
	};
}

function createStorage(initialEntries = []) {
	const store = new Map(initialEntries);
	return {
		getItem(key) {
			return store.has(key) ? store.get(key) : null;
		},
		setItem(key, value) {
			store.set(key, String(value));
		},
		removeItem(key) {
			store.delete(key);
		},
		has(key) {
			return store.has(key);
		},
	};
}

async function runCommentsScript({ sessionEntries = [] } = {}) {
	const initCalls = [];
	const shell = createElementStub();
	const lazyGate = createElementStub();
	const loadButton = createElementStub();
	const twikooEl = createElementStub();
	const messageEl = createElementStub();
	lazyGate.messageEl = messageEl;

	const listeners = new Map();
	const sessionStorage = createStorage(sessionEntries);
	const document = {
		readyState: 'complete',
		body: {
			appendChild(script) {
				script.onload?.();
			},
		},
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},
		createElement() {
			return createElementStub();
		},
		getElementById(id) {
			return {
				twikoo: twikooEl,
				'twikoo-lazygate': lazyGate,
				'twikoo-load-button': loadButton,
			}[id] || null;
		},
		querySelector(selector) {
			if (selector === '.twikoo-shell') return shell;
			if (selector === '#twikoo .el-textarea__inner') return null;
			if (selector.startsWith('script[data-twikoo-script=')) return null;
			return null;
		},
		querySelectorAll() {
			return [];
		},
	};
	const window = {
		document,
		location: {
			pathname: '/message',
		},
		sessionStorage,
		twikoo: {
			init(options) {
				initCalls.push(options);
			},
		},
		clearInterval() {},
		setInterval() {
			return 1;
		},
		setTimeout(callback) {
			callback();
			return 1;
		},
	};
	const context = {
		console,
		document,
		window,
		HTMLElement: class HTMLElement {},
		MutationObserver: class MutationObserver {
			disconnect() {}
			observe() {}
		},
		setTimeout: window.setTimeout,
		manualTwikooLoad: true,
		twikooEnv: 'https://example.com/.netlify/functions/twikoo',
		twikooAuthors: ['lynkxu'],
		embedUrl: 'https://lynkxu.github.io/message',
	};

	vm.runInNewContext(inlineScript, context);
	await Promise.resolve();
	await Promise.resolve();

	return { initCalls, loadButton, sessionStorage };
}

test('manual Twikoo load stores a page-scoped session activation after click', async () => {
	const { loadButton, sessionStorage } = await runCommentsScript();

	loadButton.onclick();
	await Promise.resolve();
	await Promise.resolve();

	assert.equal(sessionStorage.getItem('twikoo:manual-loaded:/message'), 'true');
});

test('manual Twikoo load restores page-scoped session activation after refresh', async () => {
	const { initCalls } = await runCommentsScript({
		sessionEntries: [['twikoo:manual-loaded:/message', 'true']],
	});

	assert.equal(initCalls.length, 1);
	assert.equal(initCalls[0].el, '#twikoo');
});
