export function parseRaceTimeToSeconds(timeText) {
  const raw = String(timeText || '').trim();
  if (!/^\d+:[0-5]\d(?::[0-5]\d)?$/.test(raw)) return null;
  const parts = raw.split(':').map(Number);
  return parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
}

export function getRaceTrends(races) {
  return ['半马', '全马'].map(type => ({
    type,
    data: races
      .filter(race => race.type === type && race.status === 'completed')
      .map(race => ({ race, seconds: parseRaceTimeToSeconds(race.time) }))
      .filter(({ seconds }) => seconds != null && seconds > 0)
      .sort((a, b) => a.race.date.localeCompare(b.race.date))
      .map(({ race, seconds }) => ({
        label: `${race.date} · ${race.name}`,
        axisLabel: race.date,
        value: seconds / 60,
        displayValue: race.time,
      })),
  })).filter(group => group.data.length > 0);
}

export function getTrendScale(values, type) {
  const full = type === '全马';
  const baseStep = full ? 10 : 5;
  const low = Math.min(full ? 210 : 105, ...values);
  const high = Math.max(full ? 270 : 135, ...values);
  const step = Math.ceil((high - low) / 6 / baseStep) * baseStep;
  const min = Math.floor(low / step) * step;
  const max = Math.ceil(high / step) * step;
  const count = Math.round((max - min) / step) + 1;
  return { min, max, ticks: Array.from({ length: count }, (_, i) => min + i * step) };
}

export function formatRaceDuration(minutes) {
  const seconds = Math.round(minutes * 60);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
}
