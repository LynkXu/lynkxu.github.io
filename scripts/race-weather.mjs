import { pathToFileURL } from 'node:url';

export function buildWeatherUrl(date, latitude, longitude) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error('日期必须是有效的 YYYY-MM-DD。');
  }
  for (const [value, limit] of [[latitude, 90], [longitude, 180]]) {
    if (value == null || String(value).trim() === '' || !Number.isFinite(Number(value)) || Math.abs(Number(value)) > limit) {
      throw new Error('请提供有效的纬度（-90 到 90）和经度（-180 到 180）。');
    }
  }
  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.search = new URLSearchParams({
    latitude, longitude, start_date: date, end_date: date,
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'Asia/Shanghai', models: 'ecmwf_ifs',
  }).toString();
  return url.href;
}

export function readWeather(data, date) {
  const daily = data.daily;
  const low = daily?.temperature_2m_min?.[0];
  const high = daily?.temperature_2m_max?.[0];
  const weatherCode = daily?.weather_code?.[0];
  if (data.timezone !== 'Asia/Shanghai' || data.utc_offset_seconds !== 28800 ||
      daily?.time?.length !== 1 || daily.time[0] !== date ||
      data.daily_units?.temperature_2m_min !== '°C' || data.daily_units?.temperature_2m_max !== '°C' ||
      data.daily_units?.weather_code !== 'wmo code' ||
      !Number.isFinite(low) || !Number.isFinite(high) || low > high || !Number.isInteger(weatherCode)) {
    throw new Error('返回的日期、时区、单位或天气数据无效；请勿写入赛事记录。');
  }
  return { low, high, weatherCode };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [date, latitude, longitude, ...extra] = process.argv.slice(2);
    if (extra.length || !date || !latitude || !longitude) {
      throw new Error('用法：npm run query:race-weather -- YYYY-MM-DD 纬度 经度');
    }
    const source = buildWeatherUrl(date, latitude, longitude);
    const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`天气查询失败：HTTP ${response.status}`);
    const data = await response.json();
    const weather = readWeather(data, date);
    console.log(JSON.stringify({
      date, latitude: Number(latitude), longitude: Number(longitude),
      ...weather, model: 'ecmwf_ifs', timezone: 'Asia/Shanghai',
      verifiedOn: new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date()),
      source,
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
