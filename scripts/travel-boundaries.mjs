import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { travelPlaces } from '../src/data/travel-places.ts';

const DATAV_BOUNDARY_ROOT = 'https://geo.datav.aliyun.com/areas_v3/bound';
const DEFAULT_DIRECTORY = fileURLToPath(new URL('../public/travel-boundaries/', import.meta.url));

function uniqueAdminCodes(adminCodes) {
	return [...new Set(adminCodes.filter((code) => /^\d{6}$/.test(code)))];
}

export async function inspectTravelBoundaryCache({ adminCodes, directory = DEFAULT_DIRECTORY }) {
	const missing = [];
	const invalid = [];

	for (const adminCode of uniqueAdminCodes(adminCodes)) {
		const filename = path.join(directory, `${adminCode}.json`);
		try {
			const geometry = JSON.parse(await readFile(filename, 'utf8'));
			if (geometry?.type !== 'FeatureCollection' || !Array.isArray(geometry.features)) {
				invalid.push(adminCode);
			}
		} catch (error) {
			if (error?.code === 'ENOENT') missing.push(adminCode);
			else invalid.push(adminCode);
		}
	}

	return { missing, invalid };
}

export async function syncTravelBoundaries({
	adminCodes,
	directory = DEFAULT_DIRECTORY,
	fetchImpl = globalThis.fetch,
}) {
	await mkdir(directory, { recursive: true });
	const downloaded = [];
	const skipped = [];

	for (const adminCode of uniqueAdminCodes(adminCodes)) {
		const filename = path.join(directory, `${adminCode}.json`);
		try {
			await access(filename);
			skipped.push(adminCode);
			continue;
		} catch {
			// Missing files are downloaded below.
		}

		const response = await fetchImpl(`${DATAV_BOUNDARY_ROOT}/${adminCode}.json`);
		if (!response.ok) {
			throw new Error(`Failed to download boundary ${adminCode}: HTTP ${response.status}`);
		}
		const geometry = await response.json();
		if (geometry?.type !== 'FeatureCollection' || !Array.isArray(geometry.features)) {
			throw new Error(`Boundary ${adminCode} is not a GeoJSON FeatureCollection`);
		}
		await writeFile(filename, `${JSON.stringify(geometry)}\n`, 'utf8');
		downloaded.push(adminCode);
	}

	return { downloaded, skipped };
}

async function main() {
	const adminCodes = travelPlaces.flatMap((place) => place.adminCode ? [place.adminCode] : []);
	if (process.argv.includes('--check')) {
		const result = await inspectTravelBoundaryCache({ adminCodes });
		if (result.missing.length || result.invalid.length) {
			throw new Error([
				result.missing.length ? `missing: ${result.missing.join(', ')}` : '',
				result.invalid.length ? `invalid: ${result.invalid.join(', ')}` : '',
			].filter(Boolean).join('; '));
		}
		console.log(`Verified ${uniqueAdminCodes(adminCodes).length} travel boundary files.`);
		return;
	}

	const result = await syncTravelBoundaries({ adminCodes });
	console.log(`Downloaded ${result.downloaded.length}; cached ${result.skipped.length}.`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	});
}
