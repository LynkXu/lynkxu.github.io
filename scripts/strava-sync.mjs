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

function formatMonthKey(dateLike) {
  const d = new Date(dateLike);
  if (!Number.isFinite(d.getTime())) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function parseSinceMonth(sinceLabel) {
  const match = String(sinceLabel || '').match(/(\d{4})[.-](\d{1,2})/);
  if (!match) return null;
  return `${match[1]}-${pad2(Number(match[2]))}`;
}

function isOnOrAfterMonth(activity, startMonth) {
  if (!startMonth) return true;
  const month = formatMonthKey(activity.start_date_local || activity.start_date);
  return month ? month >= startMonth : false;
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
  return { accessToken: json.access_token, athleteId: json.athlete?.id ?? null };
}

async function fetchAthleteStats({ accessToken, athleteId }) {
  if (!athleteId) return null;
  const url = `https://www.strava.com/api/v3/athletes/${athleteId}/stats`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava athlete stats fetch failed: ${res.status} ${text}`);
  }
  return await res.json();
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

async function fetchActivityDetail({ accessToken, activityId }) {
  const url = `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=false`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava activity detail fetch failed: ${res.status} ${text}`);
  }
  return await res.json();
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
    kilojoules_kj: a.kilojoules ?? null,
    average_speed_mps: a.average_speed ?? null,
    max_speed_mps: a.max_speed ?? null,
    average_temp_c: a.average_temp ?? null,
    average_watts: a.average_watts ?? null,
    has_heartrate: a.has_heartrate ?? null,
    average_heartrate: a.average_heartrate ?? null,
    max_heartrate: a.max_heartrate ?? null,
    device_name: a.device_name ?? null,
    trainer: a.trainer ?? null,
    commute: a.commute ?? null,
    // internal: avoid re-fetching details for the same activity over and over
    detail_attempted: a.detail_attempted ?? false,
  };
}

function parsePaceToSeconds(paceText) {
  if (!paceText) return 0;
  const match = paceText.match(/(\d+)'(\d+)''/);
  if (!match) return 0;
  const m = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  return m * 60 + s;
}

function computeSportsStats({ baseline, activities, athleteStats }) {
  const allRuns = activities.filter(isRun);
  const runningSinceMonth = parseSinceMonth(baseline?.running?.sinceLabel);
  const runs = runningSinceMonth
    ? allRuns.filter((a) => isOnOrAfterMonth(a, runningSinceMonth))
    : allRuns;
  const rides = activities.filter(isRide);

  const sum = (arr, pick) => arr.reduce((acc, x) => acc + (Number(pick(x)) || 0), 0);

  const computeBaselineRunning = (baselineRunning) => {
    const sinceLabel = baselineRunning?.sinceLabel ?? null;
    const avgPaceText = baselineRunning?.avgPaceText ?? null;
    const monthly = Array.isArray(baselineRunning?.monthly) ? baselineRunning.monthly : null;

    // Preferred: monthly baseline (has real month breakdown)
    if (monthly && monthly.length > 0) {
      const dist = monthly.reduce((acc, x) => acc + (Number(x.distanceKm) || 0), 0);
      const timeFromMonthly = monthly.reduce((acc, x) => acc + (Number(x.movingTimeHours) || 0), 0);

      // If monthly rows lack time, fall back to avg pace
      const paceSec = parsePaceToSeconds(avgPaceText);
      const timeFromPace = paceSec > 0 ? (dist * paceSec) / 3600 : 0;
      const time = timeFromMonthly > 0 ? timeFromMonthly : timeFromPace;

      return { sinceLabel, avgPaceText, distanceKm: dist, timeHours: time, hasMonthly: true };
    }

    // Legacy: aggregate baseline only (no month breakdown)
    const dist = Number(baselineRunning?.totalDistanceKm || 0);
    const paceSec = parsePaceToSeconds(avgPaceText);
    const time = paceSec > 0 ? (dist * paceSec) / 3600 : 0;
    return { sinceLabel, avgPaceText, distanceKm: dist, timeHours: time, hasMonthly: false };
  };

  const baselineRun = computeBaselineRunning(baseline?.running);

  // --- totals
  // 总计优先用 athlete stats（与活动列表是不同 API，且更“官方总计”）
  const statsAllRun = athleteStats?.all_run_totals ?? null;
  const statsAllRide = athleteStats?.all_ride_totals ?? null;
  const runActivityDistanceKm = sum(runs, (a) => a.distance_m) / 1000;
  const runActivityTimeH = sum(runs, (a) => a.moving_time_s) / 3600;
  const canUseRunAthleteTotals = !runningSinceMonth;

  // 跑步：仍然需要加上 baseline（你已有历史跑量/PR）
  const runDistanceKm =
    (baselineRun.distanceKm || 0) +
    (canUseRunAthleteTotals && statsAllRun?.distance != null
      ? Number(statsAllRun.distance) / 1000
      : runActivityDistanceKm);

  const runTimeH =
    (baselineRun.timeHours || 0) +
    (canUseRunAthleteTotals && statsAllRun?.moving_time != null
      ? Number(statsAllRun.moving_time) / 3600
      : runActivityTimeH);

  // 骑行：完全依赖 Strava（不加 baseline）
  const rideDistanceKm =
    statsAllRide?.distance != null ? Number(statsAllRide.distance) / 1000 : sum(rides, (a) => a.distance_m) / 1000;
  const rideTimeH =
    statsAllRide?.moving_time != null ? Number(statsAllRide.moving_time) / 3600 : sum(rides, (a) => a.moving_time_s) / 3600;
  const rideCount = statsAllRide?.count != null ? Number(statsAllRide.count) : rides.length;

  // 热量：athlete stats 里没有 calories；尽可能从 Strava 活动数据获得（calories 优先，其次用 kJ 换算）
  const rideCalories = sum(rides, (a) => {
    if (a.calories_kcal != null) return a.calories_kcal;
    if (a.kilojoules_kj != null) return Number(a.kilojoules_kj) * 0.239006;
    return 0;
  });

  // --- cycling PR: farthest ride (from activities; stats API doesn't provide this)
  const bestRide = rides.reduce(
    (best, a) => {
      const km = (Number(a.distance_m) || 0) / 1000;
      return km > (best?.km ?? 0) ? { a, km } : best;
    },
    null,
  );
  const bestRideKm = bestRide?.km ?? 0;
  const bestRideDate = bestRide?.a
    ? formatDateYmdDot(bestRide.a.start_date_local || bestRide.a.start_date)
    : null;
  const bestRideAvgKmh = bestRide?.a?.average_speed_mps
    ? (Number(bestRide.a.average_speed_mps) || 0) * 3.6
    : null;
  const bestRideSubtext = bestRideDate
    ? bestRideAvgKmh
      ? `~${toFixedTrim(bestRideAvgKmh, 1)} km/h @${bestRideDate}`
      : `@${bestRideDate}`
    : null;

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

  const groupMonthly = (arr, baselineData = null) => {
    const m = new Map();

    for (const a of arr) {
      const key = formatMonthKey(a.start_date_local || a.start_date);
      if (!key) continue;
      const prev = m.get(key) || { month: key, distanceKm: 0, count: 0, movingTimeHours: 0 };
      prev.distanceKm += (Number(a.distance_m) || 0) / 1000;
      prev.movingTimeHours += (Number(a.moving_time_s) || 0) / 3600;
      prev.count += 1;
      m.set(key, prev);
    }

    // Merge baseline monthly breakdown ONLY if provided
    const baselineMonthly = Array.isArray(baselineData?.monthly) ? baselineData.monthly : null;
    if (baselineMonthly && baselineMonthly.length > 0) {
      for (const row of baselineMonthly) {
        const key = String(row.month || '').trim();
        if (!key) continue;
        const prev = m.get(key) || { month: key, distanceKm: 0, count: 0, movingTimeHours: 0 };
        prev.distanceKm += Number(row.distanceKm) || 0;
        prev.movingTimeHours += Number(row.movingTimeHours) || 0;
        prev.count += Number(row.count) || 0;
        m.set(key, prev);
      }
    }

    const out = Array.from(m.values());
    out.sort((a, b) => (a.month < b.month ? 1 : -1));
    return out.map((x) => ({
      month: x.month,
      distanceKm: toFixedTrim(x.distanceKm, 2),
      count: x.count,
      movingTimeHours: toFixedTrim(x.movingTimeHours, 2),
    }));
  };

  const computeYearlyStats = (activities, baselineData = null) => {
    const years = {};
    const getYear = (dateStr) => formatMonthKey(dateStr)?.slice(0, 4) ?? null;
    
    // Process activities
    for (const a of activities) {
      const y = getYear(a.start_date_local || a.start_date);
      if (!y) continue;
      if (!years[y]) years[y] = { distance: 0, time: 0, count: 0 };
      years[y].distance += (Number(a.distance_m) || 0) / 1000;
      years[y].time += (Number(a.moving_time_s) || 0) / 3600;
      years[y].count += 1;
    }

    // Process baseline (prefer monthly breakdown if present; otherwise treat as aggregate)
    if (baselineData) {
      const baselineMonthly = Array.isArray(baselineData.monthly) ? baselineData.monthly : null;
      if (baselineMonthly && baselineMonthly.length > 0) {
        for (const row of baselineMonthly) {
          const month = String(row.month || '').trim();
          if (!month || month.length < 7) continue;
          const y = month.slice(0, 4);
          if (!years[y]) years[y] = { distance: 0, time: 0, count: 0 };
          years[y].distance += Number(row.distanceKm) || 0;
          years[y].time += Number(row.movingTimeHours) || 0;
          years[y].count += Number(row.count) || 0;
        }
      } else {
        const bDist = Number(baselineData.totalDistanceKm || 0);
        const bPace = parsePaceToSeconds(baselineData.avgPaceText);
        const bTime = bPace > 0 ? (bDist * bPace) / 3600 : 0;

        // Fallback: put aggregate baseline into the year derived from sinceLabel (e.g. "2025.06起")
        const sinceLabel = String(baselineData.sinceLabel || '');
        const yearMatch = sinceLabel.match(/(\d{4})\./);
        const y = yearMatch?.[1] || '2025';
        if (!years[y]) years[y] = { distance: 0, time: 0, count: 0 };
        years[y].distance += bDist;
        years[y].time += bTime;
      }
    }

    // Format output
    const out = {};
    Object.keys(years).sort().reverse().forEach(y => {
      out[y] = {
        distance: toFixedTrim(years[y].distance, 2),
        time: toFixedTrim(years[y].time, 1),
        count: years[y].count
      };
    });
    return out;
  };

  const runYears = computeYearlyStats(runs, baseline.running);
  const rideYears = computeYearlyStats(rides); // No baseline for cycling logic in original script? 
  // Wait, original script had: cycling statsAllRide (totals) but no baseline file usage for cycling separate from stats.
  // Actually baseline.json HAS cycling data: "totalDistanceKm": 1455.36
  // But original script logic was:
  // "骑行：完全依赖 Strava（不加 baseline）" -> "const rideDistanceKm = statsAllRide?.distance ..."
  // However, statsAllRide comes from Strava "All Time" stats.
  // To get yearly breakdown including historical non-strava data if any, we'd need it.
  // But since the comment says "Depend entirely on Strava", I will stick to activities for the yearly breakdown.
  // NOTE: Strava API "statsAllRide" gives TOTALs. Individual activities give yearly data.
  // If Strava has all history, summing activities = total.
  
  return {
    generatedAt: new Date().toISOString(),
    running: {
      years: runYears,
      imported: {
        sinceLabel: baselineRun.sinceLabel,
        distanceKm: toFixedTrim(baselineRun.distanceKm || 0, 2),
        timeHours: toFixedTrim(baselineRun.timeHours || 0, 2),
        avgPaceText: baselineRun.avgPaceText,
        hasMonthly: !!baselineRun.hasMonthly,
      },
      cards: {
        totalDistance: {
          label: `总跑量(${baseline.running?.sinceLabel || '累计'})`,
          value: toFixedTrim(runDistanceKm, 2),
          unit: 'km',
          subtext: baseline.running?.avgPaceText || null,
        },
        totalTime: {
          label: '总时长',
          value: toFixedTrim(runTimeH, 1),
          unit: 'h',
          subtext: '在路上的时间',
        },
        halfMarathon: {
          label: '半马 PB',
          value: '--',
          unit: '',
          subtext: '暂无记录',
        },
        fullMarathon: {
          label: '全马 PB',
          value: '--',
          unit: '',
          subtext: '暂无记录',
        },
      },
      monthly: groupMonthly(runs, baseline.running),
    },
    cycling: {
      years: rideYears,
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
        farthest: {
          label: '最长骑行距离',
          value: toFixedTrim(bestRideKm, bestRideKm >= 100 ? 1 : 2),
          unit: 'km',
          subtext: bestRideSubtext,
        },
      },
      monthly: groupMonthly(rides),
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

  const { accessToken, athleteId } = await stravaRefreshAccessToken();
  const athleteStats = await fetchAthleteStats({ accessToken, athleteId });
  const fresh = await fetchActivities({ accessToken, afterEpoch });
  const freshIds = new Set(fresh.map((a) => a?.id).filter(Boolean));

  const map = new Map();
  for (const a of cachedActivities) map.set(a.id, a);
  for (const a of fresh) map.set(a.id, minimizeActivity(a));

  const merged = Array.from(map.values()).filter((a) => a && a.id);
  merged.sort((a, b) => {
    const da = new Date(a.start_date || 0).getTime();
    const db = new Date(b.start_date || 0).getTime();
    return db - da;
  });

  // 尽可能补齐热量：对缺少 calories/kJ 的活动，按需拉活动详情（有上限，避免过多请求）
  const detailMax = Number(process.env.STRAVA_DETAIL_MAX || 30);
  let detailFetched = 0;
  if (detailMax > 0) {
    for (const a of merged) {
      if (detailFetched >= detailMax) break;
      if (!a?.id) continue;
      // 只对“本次新增/更新的活动”尝试拉详情，减少重复请求
      if (!freshIds.has(a.id)) continue;
      if (a.detail_attempted) continue;
      if (a.calories_kcal != null || a.kilojoules_kj != null) {
        a.detail_attempted = true;
        continue;
      }
      try {
        const d = await fetchActivityDetail({ accessToken, activityId: a.id });
        const patch = minimizeActivity(d);
        Object.assign(a, patch);
        detailFetched += 1;
      } catch {
        // 忽略单条失败，避免整次同步失败
      } finally {
        a.detail_attempted = true;
      }
    }
  }

  // next sync point: newest activity time - 60s (避免边界漏数据)
  const newest = merged[0];
  const newestEpoch = newest?.start_date ? Math.floor(new Date(newest.start_date).getTime() / 1000) : 0;
  const nextAfterEpoch = newestEpoch > 0 ? Math.max(0, newestEpoch - 60) : afterEpochFromState;

  const stats = computeSportsStats({ baseline, activities: merged, athleteStats });

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
        detailFetched,
        athleteId,
        hasAthleteStats: !!athleteStats,
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


