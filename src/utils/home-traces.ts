import fs from 'fs';
import path from 'path';
import { travelPlaces } from '../data/travel-places';

export type HomeTrace = {
	key: string;
	label: string;
	href: string;
	date: Date;
	summary: string;
};

/** Show specialty traces only when activity falls inside this window. */
const RECENT_MS = 180 * 24 * 60 * 60 * 1000;

function isRecent(date: Date, now = Date.now()): boolean {
	return now - date.valueOf() <= RECENT_MS && !Number.isNaN(date.valueOf());
}

function parseMonthDate(month: string): Date | null {
	const match = month.match(/^(\d{4})-(\d{2})$/);
	if (!match) return null;
	return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

function getTravelDateVal(d: string): string {
	const match = d.match(/\d{4}([-.]\d{2})?/);
	return match ? match[0].replace('.', '-') : '';
}

function loadMediaTrace(): HomeTrace | null {
	try {
		const dataPath = path.join(process.cwd(), 'src/data/neodb.json');
		if (!fs.existsSync(dataPath)) return null;

		const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Record<
			string,
			Array<{
				created_time?: string;
				item?: { display_title?: string; title?: string; category?: string };
			}>
		>;

		const entries = ['book', 'tv', 'movie', 'game'].flatMap((key) => data[key] || []);
		if (!entries.length) return null;

		const latest = entries
			.filter((entry) => entry.created_time)
			.sort(
				(a, b) =>
					new Date(b.created_time as string).valueOf() -
					new Date(a.created_time as string).valueOf(),
			)[0];

		if (!latest?.created_time) return null;

		const date = new Date(latest.created_time);
		if (!isRecent(date)) return null;

		const title = latest.item?.display_title || latest.item?.title || '最近标记';
		const kind =
			latest.item?.category === 'book'
				? '在读/标记'
				: latest.item?.category === 'tv'
					? '在追'
					: latest.item?.category === 'game'
						? '在玩'
						: '看过';

		return {
			key: 'media',
			label: '书影音',
			href: '/media',
			date,
			summary: `${kind} · ${title}`,
		};
	} catch (error) {
		console.warn('Failed to load media trace:', error);
		return null;
	}
}

function loadSportsTrace(): HomeTrace | null {
	try {
		const dataPath = path.join(process.cwd(), 'src/data/sports-stats.json');
		if (!fs.existsSync(dataPath)) return null;

		const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as {
			generatedAt?: string;
			running?: { monthly?: Array<{ month: string; distanceKm: string; count: number }> };
		};

		const monthly = data.running?.monthly?.[0];
		const monthDate = monthly ? parseMonthDate(monthly.month) : null;
		const generatedAt = data.generatedAt ? new Date(data.generatedAt) : null;
		const date = monthDate || generatedAt;
		if (!date || !isRecent(date)) return null;

		const summary = monthly
			? `${monthly.month} 跑量 ${monthly.distanceKm} km · ${monthly.count} 次`
			: '运动数据已更新';

		return {
			key: 'sports',
			label: '运动',
			href: '/sports',
			date,
			summary,
		};
	} catch (error) {
		console.warn('Failed to load sports trace:', error);
		return null;
	}
}

function loadTravelTrace(): HomeTrace | null {
	const visited = travelPlaces
		.filter((place) => !place.status)
		.map((place) => ({
			place,
			dateVal: getTravelDateVal(place.date),
		}))
		.filter((entry) => entry.dateVal)
		.sort((a, b) => b.dateVal.localeCompare(a.dateVal));

	const latest = visited[0];
	if (!latest) return null;

	const parts = latest.dateVal.split('-');
	const date =
		parts.length >= 2
			? new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
			: new Date(Number(parts[0]), 0, 1);

	if (!isRecent(date)) return null;

	return {
		key: 'travel',
		label: '旅行',
		href: '/travel',
		date,
		summary: `最近一站 · ${latest.place.name}（${latest.place.date}）`,
	};
}

function loadPhotographyTrace(): HomeTrace | null {
	try {
		const photoDir = path.join(process.cwd(), 'src/content/photography');
		if (!fs.existsSync(photoDir)) return null;

		let bestDate: Date | null = null;

		for (const filename of fs.readdirSync(photoDir)) {
			// Prefer shoot-date encoded in filename; skip mtime (unreliable after clone).
			const fromName = filename.match(/P(\d{4})(\d{2})(\d{2})/);
			if (!fromName) continue;

			const candidate = new Date(
				Number(fromName[1]),
				Number(fromName[2]) - 1,
				Number(fromName[3]),
			);

			if (!bestDate || candidate > bestDate) {
				bestDate = candidate;
			}
		}

		if (!bestDate || !isRecent(bestDate)) return null;

		return {
			key: 'photography',
			label: '摄影',
			href: '/photography',
			date: bestDate,
			summary: '图库有近照',
		};
	} catch (error) {
		console.warn('Failed to load photography trace:', error);
		return null;
	}
}

/** Specialty traces that have recent activity, newest first. */
export function getRecentHomeTraces(limit = 4): HomeTrace[] {
	return [loadMediaTrace(), loadSportsTrace(), loadTravelTrace(), loadPhotographyTrace()]
		.filter((trace): trace is HomeTrace => Boolean(trace))
		.sort((a, b) => b.date.valueOf() - a.date.valueOf())
		.slice(0, limit);
}
