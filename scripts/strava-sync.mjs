import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

const PATHS = {
  baseline: path.join(ROOT, 'src/data/strava/baseline.json'),
  state: path.join(ROOT, 'src/data/strava/state.json'),
  activities: path.join(ROOT, 'src/data/strava/activities.min.json'),
  outStats: path.join(ROOT, 'src/data/sports-stats.json'),
};

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function readJson(file, fallback) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function asSportType(a) {
  return (a.sport_type || a.type || '').toString();
}

function isRun(a) {
  const t = asSportType(a);
  return t === 'Run' || t === 'TrailRun' || t === 'VirtualRun' || t === 'Treadmill';
}

function isRide(a) {
  const t = asSportType(a);
  return t === 'Ride' || t === 'VirtualRide' || t === 'EBikeRide' || t === 'GravelRide';
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateYmdDot(dateLike) {
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}.${m}.${day}`;
}

function formatPaceSecPerKm(secPerKm) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return null;
  const total = Math.round(secPerKm);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}'${pad2(s)}''/km`;
}

function formatTimeMinTextFromSec(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return null;
  const total = Math.round(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${pad2(s)}`;
}

function parseBaselineTimeToSec(timeText) {
  if (!timeText) return null;
  const t = `${timeText}`.trim();
  if (!t) return null;

  // "59:01"
  if (t.includes(':')) {
    const [mm, ss] = t.split(':').map((x) => parseInt(x, 10));
    if (Number.isFinite(mm) && Number.isFinite(ss)) return mm * 60 + ss;
    return null;
  }

  // "27.31" (你的页面当前写法，按 27分31秒 解析)
  if (t.includes('.')) {
    const [mm, ss] = t.split('.').map((x) => parseInt(x, 10));
    if (Number.isFinite(mm) && Number.isFinite(ss)) return mm * 60 + ss;
    return null;
  }

  // fallback: treat as minutes
  const mm = parseInt(t, 10);
  return Number.isFinite(mm) ? mm * 60 : null;
}

function toFixedTrim(n, digits) {
  const s = n.toFixed(digits);
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

async function stravaRefreshAccessToken() {
  const client_id = mustGetEnv('STRAVA_CLIENT_ID');
  const client_secret = mustGetEnv('STRAVA_CLIENT_SECRET');
  const refresh_token = mustGetEnv('STRAVA_REFRESH_TOKEN');

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token refresh failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  if (!json.access_token) throw new Error('Strava token refresh response missing access_token');
  return json.access_token;
}

async function fetchActivities({ accessToken, afterEpoch }) {
  const out = [];
  const per_page = 200;
  const maxPages = 20; // hard stop，避免异常情况下无限分页

  for (let page = 1; page <= maxPages; page++) {
    const url = new URL('https://www.strava.com/api/v3/athlete/activities');
    url.searchParams.set('per_page', String(per_page));
    url.searchParams.set('page', String(page));
    if (afterEpoch && afterEpoch > 0) url.searchParams.set('after', String(afterEpoch));

    const res = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Strava activities fetch failed: ${res.status} ${text}`);
    }
    const arr = await res.json();
    if (!Array.isArray(arr)) throw new Error('Strava activities response is not an array');
    out.push(...arr);
    if (arr.length < per_page) break;
  }

  return out;
}

function minimizeActivity(a) {
  return {
    id: a.id,
    sport_type: a.sport_type || a.type,
    name: a.name,
    start_date: a.start_date, // UTC ISO
    start_date_local: a.start_date_local,
    distance_m: a.distance ?? null,
    moving_time_s: a.moving_time ?? null,
    elapsed_time_s: a.elapsed_time ?? null,
    total_elevation_gain_m: a.total_elevation_gain ?? null,
    calories_kcal: a.calories ?? null,
  };
}

function computeSportsStats({ baseline, activities }) {
  const runs = activities.filter(isRun);
  const rides = activities.filter(isRide);

  const sum = (arr, pick) => arr.reduce((acc, x) => acc + (Number(pick(x)) || 0), 0);

  // --- running totals (baseline + strava)
  const runDistanceKm = (baseline.running?.totalDistanceKm || 0) + sum(runs, (a) => a.distance_m) / 1000;

  // --- cycling totals (baseline + strava)
  const rideDistanceKm = (baseline.cycling?.totalDistanceKm || 0) + sum(rides, (a) => a.distance_m) / 1000;
  const rideTimeH = (baseline.cycling?.totalMovingTimeHours || 0) + sum(rides, (a) => a.moving_time_s) / 3600;
  const rideCount = (baseline.cycling?.totalCount || 0) + rides.length;
  const rideCalories = (baseline.cycling?.totalCaloriesKcal || 0) + sum(rides, (a) => a.calories_kcal);

  // --- running PR: farthest (baseline vs strava)
  const baselineFarthest = baseline.running?.best?.farthest;
  const baselineFarthestKm = Number(baselineFarthest?.distanceKm || 0);
  const bestRun = runs.reduce(
    (best, a) => {
      const km = (Number(a.distance_m) || 0) / 1000;
      return km > (best?.km ?? 0) ? { a, km } : best;
    },
    null,
  );
  const bestRunKm = bestRun?.km ?? 0;

  let farthestValue = `${toFixedTrim(baselineFarthestKm, 1)}`;
  let farthestSubtext = baselineFarthest
    ? `${baselineFarthest.paceText} @${baselineFarthest.dateText}`
    : null;

  if (bestRun && bestRunKm > baselineFarthestKm) {
    const a = bestRun.a;
    const km = bestRunKm;
    const secPerKm = (Number(a.moving_time_s) || 0) / clamp(km, 0.001, 1e9);
    const pace = formatPaceSecPerKm(secPerKm);
    const date = formatDateYmdDot(a.start_date_local || a.start_date);
    farthestValue = `${toFixedTrim(km, km >= 10 ? 1 : 2)}`;
    farthestSubtext = pace ? `${pace} @${date}` : `@${date}`;
  }

  // --- 5K/10K: only compare if we can parse baseline and we find near-exact activities
  const baseline5k = baseline.running?.best?.best5k;
  const baseline10k = baseline.running?.best?.best10k;
  const baseline5kSec = parseBaselineTimeToSec(baseline5k?.timeText);
  const baseline10kSec = parseBaselineTimeToSec(baseline10k?.timeText);

  const findBestForDistance = (targetKm, toleranceKm) => {
    let best = null;
    for (const a of runs) {
      const km = (Number(a.distance_m) || 0) / 1000;
      if (Math.abs(km - targetKm) > toleranceKm) continue;
      const t = Number(a.moving_time_s) || 0;
      if (t <= 0) continue;
      if (!best || t < best.timeSec) {
        best = { a, km, timeSec: t, paceSecPerKm: t / clamp(km, 0.001, 1e9) };
      }
    }
    return best;
  };

  const best5k = findBestForDistance(5, 0.08);
  const best10k = findBestForDistance(10, 0.12);

  const best5kChosen =
    best5k && baseline5kSec != null ? (best5k.timeSec < baseline5kSec ? best5k : null) : null;
  const best10kChosen =
    best10k && baseline10kSec != null ? (best10k.timeSec < baseline10kSec ? best10k : null) : null;

  const best5kValue = best5kChosen ? formatTimeMinTextFromSec(best5kChosen.timeSec) : baseline5k?.timeText ?? '';
  const best5kUnit = baseline5k?.unit ?? 'min';
  const best5kSub = best5kChosen
    ? `${formatPaceSecPerKm(best5kChosen.paceSecPerKm)} @${formatDateYmdDot(best5kChosen.a.start_date_local || best5kChosen.a.start_date)}`
    : baseline5k?.paceText ?? '';

  const best10kValue = best10kChosen ? formatTimeMinTextFromSec(best10kChosen.timeSec) : baseline10k?.timeText ?? '';
  const best10kUnit = baseline10k?.unit ?? 'min';
  const best10kSub = best10kChosen
    ? `${formatPaceSecPerKm(best10kChosen.paceSecPerKm)} @${formatDateYmdDot(best10kChosen.a.start_date_local || best10kChosen.a.start_date)}`
    : baseline10k?.paceText ?? '';

  const cyclingAvgKmPerRide = rideCount > 0 ? rideDistanceKm / rideCount : 0;

  return {
    generatedAt: new Date().toISOString(),
    running: {
      cards: {
        totalDistance: {
          label: `总跑量(${baseline.running?.sinceLabel || '累计'})`,
          value: toFixedTrim(runDistanceKm, 2),
          unit: 'km',
          subtext: baseline.running?.avgPaceText || null,
        },
        farthest: {
          label: '最远距离',
          value: farthestValue,
          unit: 'km',
          subtext: farthestSubtext,
        },
        best5k: {
          label: '5K 最快',
          value: best5kValue,
          unit: best5kUnit,
          subtext: best5kSub,
        },
        best10k: {
          label: '10K 最快',
          value: best10kValue,
          unit: best10kUnit,
          subtext: best10kSub,
        },
      },
    },
    cycling: {
      cards: {
        totalDistance: {
          label: '总里程',
          value: toFixedTrim(rideDistanceKm, 2),
          unit: 'km',
          subtext: '历史累计',
        },
        totalTime: {
          label: '总时长',
          value: toFixedTrim(rideTimeH, 2),
          unit: 'h',
          subtext: '在路上的时间',
        },
        totalCount: {
          label: '累计次数',
          value: `${Math.trunc(rideCount)}`,
          unit: '次',
          subtext: rideCount > 0 ? `~${toFixedTrim(cyclingAvgKmPerRide, 1)} km/次` : null,
        },
        totalCalories: {
          label: '总热量',
          value: `${Math.trunc(rideCalories)}`,
          unit: 'kcal',
          subtext: 'Burn it up!',
        },
      },
    },
  };
}

async function main() {
  const baseline = await readJson(PATHS.baseline, {});
  const state = await readJson(PATHS.state, { lastSyncEpoch: 0, updatedAt: null });
  const cachedActivities = await readJson(PATHS.activities, []);

  const afterEpochFromState = Number(state.lastSyncEpoch) || 0;
  const afterEpoch =
    afterEpochFromState > 0
      ? afterEpochFromState
      : Number(process.env.STRAVA_INITIAL_AFTER_EPOCH || 0) || 0;

  const accessToken = await stravaRefreshAccessToken();
  const fresh = await fetchActivities({ accessToken, afterEpoch });

  const map = new Map();
  for (const a of cachedActivities) map.set(a.id, a);
  for (const a of fresh) map.set(a.id, minimizeActivity(a));

  const merged = Array.from(map.values()).filter((a) => a && a.id);
  merged.sort((a, b) => {
    const da = new Date(a.start_date || 0).getTime();
    const db = new Date(b.start_date || 0).getTime();
    return db - da;
  });

  // next sync point: newest activity time - 60s (避免边界漏数据)
  const newest = merged[0];
  const newestEpoch = newest?.start_date ? Math.floor(new Date(newest.start_date).getTime() / 1000) : 0;
  const nextAfterEpoch = newestEpoch > 0 ? Math.max(0, newestEpoch - 60) : afterEpochFromState;

  const stats = computeSportsStats({ baseline, activities: merged });

  await writeJson(PATHS.activities, merged);
  await writeJson(PATHS.state, { lastSyncEpoch: nextAfterEpoch, updatedAt: new Date().toISOString() });
  await writeJson(PATHS.outStats, stats);

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        fetched: fresh.length,
        cached_before: cachedActivities.length,
        cached_after: merged.length,
        nextAfterEpoch,
        generatedAt: stats.generatedAt,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


