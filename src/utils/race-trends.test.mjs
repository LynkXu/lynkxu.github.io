import test from 'node:test';
import assert from 'node:assert/strict';
import { getRaceTrends, parseRaceTimeToSeconds } from './race-trends.mjs';

test('全马与半马独立、按日期排序，单场成绩保留且无效成绩不变成零', () => {
  const races = [
    { type: '全马', date: '2026-11-01', name: '杭州', status: 'completed', time: '03:58:33' },
    { type: '半马', date: '2026-03-28', name: '上海', status: 'completed', time: '01:58:51' },
    { type: '半马', date: '2026-03-22', name: '桐乡', status: 'completed', time: '01:54:22' },
    { type: '半马', date: '2026-01-01', status: 'dnf', time: '02:00:00' },
    { type: '全马', date: '2025-01-01', status: 'completed', time: 'bad' },
    { type: '全马', date: '2025-02-01', status: 'completed', time: '00:00:00' },
  ];
  const before = structuredClone(races);
  const groups = getRaceTrends(races);
  assert.deepEqual(groups.map(g => [g.type, g.data.length]), [['半马', 2], ['全马', 1]]);
  assert.deepEqual(groups[0].data.map(d => d.axisLabel), ['2026-03-22', '2026-03-28']);
  assert.equal(groups[0].data[0].value, (3600 + 54 * 60 + 22) / 60);
  assert.equal(groups[1].data[0].displayValue, '03:58:33');
  assert.match(groups[0].data[0].label, /桐乡/);
  assert.deepEqual(races, before);
  assert.deepEqual(getRaceTrends([]), []);
});

test('时间解析拒绝越界和截断输入', () => {
  assert.equal(parseRaceTimeToSeconds('03:58:33'), 14313);
  assert.equal(parseRaceTimeToSeconds('54:22'), 3262);
  for (const value of ['', '1:99:00', '01:20:30x', '-1:20:30']) {
    assert.equal(parseRaceTimeToSeconds(value), null);
  }
});

test('半马和全马使用更宽的固定范围与易读间隔', async () => {
  const { getTrendScale } = await import('./race-trends.mjs');
  assert.deepEqual(getTrendScale([114.36, 118.85], '半马'), {
    min: 105, max: 135, ticks: [105, 110, 115, 120, 125, 130, 135],
  });
  assert.deepEqual(getTrendScale([238.55], '全马'), {
    min: 210, max: 270, ticks: [210, 220, 230, 240, 250, 260, 270],
  });
});

test('两侧刻度独立覆盖成绩，单场成绩也有有限刻度', async () => {
  const { getTrendScale } = await import('./race-trends.mjs');
  for (const values of [[114.36, 118.85], [238.55], [120, 120], [114.9, 120.9], [110, 800], [1, 2]]) {
    const scale = getTrendScale(values);
    assert.ok(scale.ticks.length <= 9);
    assert.ok(scale.min <= Math.min(...values));
    assert.ok(scale.max >= Math.max(...values));
    assert.ok(scale.max > scale.min);
    assert.equal(scale.ticks[1] - scale.ticks[0], scale.ticks[2] - scale.ticks[1]);
  }
});

test('纵坐标按时分秒显示，正确处理分钟小数和进位', async () => {
  const { formatRaceDuration } = await import('./race-trends.mjs');
  assert.equal(formatRaceDuration(112), '01:52:00');
  assert.equal(formatRaceDuration(238.5), '03:58:30');
  assert.equal(formatRaceDuration(59.999), '01:00:00');
});
