import assert from 'node:assert/strict';
import test from 'node:test';

async function loadProgressCalculator() {
	return import('../src/scripts/reading-progress.mjs');
}

test('reading progress measures only the article body', async () => {
	const { calculateReadingProgress } = await loadProgressCalculator();

	assert.equal(calculateReadingProgress(400, 400, 1600, 800), 0);
	assert.equal(calculateReadingProgress(800, 400, 1600, 800), 0.5);
	assert.equal(calculateReadingProgress(1200, 400, 1600, 800), 1);
});

test('reading progress remains within zero and one', async () => {
	const { calculateReadingProgress } = await loadProgressCalculator();

	assert.equal(calculateReadingProgress(0, 400, 1600, 800), 0);
	assert.equal(calculateReadingProgress(1600, 400, 1600, 800), 1);
});

test('reading progress is omitted when the article fits in the viewport', async () => {
	const { calculateReadingProgress } = await loadProgressCalculator();

	assert.equal(calculateReadingProgress(400, 400, 700, 800), null);
});
