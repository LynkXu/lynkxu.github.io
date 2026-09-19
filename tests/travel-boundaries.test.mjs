import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

async function loadBoundaryModule() {
	try {
		return await import('../scripts/travel-boundaries.mjs');
	} catch {
		assert.fail('travel boundary synchronization must be implemented');
	}
}

test('syncs only missing travel boundary files into the static cache', async (t) => {
	const { syncTravelBoundaries } = await loadBoundaryModule();
	const directory = await mkdtemp(path.join(os.tmpdir(), 'travel-boundaries-'));
	t.after(async () => {
		const { rm } = await import('node:fs/promises');
		await rm(directory, { recursive: true, force: true });
	});

	await writeFile(path.join(directory, '500000.json'), '{"type":"FeatureCollection","features":[]}');
	const requested = [];
	const fetchImpl = async (url) => {
		requested.push(url);
		return new Response('{"type":"FeatureCollection","features":[{"id":"510100"}]}');
	};

	const result = await syncTravelBoundaries({
		adminCodes: ['510100', '500000', '510100'],
		directory,
		fetchImpl,
	});

	assert.deepEqual(result, { downloaded: ['510100'], skipped: ['500000'] });
	assert.deepEqual(requested, ['https://geo.datav.aliyun.com/areas_v3/bound/510100.json']);
	assert.deepEqual(
		JSON.parse(await readFile(path.join(directory, '510100.json'), 'utf8')),
		{ type: 'FeatureCollection', features: [{ id: '510100' }] },
	);
});

test('cache validation reports missing and malformed boundary files', async (t) => {
	const { inspectTravelBoundaryCache } = await loadBoundaryModule();
	const directory = await mkdtemp(path.join(os.tmpdir(), 'travel-boundaries-check-'));
	t.after(async () => {
		const { rm } = await import('node:fs/promises');
		await rm(directory, { recursive: true, force: true });
	});

	await writeFile(path.join(directory, '500000.json'), 'not-json');
	await writeFile(path.join(directory, '510100.json'), '{"type":"FeatureCollection","features":[]}');

	assert.deepEqual(
		await inspectTravelBoundaryCache({
			adminCodes: ['500000', '510100', '310000'],
			directory,
		}),
		{ missing: ['310000'], invalid: ['500000'] },
	);
});
