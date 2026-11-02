import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWeatherUrl, readWeather } from './race-weather.mjs';

test('固定日期、坐标、北京时间和 ECMWF IFS 模型', () => {
  const url = new URL(buildWeatherUrl('2026-03-22', '30.63', '120.55'));
  assert.equal(url.origin, 'https://archive-api.open-meteo.com');
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    latitude: '30.63', longitude: '120.55',
    start_date: '2026-03-22', end_date: '2026-03-22',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'Asia/Shanghai', models: 'ecmwf_ifs',
  });
  for (const args of [['2026-02-30', '30', '120'], ['2026-03-22', '', '120'], ['2026-03-22', '91', '120']]) {
    assert.throws(() => buildWeatherUrl(...args));
  }
});

const response = {
  timezone: 'Asia/Shanghai', utc_offset_seconds: 28800,
  daily_units: { temperature_2m_min: '°C', temperature_2m_max: '°C', weather_code: 'wmo code' },
  daily: { time: ['2026-03-22'], temperature_2m_min: [9.1], temperature_2m_max: [20.8], weather_code: [53] },
};

test('保留原始精度，拒绝错日、错时区、缺失或颠倒的气温', () => {
  assert.deepEqual(readWeather(response, '2026-03-22'), { low: 9.1, high: 20.8, weatherCode: 53 });
  assert.throws(() => readWeather(response, '2026-03-23'));
  assert.throws(() => readWeather({ ...response, timezone: 'GMT' }, '2026-03-22'));
  for (const patch of [{ temperature_2m_min: [null] }, { temperature_2m_min: [25] }, { weather_code: [null] }]) {
    assert.throws(() => readWeather({ ...response, daily: { ...response.daily, ...patch } }, '2026-03-22'));
  }
});
